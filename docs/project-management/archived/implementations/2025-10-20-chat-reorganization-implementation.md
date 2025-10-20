# Chat Component Reorganization - Implementation Summary

**Date**: 2025-10-20
**Status**: ✅ Phase 1 COMPLETE | 📋 Phase 2 Pending
**Story**: 1.14.4 - Chat Component Reorganization

---

## Implementation Progress

### ✅ Completed Tasks

1. **Three-Panel Chat Interface Layout**
   - Left Panel: Chat History Sidebar (existing - ChatHistorySidebar.tsx)
   - Center Panel: Chat Messages (existing - ChatArea.tsx from backup)
   - Right Panel: Sources Sidebar (NEW - shows all accessible documents)

2. **SourcesSidebar Component** (`src/components/chat/SourcesSidebar.tsx`)
   - Lists all documents accessible to user (RLS-filtered)
   - Shows processing status (completed/processing/failed)
   - Icons for different source types (PDF, URL, YouTube, text)
   - Click to navigate to dashboard with document selected
   - Empty state when no documents available

3. **Updated ChatInterface Component** (`src/components/chat/ChatInterface.tsx`)
   - Integrated three-panel resizable layout
   - Desktop: Side-by-side panels (History 20% | Chat 50% | Sources 30%)
   - Mobile: Stack with toggle
   - Proper citation handling (navigates to dashboard)

4. **Database Migration** (`20251019192830_link_documents_to_chat_sessions.sql`)
   - Created `chat_session_documents` junction table
   - RLS policies for viewing/linking/unlinking documents
   - Indexes for performance
   - Applied successfully to production

5. **Legacy Component Archival**
   - ✅ `Notebook.tsx` → `src/pages/archive/Notebook.tsx`
   - ✅ `ChatAreaCopilotKit.tsx` → `src/components/notebook/archive/ChatAreaCopilotKit.tsx`
   - Git history preserved

---

## Current Chat Flow

### User Creates New Chat
1. Click "New Chat" from Dashboard → `UserGreetingCard`
2. Creates session via `useCreateChatSession` hook
3. Navigates to `/chat/{sessionId}`
4. ChatInterface loads with:
   - Chat history sidebar (left)
   - Chat area (center) - uses legacy ChatArea.tsx
   - Sources sidebar (right) - shows ALL accessible documents

### The "0 Sources" Issue

**Problem**: When user creates a new chat, it shows "0 sources" in the chat input.

**Root Cause**: The `ChatArea.tsx` component checks for sources linked to the `notebookId` (now `chatSessionId`), but new chat sessions have NO linked documents by default.

**Two Solutions**:

#### Option A: Auto-link all accessible documents to chat (Recommended)
When chat session is created, automatically link all documents accessible to the user.

**Pros**:
- User can chat immediately
- All their documents are available for context
- Simpler UX

**Cons**:
- May include documents user doesn't want in this chat
- Could be a lot of documents for some users

#### Option B: Manual document selection
User manually selects which documents to include in the chat.

**Pros**:
- User has full control
- Can create focused chats with specific documents

**Cons**:
- Extra step before chatting
- More complex UX

---

## Next Steps (Phase 2)

### 1. Fix "0 Sources" Issue

**Recommended Approach**: Auto-link accessible documents

**Implementation**:

#### A. Update `useCreateChatSession` Hook

**File**: `src/hooks/useChatSession.tsx`

```typescript
export const useCreateChatSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Create chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: user.id,
          title: title || 'New Chat',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Get all accessible documents (RLS will filter)
      const { data: documents, error: docsError } = await supabase
        .from('sources')
        .select('id')
        .eq('type', 'pdf')
        .eq('processing_status', 'completed');

      if (docsError) {
        console.error('Error fetching documents:', docsError);
        // Don't fail the chat creation, just log the error
      }

      // 3. Link documents to chat session
      if (documents && documents.length > 0) {
        const links = documents.map(doc => ({
          chat_session_id: session.id,
          source_id: doc.id,
          added_by_user_id: user.id,
        }));

        const { error: linkError } = await supabase
          .from('chat_session_documents')
          .insert(links);

        if (linkError) {
          console.error('Error linking documents:', linkError);
          // Don't fail the chat creation
        }
      }

      return session as ChatSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
};
```

#### B. Update ChatArea to Use chat_session_documents

**File**: `src/components/notebook/ChatArea.tsx`

Currently, ChatArea uses `useSources(notebookId)` which queries sources directly.

Need to update to query `chat_session_documents` to get linked sources:

```typescript
// Current:
const { sources } = useSources(notebookId);

// Should be:
const { sources } = useChatSessionDocuments(chatSessionId);
```

**New Hook**: `src/hooks/useChatSessionDocuments.tsx`

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useChatSessionDocuments = (chatSessionId?: string) => {
  const { data: sources, isLoading, error } = useQuery({
    queryKey: ['chat-session-documents', chatSessionId],
    queryFn: async () => {
      if (!chatSessionId) return [];

      // Query junction table and join with sources
      const { data, error } = await supabase
        .from('chat_session_documents')
        .select(`
          source_id,
          sources:source_id (
            id,
            title,
            type,
            processing_status,
            created_at,
            url,
            pdf_file_path,
            pdf_storage_bucket
          )
        `)
        .eq('chat_session_id', chatSessionId);

      if (error) throw error;

      // Flatten the structure
      return data.map(item => item.sources).filter(Boolean);
    },
    enabled: !!chatSessionId,
  });

  return {
    sources: sources || [],
    isLoading,
    error: error?.message,
  };
};
```

---

### 2. Citation Viewer with PDF Highlight + Markdown Toggle

**Current Behavior**:
- Citations in chat messages are clickable
- Click navigates to dashboard with document ID
- Dashboard opens PDF in right panel

**Enhanced Behavior**:
- Add toggle button in chat interface
- **PDF Mode**: Highlight exact text in PDF using react-pdf
- **Markdown Mode**: Show extracted text with formatting

**Implementation**:

#### A. Update Citation Data Structure

Ensure citations include:
```typescript
{
  source_id: string;
  page_number: number;
  text: string; // Exact text to highlight
  bbox?: { // Bounding box for PDF highlight
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

#### B. Create Citation Viewer Component

**File**: `src/components/chat/CitationViewer.tsx`

```typescript
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, FilePdf, X } from 'lucide-react';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import MarkdownRenderer from '@/components/chat/MarkdownRenderer';
import { Citation } from '@/types/message';

interface CitationViewerProps {
  citation: Citation;
  onClose: () => void;
}

export const CitationViewer: React.FC<CitationViewerProps> = ({
  citation,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'pdf' | 'markdown'>('pdf');

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Citation</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* View Mode Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="pdf" className="gap-2">
            <FilePdf className="h-4 w-4" />
            PDF View
          </TabsTrigger>
          <TabsTrigger value="markdown" className="gap-2">
            <FileText className="h-4 w-4" />
            Text View
          </TabsTrigger>
        </TabsList>

        {/* PDF View */}
        <TabsContent value="pdf" className="flex-1 m-0">
          <PDFViewer
            fileUrl={citation.fileUrl}
            fileName={citation.title}
            initialPage={citation.page_number}
            highlightText={citation.text}
          />
        </TabsContent>

        {/* Markdown View */}
        <TabsContent value="markdown" className="flex-1 m-0 p-4 overflow-auto">
          <div className="prose prose-sm max-w-none">
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              Page {citation.page_number}
            </h4>
            <MarkdownRenderer content={citation.text} />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
```

#### C. Update PDFViewer to Support Text Highlighting

The `PDFViewer` component already exists, but needs enhancement to highlight text:

**Add to `src/components/pdf/PDFViewer.tsx`**:

```typescript
interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  initialPage?: number;
  highlightText?: string; // NEW: Text to highlight
}

// In the component:
// Use react-pdf's text layer to find and highlight matching text
// This requires the text layer to be enabled
```

---

### 3. Add Document Linking UI

Add a button in SourcesSidebar to manually link/unlink documents:

```typescript
// In SourcesSidebar.tsx
const handleToggleLink = async (sourceId: string, isLinked: boolean) => {
  if (isLinked) {
    // Unlink
    await supabase
      .from('chat_session_documents')
      .delete()
      .eq('chat_session_id', chatSessionId)
      .eq('source_id', sourceId);
  } else {
    // Link
    await supabase
      .from('chat_session_documents')
      .insert({
        chat_session_id: chatSessionId,
        source_id: sourceId,
        added_by_user_id: user.id,
      });
  }

  queryClient.invalidateQueries(['chat-session-documents']);
};
```

---

## Testing Checklist

### ✅ Completed Tests

- [x] Chat session creation from Dashboard
- [x] ChatInterface renders three panels on desktop
- [x] SourcesSidebar shows accessible documents
- [x] Navigation to dashboard from source click works
- [x] Database migration applied successfully
- [x] RLS policies enforce user access

### 📋 Pending Tests

- [ ] Send message in chat (N8N integration)
- [ ] Receive AI response with citations
- [ ] Citation click opens PDF with highlight
- [ ] Toggle between PDF and Markdown view
- [ ] Link/unlink documents from chat
- [ ] Test with all 5 user roles:
  - [ ] Administrator
  - [ ] Executive
  - [ ] Board
  - [ ] Company Operator
  - [ ] System Owner
- [ ] Mobile responsive layout
- [ ] Chat history persistence
- [ ] Document filtering by chat session

---

## Files Created/Modified

### Created Files
1. `src/components/chat/SourcesSidebar.tsx` - Document list sidebar
2. `supabase/migrations/20251019192830_link_documents_to_chat_sessions.sql` - Junction table migration
3. `CHAT-REORGANIZATION-IMPLEMENTATION.md` - This document

### Modified Files
1. `src/components/chat/ChatInterface.tsx` - Added three-panel layout with SourcesSidebar
2. `src/components/dashboard/UserGreetingCard.tsx` - Fixed new chat navigation (earlier)

### Archived Files (Already Done)
1. `src/pages/Notebook.tsx` → `src/pages/archive/Notebook.tsx`
2. `src/components/notebook/ChatAreaCopilotKit.tsx` → `src/components/notebook/archive/ChatAreaCopilotKit.tsx`

---

## Known Issues

### 1. "0 Sources" in Chat Input ❌
**Status**: Not fixed yet
**Impact**: Users cannot send messages in new chats
**Solution**: Implement auto-linking in Phase 2 (above)

### 2. Citations Not Highlighting PDF ❌
**Status**: Feature not implemented yet
**Impact**: Citations work but don't highlight in PDF
**Solution**: Enhance PDFViewer component (Phase 2)

---

## Next Action Required

**Choose an approach for the "0 Sources" issue**:

1. **Option A (Recommended)**: Auto-link all accessible documents
   - Simpler for users
   - Chat works immediately
   - Implements: Update `useCreateChatSession` hook

2. **Option B**: Manual document selection
   - More control for users
   - Requires UI for selecting documents
   - Implements: Add document picker to chat creation flow

**Recommend**: Option A for MVP, add Option B features later for advanced users.

---

## Architecture Notes

### Why Three Panels?

The old Notebook.tsx had three panels:
1. Sources (left) - Document list and citation viewer
2. Chat (center) - Messages
3. Studio (right) - Notes

The new ChatInterface has:
1. History (left) - Previous chat sessions
2. Chat (center) - Messages
3. Sources (right) - Available documents

This separates concerns:
- **Chat history**: Navigate between conversations
- **Chat area**: Current conversation
- **Sources**: Documents for context

### Why Junction Table?

The `chat_session_documents` table enables:
- Many-to-many relationship (chat ↔ documents)
- Track when documents were added
- Filter documents by chat session
- Show only relevant documents in chat
- Audit trail for compliance

### Why Keep ChatArea.tsx Intact?

The legacy `ChatArea.tsx` has:
- Working N8N webhook integration
- SSE streaming responses
- Role-based chat context
- Citation parsing
- Message rendering

Wrapping it in `ChatInterface` preserves all this functionality while improving organization.

---

**Status**: Ready for Phase 2 implementation
**Blockers**: None
**Next Session**: Implement auto-linking or manual selection based on user preference
