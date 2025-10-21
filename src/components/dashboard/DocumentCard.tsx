import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, HardDrive, Loader2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { isPolicyOutdated, formatPolicyDate, getPolicyAgeDescription } from '@/lib/policyDateUtils';

interface DocumentCardProps {
  id: string;
  title: string;
  targetRole: 'administrator' | 'executive' | 'board' | 'company_operator' | 'system_owner';
  createdAt: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  policyDate?: string | null; // Format: "Month-Year" e.g., "February-2024"
  metadata?: {
    file_size?: number;
    page_count?: number;
  };
  isSelected?: boolean;
  onClick: () => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  id,
  title,
  targetRole,
  createdAt,
  processingStatus = 'completed',
  policyDate,
  metadata,
  isSelected,
  onClick,
}) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator': return 'bg-blue-100 text-blue-800';
      case 'executive': return 'bg-purple-100 text-purple-800';
      case 'board': return 'bg-green-100 text-green-800';
      case 'company_operator': return 'bg-orange-100 text-orange-800';
      case 'system_owner': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator': return 'Admin';
      case 'executive': return 'Executive';
      case 'board': return 'Board';
      case 'company_operator': return 'Operator';
      case 'system_owner': return 'System';
      default: return role;
    }
  };

  const getProcessingStatusBadge = () => {
    switch (processingStatus) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ready
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const isProcessing = processingStatus === 'pending' || processingStatus === 'processing';
  const isOutdated = isPolicyOutdated(policyDate);
  const ageDescription = getPolicyAgeDescription(policyDate);

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${isProcessing ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <FileText className="h-5 w-5 text-gray-500 flex-shrink-0 mt-1" />
          <Badge className={getRoleBadgeColor(targetRole)} variant="secondary">
            {getRoleLabel(targetRole)}
          </Badge>
        </div>
        <CardTitle className="text-base line-clamp-2 mt-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-600 space-y-2">
        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {getProcessingStatusBadge()}

          {/* Outdated Policy Badge */}
          {isOutdated && (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-300"
              title={ageDescription || 'Policy older than 18 months'}
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Outdated
            </Badge>
          )}
        </div>

        {/* Document metadata */}
        {policyDate && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatPolicyDate(policyDate)}</span>
            {ageDescription && (
              <span className="text-xs text-gray-500">({ageDescription})</span>
            )}
          </div>
        )}
        {metadata?.file_size && (
          <div className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>{formatFileSize(metadata.file_size)}</span>
          </div>
        )}
        {metadata?.page_count && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{metadata.page_count} pages</span>
          </div>
        )}

        {/* Processing message */}
        {isProcessing && (
          <div className="text-xs text-gray-500 italic mt-2">
            {processingStatus === 'pending'
              ? 'Waiting to be processed...'
              : 'Extracting content and generating embeddings...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
