import React, { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentCard } from './DocumentCard';
import { DocumentFilters } from './DocumentFilters';
import { EmptyDocuments } from './EmptyDocuments';
import { Loader2 } from 'lucide-react';

interface DocumentGridProps {
  onDocumentSelect?: (documentId: string) => void;
  onUploadClick?: () => void;
  selectedDocumentId?: string | null;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  onDocumentSelect,
  onUploadClick,
  selectedDocumentId,
}) => {
  const { documents, isLoading, error } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'title-asc' | 'title-desc'>('recent');

  // Filter documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || doc.target_role === roleFilter;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        Error loading documents: {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return <EmptyDocuments onUploadClick={onUploadClick} />;
  }

  return (
    <div className="space-y-4">
      <DocumentFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {filteredDocuments.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          No documents match your filters
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              targetRole={doc.target_role}
              createdAt={doc.created_at}
              processingStatus={doc.processing_status}
              metadata={doc.metadata}
              isSelected={selectedDocumentId === doc.id}
              onClick={() => onDocumentSelect?.(doc.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
