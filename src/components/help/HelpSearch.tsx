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
export const HELP_SECTIONS: SearchableSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    keywords: ['quick start', 'begin', 'welcome', 'introduction', 'new user', 'first steps', 'how to'],
  },
  {
    id: 'templates',
    title: 'Templates',
    keywords: ['template', 'download', 'policy template', 'process', 'checklist', 'word document', 'docx'],
  },
  {
    id: 'document-upload',
    title: 'Document Upload',
    keywords: ['upload', 'add document', 'file', 'pdf', 'metadata', 'processing', 'import'],
  },
  {
    id: 'roles-permissions',
    title: 'Roles & Permissions',
    keywords: ['role', 'permission', 'access', 'system owner', 'company operator', 'general', 'executive', 'board', 'user'],
  },
  {
    id: 'access-security',
    title: 'Access Levels & Security',
    keywords: ['access level', 'security', 'rbac', 'visibility', 'restricted', 'confidential', 'public'],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    keywords: ['faq', 'question', 'help', 'problem', 'issue', 'error', 'troubleshooting', 'cannot see', 'processing'],
  },
];

export default HelpSearch;
