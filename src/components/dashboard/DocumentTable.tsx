import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FileText,
  MoreVertical,
  Eye,
  Download,
  Trash2,
  UserCog,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  Loader2,
  XCircle,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Document } from '@/hooks/useDocuments';
import { useDocumentTable, SortColumn } from '@/hooks/useDocumentTable';
import { useDocumentFilters } from '@/hooks/useDocumentFilters';
import { DocumentTableFilters } from './DocumentTableFilters';
import { DocumentTableBulkActions } from './DocumentTableBulkActions';
import { DocumentTablePagination } from './DocumentTablePagination';
import { DocumentTableEmpty } from './DocumentTableEmpty';
import {
  isPolicyOutdated,
  formatPolicyDate,
  getPolicyAgeDescription,
} from '@/lib/policyDateUtils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onDocumentSelect?: (documentId: string) => void;
  onUploadClick?: () => void;
  selectedDocumentId?: string | null;
  canUpload?: boolean;
  canManage?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  isLoading,
  onDocumentSelect,
  onUploadClick,
  selectedDocumentId,
  canUpload = false,
  canManage = false,
}) => {
  const { toast } = useToast();
  const {
    selectedRows,
    sort,
    page,
    pageSize,
    handleSort,
    toggleRowSelection,
    toggleAllRows,
    clearSelection,
    setPage,
    setPageSize,
    sortDocuments,
    paginateDocuments,
  } = useDocumentTable();

  const {
    filters,
    updateFilter,
    clearFilters,
    filterDocuments,
    activeFilterCount,
    activeFilterChips,
  } = useDocumentFilters();

  // Apply filters, sort, and pagination
  const filteredDocs = filterDocuments(documents);
  const sortedDocs = sortDocuments(filteredDocs);
  const paginatedDocs = paginateDocuments(sortedDocs);

  // Get all IDs on current page for "select all"
  const currentPageIds = paginatedDocs.map(doc => doc.id);
  const allSelected = currentPageIds.length > 0 && currentPageIds.every(id => selectedRows.has(id));
  const someSelected = currentPageIds.some(id => selectedRows.has(id));

  const handleRowClick = (doc: Document) => {
    if (doc.processing_status === 'pending' || doc.processing_status === 'processing') {
      toast({
        title: 'Document Processing',
        description: 'This document is still being processed. Please wait.',
        variant: 'default',
      });
      return;
    }

    if (doc.processing_status === 'failed') {
      toast({
        title: 'Processing Failed',
        description: 'This document failed to process. Please try re-uploading.',
        variant: 'destructive',
      });
      return;
    }

    onDocumentSelect?.(doc.id);
  };

  const handleDelete = async (documentId: string) => {
    try {
      const { error } = await supabase
        .from('sources')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Document deleted',
        description: 'Document has been successfully deleted.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Error',
        description: `Failed to delete document: ${errorMessage}`,
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'executive':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'board':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'company_operator':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'system_owner':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrator':
        return 'Admin';
      case 'executive':
        return 'Executive';
      case 'board':
        return 'Board';
      case 'company_operator':
        return 'Operator';
      case 'system_owner':
        return 'System';
      default:
        return role;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 gap-1">
            <CheckCircle className="h-3 w-3" />
            Ready
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPolicyDateBadge = (policyDate: string | null | undefined) => {
    if (!policyDate) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 gap-1">
          <Calendar className="h-3 w-3" />
          Date Missing
        </Badge>
      );
    }

    const isOutdated = isPolicyOutdated(policyDate);
    const ageDescription = getPolicyAgeDescription(policyDate);

    if (isOutdated) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">{formatPolicyDate(policyDate)}</span>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-300 gap-1"
            title={ageDescription || 'Policy older than 18 months'}
          >
            <AlertTriangle className="h-3 w-3" />
            Outdated
          </Badge>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{formatPolicyDate(policyDate)}</span>
        {ageDescription && (
          <span className="text-xs text-gray-500">({ageDescription})</span>
        )}
      </div>
    );
  };

  const SortIcon: React.FC<{ column: SortColumn }> = ({ column }) => {
    if (sort.column !== column) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sort.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div
        className="space-y-2"
        style={{ marginLeft: '8%', marginRight: '10%' }}
      >
        <DocumentTableFilters
          filters={filters}
          onSearchChange={(value) => updateFilter('search', value)}
          onRoleFilterChange={(roles) => updateFilter('roles', roles)}
          onStatusFilterChange={(statuses) => updateFilter('statuses', statuses)}
          onOutdatedToggle={(value) => updateFilter('showOutdatedOnly', value)}
          activeFilterCount={activeFilterCount}
          activeFilterChips={activeFilterChips}
          onClearFilters={clearFilters}
        />

        <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm mx-2">
          <Table>
            <TableHeader className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b-2 border-blue-200">
              <TableRow className="bg-gray-100 hover:bg-gray-100">
                <TableHead className="w-[50px] font-semibold">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead className="font-semibold">Document Name</TableHead>
                <TableHead className="font-semibold">Policy Date</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Uploaded</TableHead>
                <TableHead className="w-[50px] font-semibold"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <DocumentTableEmpty
        variant="no-documents"
        onUploadClick={onUploadClick}
        canUpload={canUpload}
      />
    );
  }

  // No results after filtering
  if (filteredDocs.length === 0) {
    return (
      <div className="space-y-2 -mx-2">
        <DocumentTableFilters
          filters={filters}
          onSearchChange={(value) => updateFilter('search', value)}
          onRoleFilterChange={(roles) => updateFilter('roles', roles)}
          onStatusFilterChange={(statuses) => updateFilter('statuses', statuses)}
          onOutdatedToggle={(value) => updateFilter('showOutdatedOnly', value)}
          activeFilterCount={activeFilterCount}
          activeFilterChips={activeFilterChips}
          onClearFilters={clearFilters}
        />
        <DocumentTableEmpty
          variant="no-results"
          onClearFilters={clearFilters}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2" style={{ marginLeft: '8%', marginRight: '10%' }}>
      {/* Filters */}
      <DocumentTableFilters
        filters={filters}
        onSearchChange={(value) => updateFilter('search', value)}
        onRoleFilterChange={(roles) => updateFilter('roles', roles)}
        onStatusFilterChange={(statuses) => updateFilter('statuses', statuses)}
        onOutdatedToggle={(value) => updateFilter('showOutdatedOnly', value)}
        activeFilterCount={activeFilterCount}
        activeFilterChips={activeFilterChips}
        onClearFilters={clearFilters}
      />

      {/* Bulk Actions */}
      <DocumentTableBulkActions
        selectedCount={selectedRows.size}
        selectedIds={Array.from(selectedRows)}
        onClearSelection={clearSelection}
        canManage={canManage}
      />

      {/* Table with Colored Header and Border */}
      <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm mx-2">
        <Table>
          <TableHeader className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 border-b-2 border-blue-200">
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableHead className="w-[50px] font-semibold">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => toggleAllRows(currentPageIds)}
                  aria-label="Select all documents"
                  className={someSelected && !allSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-200 select-none font-semibold"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  Document Name
                  <SortIcon column="title" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-200 select-none font-semibold"
                onClick={() => handleSort('policyDate')}
              >
                <div className="flex items-center gap-2">
                  Policy Date
                  <SortIcon column="policyDate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-200 select-none font-semibold"
                onClick={() => handleSort('target_role')}
              >
                <div className="flex items-center gap-2">
                  Role
                  <SortIcon column="target_role" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-200 select-none font-semibold"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  Uploaded
                  <SortIcon column="created_at" />
                </div>
              </TableHead>
              <TableHead className="w-[50px] font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocs.map((doc) => {
              const isSelected = selectedRows.has(doc.id);
              const isCurrentDoc = selectedDocumentId === doc.id;

              return (
                <TableRow
                  key={doc.id}
                  className={`cursor-pointer transition-colors ${
                    isCurrentDoc ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleRowClick(doc)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleRowSelection(doc.id)}
                      aria-label={`Select ${doc.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="font-medium line-clamp-2" title={doc.title}>
                        {doc.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{getPolicyDateBadge(doc.policyDate)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getRoleBadgeColor(doc.target_role)}
                    >
                      {getRoleLabel(doc.target_role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className="text-sm text-gray-600"
                      title={new Date(doc.created_at).toLocaleString()}
                    >
                      {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRowClick(doc)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <DocumentTablePagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filteredDocs.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
};
