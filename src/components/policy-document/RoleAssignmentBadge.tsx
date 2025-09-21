import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Shield, Users } from 'lucide-react';

interface RoleAssignmentBadgeProps {
  role: 'administrator' | 'executive' | 'board' | null;
  className?: string;
  showTooltip?: boolean;
}

const RoleAssignmentBadge = ({ role, className, showTooltip = true }: RoleAssignmentBadgeProps) => {
  const renderBadge = (badgeContent: React.ReactNode, tooltipText?: string) => {
    if (!showTooltip || !tooltipText) {
      return badgeContent;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              {badgeContent}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (!role) {
    return renderBadge(
      <Badge variant="secondary" className={`${className || ''} bg-gray-100 text-gray-600`}>
        <Users className="h-3 w-3 mr-1" />
        Unassigned
      </Badge>,
      'This document has no role assignment - access permissions may vary'
    );
  }

  if (role === 'administrator') {
    return renderBadge(
      <Badge variant="secondary" className={`${className || ''} bg-blue-100 text-blue-800`}>
        <Shield className="h-3 w-3 mr-1" />
        Administrator
      </Badge>,
      'This document is assigned to Administrator role - only administrators can access it'
    );
  }

  if (role === 'executive') {
    return renderBadge(
      <Badge variant="secondary" className={`${className || ''} bg-purple-100 text-purple-800`}>
        <Shield className="h-3 w-3 mr-1" />
        Executive
      </Badge>,
      'This document is assigned to Executive role - only executives can access it'
    );
  }

  if (role === 'board') {
    return renderBadge(
      <Badge variant="secondary" className={`${className || ''} bg-green-100 text-green-800`}>
        <Shield className="h-3 w-3 mr-1" />
        Board
      </Badge>,
      'This document is assigned to Board role - only board members can access it'
    );
  }

  return null;
};

export default RoleAssignmentBadge;