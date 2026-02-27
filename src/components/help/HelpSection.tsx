import React from 'react';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface HelpSectionProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * HelpSection - Reusable accordion item for help documentation
 * Supports deep linking via id prop (e.g., /help#templates)
 */
export const HelpSection: React.FC<HelpSectionProps> = ({
  id,
  title,
  icon,
  children,
}) => {
  return (
    <AccordionItem value={id} id={id} className="border rounded-lg px-4 mb-2 bg-white">
      <AccordionTrigger className="text-left py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary">{icon}</span>}
          <span className="text-lg font-medium">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-4 pt-2">
        <div className="text-gray-700 space-y-4">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default HelpSection;
