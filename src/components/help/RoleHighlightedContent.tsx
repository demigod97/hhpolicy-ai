import React from 'react';
import { cn } from '@/lib/utils';

interface RoleHighlightedContentProps {
  /** Roles for which this content is particularly relevant */
  relevantRoles: string[];
  /** The current user's role */
  currentRole: string | null;
  /** Optional label to show when highlighted */
  highlightLabel?: string;
  /** Children content to render */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * RoleHighlightedContent - Wrapper component that visually highlights content
 * when it's relevant to the user's current role
 */
export const RoleHighlightedContent: React.FC<RoleHighlightedContentProps> = ({
  relevantRoles,
  currentRole,
  highlightLabel = 'Relevant to your role',
  children,
  className,
}) => {
  const isRelevant = currentRole && relevantRoles.includes(currentRole);

  return (
    <div
      className={cn(
        'relative rounded-lg transition-all duration-200',
        isRelevant && 'ring-2 ring-primary ring-offset-2 bg-primary/5',
        className
      )}
    >
      {isRelevant && (
        <div className="absolute -top-3 left-4 px-2 py-0.5 bg-primary text-white text-xs font-medium rounded">
          {highlightLabel}
        </div>
      )}
      <div className={cn(isRelevant && 'pt-2')}>
        {children}
      </div>
    </div>
  );
};

export default RoleHighlightedContent;
