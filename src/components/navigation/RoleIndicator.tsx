import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useRolePermissions, UserRole } from '@/hooks/useRolePermissions';
import { Shield, Crown, Users, Lock, User } from 'lucide-react';
import { getRoleDisplayLabel } from '@/lib/roleLabelMapping';

// Role configuration using centralized label mapping for consistency
const ROLE_CONFIG: Record<
  UserRole,
  {
    icon: React.ComponentType<{ className?: string }>;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    color: string;
  }
> = {
  system_owner: {
    icon: Crown,
    variant: 'destructive',
    color: 'text-red-600 dark:text-red-400',
  },
  company_operator: {
    icon: Shield,
    variant: 'default',
    color: 'text-blue-600 dark:text-blue-400',
  },
  board: {
    icon: Users,
    variant: 'secondary',
    color: 'text-purple-600 dark:text-purple-400',
  },
  administrator: {
    icon: Lock,
    variant: 'outline',
    color: 'text-green-600 dark:text-green-400',
  },
  executive: {
    icon: User,
    variant: 'outline',
    color: 'text-gray-600 dark:text-gray-400',
  },
};

interface RoleIndicatorProps {
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const RoleIndicator: React.FC<RoleIndicatorProps> = ({
  showIcon = true,
  showLabel = true,
  className,
}) => {
  const { userRole, isLoading } = useRolePermissions();

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        <div className="h-3 w-20 bg-gray-200 animate-pulse rounded"></div>
      </Badge>
    );
  }

  if (!userRole) {
    return null;
  }

  const config = ROLE_CONFIG[userRole];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <Icon className="h-3 w-3" />}
      {showLabel && <span>{getRoleDisplayLabel(userRole)}</span>}
    </Badge>
  );
};

interface RoleDescriptionProps {
  role?: UserRole;
}

export const RoleDescription: React.FC<RoleDescriptionProps> = ({ role }) => {
  const { userRole } = useRolePermissions();
  const displayRole = role || userRole;

  if (!displayRole) {
    return null;
  }

  const descriptions: Record<UserRole, string> = {
    system_owner:
      'Full system access with ability to configure system settings, manage user limits, and oversee all operations.',
    company_operator:
      'Operational management access including user management, API keys, token dashboard, and company analytics.',
    board:
      'Strategic oversight access with policy analysis, risk assessment, and executive reporting capabilities.',
    administrator:
      'Content management access for document upload, document management, and user analytics.',
    executive:
      'Standard user access with policy dashboard, document viewer, and chat interface.',
  };

  const config = ROLE_CONFIG[displayRole];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
      <Icon className={`h-5 w-5 mt-0.5 ${config.color}`} />
      <div className="flex-1">
        <h4 className="font-medium text-sm mb-1">{getRoleDisplayLabel(displayRole)}</h4>
        <p className="text-xs text-muted-foreground">{descriptions[displayRole]}</p>
      </div>
    </div>
  );
};
