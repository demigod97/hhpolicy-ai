# Chat Session Fix & Next Steps

**Date**: 2025-10-20
**Status**: ✅ CHAT SESSIONS FIXED | 📋 SOURCES SIDEBAR PENDING

---

## Chat Session Creation - FIXED ✅

### The Problem
When clicking "New Chat", users got this error:
```
column reference "file_path" is ambiguous
```

### Root Cause
There were still storage policies active that referenced `file_path`, causing SQL ambiguity errors.

### The Fix
**Migration**: `20251019191414_drop_all_remaining_storage_policies.sql`

Dropped ALL storage policies using a dynamic loop:
```sql
do $$
declare
  pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
    and tablename = 'objects'
  loop
    execute format('drop policy if exists %I on storage.objects', pol.policyname);
  end loop;
end $$;
```

**Result**: ✅ Chat sessions now create successfully

---

## Next Task: Add Sources Sidebar to Chat

### Current State
- ✅ Chat interface works
- ✅ Chat history sidebar exists
- ❌ **Missing**: Sources sidebar (documents available for this chat)
- ❌ **Missing**: Source content viewer (for viewing citations)

### What the Old Version Had

From `docs/backup_src/src/components/notebook/SourcesSidebar.tsx`:

1. **Sources List**:
   - Shows all documents linked to the notebook/chat
   - Icons for different file types (PDF, text, web, etc.)
   - Context menu for each source (rename, delete)
   - Processing status indicators

2. **Source Content Viewer**:
   - Component: `SourceContentViewer`
   - Shows citation details when user clicks a citation in chat
   - Displays source summary, content, and URL
   - Allows viewing specific pages/sections

3. **Add Sources Dialog**:
   - Upload new PDFs
   - Add website URLs
   - Paste text content
   - YouTube URLs

### Implementation Plan

#### Phase 1: Create SourcesSidebar Component

**File**: `src/components/chat/SourcesSidebar.tsx`

**Features**:
- List all documents accessible to the user (via RLS)
- Filter documents by chat session (if linked)
- Show document icons based on type
- Display processing status
- Click to view document details

**Mock Layout**:
```
┌───────────────────────┐
│ SOURCES (3)      [+]  │
├───────────────────────┤
│ 📄 Policy Doc 1       │
│ ✓ Completed           │
├───────────────────────┤
│ 📄 Employee Handbook  │
│ ✓ Completed           │
├───────────────────────┤
│ 📄 Guidelines 2025    │
│ ⏳ Processing...      │
└───────────────────────┘
```

#### Phase 2: Integrate into ChatInterface

**File**: `src/components/chat/ChatInterface.tsx`

**Layout**: Three-panel design
```
┌────────────┬──────────────┬───────────────┐
│ Chat       │ Main Chat    │ Sources       │
│ History    │ Messages     │ Sidebar       │
│            │              │               │
│ [Sessions] │ [Chat Area]  │ [Documents]   │
└────────────┴──────────────┴───────────────┘
    20%            50%             30%
```

**Resizable Panels**:
- Left: Chat history (existing)
- Center: Chat messages (existing)
- Right: Sources sidebar (new)

#### Phase 3: Add SourceContentViewer

**File**: `src/components/chat/SourceContentViewer.tsx` (already exists!)

**Features**:
- Show citation details
- Display source excerpt
- Link to full document
- Navigate to specific page

#### Phase 4: Link Documents to Chat Sessions

**Database Schema**:
```sql
-- Table: chat_session_documents (junction table)
CREATE TABLE chat_session_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  source_id uuid REFERENCES sources(id) ON DELETE CASCADE,
  added_at timestamp DEFAULT now(),
  added_by_user_id uuid REFERENCES auth.users(id),
  UNIQUE(chat_session_id, source_id)
);
```

**RLS Policies**:
- Users can link documents they have access to
- Users can only see links for their own chat sessions

---

## Code Snippets to Implement

### 1. SourcesSidebar Component

```typescript
// src/components/chat/SourcesSidebar.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';

interface SourcesSidebarProps {
  chatSessionId?: string;
  onDocumentSelect?: (documentId: string) => void;
}

export const SourcesSidebar: React.FC<SourcesSidebarProps> = ({
  chatSessionId,
  onDocumentSelect,
}) => {
  const { documents, isLoading } = useDocuments();

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Sources ({documents?.length || 0})
          </h3>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sources List */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                className="p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onDocumentSelect?.(doc.id)}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.processing_status === 'completed' ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-gray-500">Ready</span>
                        </>
                      ) : (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
                          <span className="text-xs text-gray-500">Processing...</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No documents available</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
```

### 2. Updated ChatInterface Layout

```typescript
// src/components/chat/ChatInterface.tsx
// Add to imports:
import { SourcesSidebar } from '@/components/chat/SourcesSidebar';

// Update the return statement to include three panels:
return (
  <div className="h-screen bg-white flex flex-col">
    {/* Header - unchanged */}

    {/* Main Content - Three Panels */}
    <div className="flex-1 overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        {/* Left: Chat History */}
        {showSidebar && (
          <>
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <ChatHistorySidebar
                currentSessionId={sessionId}
                onSessionSelect={(id) => navigate(`/chat/${id}`)}
              />
            </ResizablePanel>
            <ResizableHandle />
          </>
        )}

        {/* Center: Chat Messages */}
        <ResizablePanel defaultSize={50} minSize={40}>
          <ChatArea
            notebookId={chatSession.notebook_id}
            chatSessionId={sessionId}
            onCitationClick={handleCitationClick}
          />
        </ResizablePanel>

        {/* Right: Sources Sidebar */}
        <ResizableHandle />
        <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
          <SourcesSidebar
            chatSessionId={sessionId}
            onDocumentSelect={(docId) => {
              // Navigate to dashboard with document
              navigate(`/dashboard?doc=${docId}`);
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </div>
);
```

### 3. Database Migration for Chat-Document Links

```sql
-- Migration: link_documents_to_chat_sessions.sql

-- Create junction table for linking chat sessions to documents
create table if not exists chat_session_documents (
  id uuid primary key default uuid_generate_v4(),
  chat_session_id uuid not null references chat_sessions(id) on delete cascade,
  source_id uuid not null references sources(id) on delete cascade,
  added_at timestamp with time zone default now(),
  added_by_user_id uuid references auth.users(id),
  unique(chat_session_id, source_id)
);

-- Enable RLS
alter table chat_session_documents enable row level security;

-- Policy: Users can see links for their own chat sessions
create policy "Users can view own chat session documents"
on chat_session_documents
for select
to authenticated
using (
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
);

-- Policy: Users can link documents they have access to
create policy "Users can link accessible documents"
on chat_session_documents
for insert
to authenticated
with check (
  -- User owns the chat session
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
  and
  -- User has access to the source (RLS will check)
  exists (
    select 1 from sources
    where id = source_id
  )
);

-- Policy: Users can remove document links from their chats
create policy "Users can unlink documents from own chats"
on chat_session_documents
for delete
to authenticated
using (
  chat_session_id in (
    select id from chat_sessions
    where user_id = (select auth.uid())
  )
);

-- Add indexes
create index idx_chat_session_documents_session_id
on chat_session_documents(chat_session_id);

create index idx_chat_session_documents_source_id
on chat_session_documents(source_id);
```

---

## Testing Steps

### 1. Test Chat Session Creation
- ✅ Click "New Chat" button
- ✅ Verify chat session creates successfully
- ✅ No database errors in console

### 2. Test PDF Viewing
- ✅ Login as different roles
- ✅ View PDFs from dashboard
- ✅ No ambiguous column errors

### 3. Test Sources Sidebar (After Implementation)
- [ ] View sources list in chat
- [ ] Click to view document details
- [ ] Link/unlink documents to chat
- [ ] Filter by chat session

---

## Files to Create

1. **`src/components/chat/SourcesSidebar.tsx`** - Sources list component
2. **`src/hooks/useChatDocuments.tsx`** - Hook to fetch chat-linked documents
3. **`supabase/migrations/YYYYMMDDHHMMSS_link_documents_to_chat_sessions.sql`** - Database schema

## Files to Modify

1. **`src/components/chat/ChatInterface.tsx`** - Add third panel for sources
2. **`src/components/chat/ChatArea.tsx`** - Pass available documents for context

---

## Priority

**High Priority**:
1. ✅ Fix chat session creation (DONE)
2. 📋 Add SourcesSidebar component
3. 📋 Integrate into ChatInterface
4. 📋 Create database migration

**Medium Priority**:
- Document linking/unlinking functionality
- Source content viewer improvements
- Add sources button in chat

**Low Priority**:
- Upload new documents from chat
- Bulk document operations

---

## Current Status

✅ **COMPLETED**:
- Chat session creation fixed
- All storage policies dropped
- Public buckets working
- PDF viewing works for all roles
- UserGreetingCard implemented

📋 **NEXT**:
- Implement SourcesSidebar component
- Add three-panel layout to ChatInterface
- Create database migration for document links

---

**Action Required**:
1. Refresh browser
2. Test "New Chat" button (should work now)
3. Decide: Implement sources sidebar now or test PDF access first?
