import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { DocumentFilters as Filters } from '@/hooks/useDocumentFilters';
import { getRoleDisplayLabel } from '@/lib/roleLabelMapping';

interface DocumentTableFiltersProps {
  filters: Filters;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (roles: string[]) => void;
  onStatusFilterChange: (statuses: string[]) => void;
  onOutdatedToggle: (value: boolean) => void;
  activeFilterCount: number;
  activeFilterChips: Array<{ key: string; label: string; onRemove: () => void }>;
  onClearFilters: () => void;
}

export const DocumentTableFilters: React.FC<DocumentTableFiltersProps> = ({
  filters,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onOutdatedToggle,
  activeFilterCount,
  activeFilterChips,
  onClearFilters,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  const toggleRole = (role: string) => {
    const newRoles = filters.roles.includes(role)
      ? filters.roles.filter(r => r !== role)
      : [...filters.roles, role];
    onRoleFilterChange(newRoles);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onStatusFilterChange(newStatuses);
  };

  return (
    <div className="space-y-3">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[140px]">
              <Filter className="h-4 w-4" />
              Role
              {filters.roles.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.roles.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-3">Filter by Role</p>
              {['administrator', 'executive', 'board', 'company_operator', 'system_owner'].map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{getRoleDisplayLabel(role)}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 min-w-[140px]">
              <Filter className="h-4 w-4" />
              Status
              {filters.statuses.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.statuses.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-3">Filter by Status</p>
              {[
                { value: 'completed', label: 'Processed' },
                { value: 'processing', label: 'Processing' },
                { value: 'pending', label: 'Pending' },
                { value: 'failed', label: 'Failed' }
              ].map(status => (
                <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.statuses.includes(status.value)}
                    onChange={() => toggleStatus(status.value)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* More Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              More Filters
              {activeFilterCount > (filters.roles.length + filters.statuses.length + (filters.search ? 1 : 0)) && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount - filters.roles.length - filters.statuses.length - (filters.search ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-3">Additional Filters</p>
              </div>

              {/* Outdated Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="outdated-toggle" className="text-sm cursor-pointer">
                  Show outdated policies only
                  <span className="block text-xs text-gray-500 mt-0.5">
                    Policies older than 18 months
                  </span>
                </Label>
                <Switch
                  id="outdated-toggle"
                  checked={filters.showOutdatedOnly}
                  onCheckedChange={onOutdatedToggle}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            onClick={onClearFilters}
            className="gap-2"
          >
            Clear All
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map(chip => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-gray-200"
              onClick={chip.onRemove}
            >
              {chip.label}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
