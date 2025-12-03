import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Permission {
  feature: string;
  category: 'documents' | 'management' | 'features';
  systemOwner: boolean;
  companyOperator: boolean;
  general: boolean;
  executive: boolean;
  board: boolean;
}

const permissions: Permission[] = [
  // Document access
  {
    feature: 'View General Documents',
    category: 'documents',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
  {
    feature: 'View Executive Documents',
    category: 'documents',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: true,
    board: true,
  },
  {
    feature: 'View Board Documents',
    category: 'documents',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: true,
  },
  // Management features
  {
    feature: 'Upload Documents',
    category: 'management',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Edit Documents',
    category: 'management',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Manage Templates',
    category: 'management',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Assign User Roles',
    category: 'management',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  // Standard features
  {
    feature: 'Download Templates',
    category: 'features',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
  {
    feature: 'Ask Policy Questions',
    category: 'features',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
  {
    feature: 'View Chat History',
    category: 'features',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
];

type RoleKey = 'systemOwner' | 'companyOperator' | 'general' | 'executive' | 'board';

const roleKeyMap: Record<string, RoleKey> = {
  system_owner: 'systemOwner',
  company_operator: 'companyOperator',
  administrator: 'general',
  general: 'general',
  executive: 'executive',
  board: 'board',
};

interface PermissionIconProps {
  allowed: boolean;
}

const PermissionIcon: React.FC<PermissionIconProps> = ({ allowed }) => {
  return allowed ? (
    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" aria-label="Allowed" />
  ) : (
    <XCircle className="h-5 w-5 text-red-400 mx-auto" aria-label="Not allowed" />
  );
};

interface EnhancedPermissionMatrixProps {
  /** Current user's role to highlight */
  currentRole?: string | null;
  /** Show category groupings */
  showCategories?: boolean;
}

/**
 * EnhancedPermissionMatrix - Enhanced permission matrix with role highlighting
 * Highlights the column for the current user's role
 */
export const EnhancedPermissionMatrix: React.FC<EnhancedPermissionMatrixProps> = ({
  currentRole,
  showCategories = false,
}) => {
  const highlightedRoleKey = currentRole ? roleKeyMap[currentRole] : null;

  const getCellClass = (roleKey: RoleKey) => {
    return cn(
      'text-center transition-colors',
      highlightedRoleKey === roleKey && 'bg-primary/10'
    );
  };

  const getHeaderClass = (roleKey: RoleKey) => {
    return cn(
      'text-center whitespace-nowrap',
      highlightedRoleKey === roleKey && 'bg-primary/20 text-primary font-semibold'
    );
  };

  const categoryLabels: Record<string, string> = {
    documents: 'Document Access',
    management: 'Management',
    features: 'Features',
  };

  // Group permissions by category if needed
  const groupedPermissions = showCategories
    ? Object.entries(
        permissions.reduce((acc, perm) => {
          if (!acc[perm.category]) acc[perm.category] = [];
          acc[perm.category].push(perm);
          return acc;
        }, {} as Record<string, Permission[]>)
      )
    : [['all', permissions] as const];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold min-w-[180px]">Feature</TableHead>
            <TableHead className={getHeaderClass('systemOwner')}>
              System Owner
              {highlightedRoleKey === 'systemOwner' && (
                <span className="block text-xs font-normal">(You)</span>
              )}
            </TableHead>
            <TableHead className={getHeaderClass('companyOperator')}>
              Company Operator
              {highlightedRoleKey === 'companyOperator' && (
                <span className="block text-xs font-normal">(You)</span>
              )}
            </TableHead>
            <TableHead className={getHeaderClass('general')}>
              General
              {highlightedRoleKey === 'general' && (
                <span className="block text-xs font-normal">(You)</span>
              )}
            </TableHead>
            <TableHead className={getHeaderClass('executive')}>
              Executive
              {highlightedRoleKey === 'executive' && (
                <span className="block text-xs font-normal">(You)</span>
              )}
            </TableHead>
            <TableHead className={getHeaderClass('board')}>
              Board
              {highlightedRoleKey === 'board' && (
                <span className="block text-xs font-normal">(You)</span>
              )}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedPermissions.map(([category, perms]) => (
            <React.Fragment key={category}>
              {showCategories && category !== 'all' && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="bg-gray-50 font-semibold text-gray-700 py-2"
                  >
                    {categoryLabels[category] || category}
                  </TableCell>
                </TableRow>
              )}
              {perms.map((permission) => (
                <TableRow key={permission.feature}>
                  <TableCell className="font-medium">{permission.feature}</TableCell>
                  <TableCell className={getCellClass('systemOwner')}>
                    <PermissionIcon allowed={permission.systemOwner} />
                  </TableCell>
                  <TableCell className={getCellClass('companyOperator')}>
                    <PermissionIcon allowed={permission.companyOperator} />
                  </TableCell>
                  <TableCell className={getCellClass('general')}>
                    <PermissionIcon allowed={permission.general} />
                  </TableCell>
                  <TableCell className={getCellClass('executive')}>
                    <PermissionIcon allowed={permission.executive} />
                  </TableCell>
                  <TableCell className={getCellClass('board')}>
                    <PermissionIcon allowed={permission.board} />
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
      {currentRole && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Your role column is highlighted in red
        </p>
      )}
    </div>
  );
};

export default EnhancedPermissionMatrix;
