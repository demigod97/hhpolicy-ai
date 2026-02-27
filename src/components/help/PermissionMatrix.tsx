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

interface Permission {
  feature: string;
  systemOwner: boolean;
  companyOperator: boolean;
  general: boolean;
  executive: boolean;
  board: boolean;
}

const permissions: Permission[] = [
  {
    feature: 'View General Documents',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
  {
    feature: 'View Executive Documents',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: true,
    board: true,
  },
  {
    feature: 'View Board Documents',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: true,
  },
  {
    feature: 'Upload Documents',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Manage Templates',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Assign User Roles',
    systemOwner: true,
    companyOperator: true,
    general: false,
    executive: false,
    board: false,
  },
  {
    feature: 'Download Templates',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
  {
    feature: 'Ask Policy Questions',
    systemOwner: true,
    companyOperator: true,
    general: true,
    executive: true,
    board: true,
  },
];

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
  return allowed ? (
    <CheckCircle className="h-5 w-5 text-green-600 mx-auto" aria-label="Allowed" />
  ) : (
    <XCircle className="h-5 w-5 text-red-400 mx-auto" aria-label="Not allowed" />
  );
};

/**
 * PermissionMatrix - Table component showing role-permission mappings
 * Shows which features each role can access
 */
export const PermissionMatrix: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold min-w-[180px]">Feature</TableHead>
            <TableHead className="text-center">System Owner</TableHead>
            <TableHead className="text-center">Company Operator</TableHead>
            <TableHead className="text-center">General</TableHead>
            <TableHead className="text-center">Executive</TableHead>
            <TableHead className="text-center">Board</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.feature}>
              <TableCell className="font-medium">{permission.feature}</TableCell>
              <TableCell><PermissionIcon allowed={permission.systemOwner} /></TableCell>
              <TableCell><PermissionIcon allowed={permission.companyOperator} /></TableCell>
              <TableCell><PermissionIcon allowed={permission.general} /></TableCell>
              <TableCell><PermissionIcon allowed={permission.executive} /></TableCell>
              <TableCell><PermissionIcon allowed={permission.board} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionMatrix;
