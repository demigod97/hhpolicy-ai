import React, { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SearchableSection {
  id: string;
  title: string;
  keywords: string[];
}

interface HelpSearchProps {
  sections: SearchableSection[];
  onSectionMatch: (matchedSections: string[]) => void;
  onClear: () => void;
}

/**
 * HelpSearch - Client-side search component for help documentation
 * Searches through section titles and keywords
 */
export const HelpSearch: React.FC<HelpSearchProps> = ({
  sections,
  onSectionMatch,
  onClear,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      onClear();
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const matchedIds = sections
      .filter(section =>
        section.title.toLowerCase().includes(lowerQuery) ||
        section.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
      )
      .map(section => section.id);

    onSectionMatch(matchedIds);
  }, [sections, onSectionMatch, onClear]);

  const handleClear = useCallback(() => {
    setQuery('');
    onClear();
  }, [onClear]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search help topics..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
        aria-label="Search help documentation"
      />
      {query && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Help section data for search - exported for use in Help.tsx
// Organized by tabs for the new structure
export const HELP_SECTIONS: SearchableSection[] = [
  // Tab 1: User Guide
  {
    id: 'getting-started',
    title: 'Getting Started',
    keywords: ['quick start', 'begin', 'welcome', 'introduction', 'new user', 'first steps', 'how to'],
  },
  {
    id: 'dashboard-documents',
    title: 'Dashboard & Documents',
    keywords: ['dashboard', 'documents', 'view', 'browse', 'filter', 'search', 'status', 'pdf viewer'],
  },
  {
    id: 'chat-qa',
    title: 'Chat & Policy Q&A',
    keywords: ['chat', 'question', 'answer', 'ai', 'ask', 'policy', 'citation', 'search', 'conversation'],
  },
  {
    id: 'settings-profile',
    title: 'Settings & Profile',
    keywords: ['settings', 'profile', 'password', 'account', 'display name', 'preferences'],
  },
  // Tab 2: Templates & Upload
  {
    id: 'templates',
    title: 'Template Library',
    keywords: ['template', 'download', 'policy template', 'process', 'checklist', 'word document', 'docx', 'preview'],
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    keywords: ['upload', 'add document', 'file', 'pdf', 'metadata', 'import', 'submit'],
  },
  {
    id: 'processing-status',
    title: 'Processing & Status',
    keywords: ['processing', 'status', 'progress', 'complete', 'error', 'failed', 'pending'],
  },
  // Tab 3: Roles & Access
  {
    id: 'your-role',
    title: 'Your Role',
    keywords: ['my role', 'current role', 'what can i do', 'my permissions', 'my access'],
  },
  {
    id: 'all-roles',
    title: 'All Roles Explained',
    keywords: ['roles', 'system owner', 'company operator', 'general', 'executive', 'board', 'administrator'],
  },
  {
    id: 'permission-matrix',
    title: 'Permission Matrix',
    keywords: ['permissions', 'matrix', 'table', 'who can', 'access control', 'capabilities'],
  },
  {
    id: 'access-security',
    title: 'Access Levels & Security',
    keywords: ['access level', 'security', 'rbac', 'visibility', 'restricted', 'confidential', 'public'],
  },
  // Tab 4: FAQ & Support
  {
    id: 'general-questions',
    title: 'General Questions',
    keywords: ['faq', 'question', 'help', 'why', 'how', 'what'],
  },
  {
    id: 'technical-issues',
    title: 'Technical Issues',
    keywords: ['problem', 'issue', 'error', 'troubleshooting', 'not working', 'bug', 'fix'],
  },
  {
    id: 'contact-support',
    title: 'Contact & Support',
    keywords: ['contact', 'support', 'help desk', 'company operator', 'assistance', 'feedback'],
  },
];

// Tab mapping for section IDs
export const SECTION_TAB_MAP: Record<string, string> = {
  'getting-started': 'user-guide',
  'dashboard-documents': 'user-guide',
  'chat-qa': 'user-guide',
  'settings-profile': 'user-guide',
  'templates': 'templates-upload',
  'document-upload': 'templates-upload',
  'processing-status': 'templates-upload',
  'your-role': 'roles-access',
  'all-roles': 'roles-access',
  'permission-matrix': 'roles-access',
  'access-security': 'roles-access',
  'general-questions': 'faq-support',
  'technical-issues': 'faq-support',
  'contact-support': 'faq-support',
};

export default HelpSearch;
