import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Shield, ExternalLink } from 'lucide-react';
import { Citation } from '@/types/message';

interface PolicyCitationComponentProps {
  citation: Citation;
  citationNumber: number;
  userRole?: string;
  onClick: () => void;
  className?: string;
}

const PolicyCitationComponent = ({
  citation,
  citationNumber,
  userRole,
  onClick,
  className = ''
}: PolicyCitationComponentProps) => {

  const getRoleColor = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'administrator':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'executive':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatSourceType = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return 'PDF Document';
      case 'text':
        return 'Text Document';
      case 'website':
        return 'Web Page';
      case 'youtube':
        return 'Video Content';
      default:
        return 'Document';
    }
  };

  const formatExcerpt = (citation: Citation): string => {
    if (citation.excerpt) {
      return citation.excerpt;
    }

    if (citation.chunk_lines_from && citation.chunk_lines_to) {
      return `Lines ${citation.chunk_lines_from}-${citation.chunk_lines_to}`;
    }

    if (citation.chunk_index !== undefined) {
      return `Section ${citation.chunk_index + 1}`;
    }

    return 'Referenced content';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={`inline-flex items-center justify-center h-6 min-w-6 px-2 ml-1 text-xs font-medium text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-full transition-colors ${className}`}
          >
            <FileText className="h-3 w-3 mr-1" />
            {citationNumber}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-3">
          <div className="space-y-2">
            {/* Source Title */}
            <div className="font-medium text-sm text-gray-900 truncate">
              {citation.source_title}
            </div>

            {/* Source Type and Role Badge */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formatSourceType(citation.source_type)}
              </Badge>
              {userRole && (
                <Badge className={`text-xs ${getRoleColor(userRole)}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {userRole}
                </Badge>
              )}
            </div>

            {/* Excerpt/Reference Info */}
            <div className="text-xs text-gray-600">
              {formatExcerpt(citation)}
            </div>

            {/* Click to view hint */}
            <div className="flex items-center text-xs text-blue-600">
              <ExternalLink className="h-3 w-3 mr-1" />
              Click to view source
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PolicyCitationComponent;