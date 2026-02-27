
import React from 'react';
import { Button } from '@/components/ui/button';

interface CitationButtonProps {
  chunkIndex: number;
  onClick: () => void;
  className?: string;
}

const CitationButton = ({ chunkIndex, onClick, className = '' }: CitationButtonProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      aria-label="View citation source"
      className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-0 ml-1 text-xs font-medium text-blue-600 border-blue-300 hover:bg-blue-50 hover:border-blue-400 rounded-full touch-manipulation ${className}`}
      style={{ touchAction: 'manipulation' }}
    >
      {chunkIndex + 1}
    </Button>
  );
};

export default CitationButton;
