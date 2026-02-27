import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplatePreviewCard, TemplateType, AccessLevel } from './TemplatePreviewCard';
import { FileText, Workflow, ClipboardList } from 'lucide-react';

interface TemplateData {
  type: TemplateType;
  level: AccessLevel;
  file: string;
  title: string;
  description: string;
}

// Template data configuration - 9 templates (3 types × 3 access levels)
const TEMPLATE_DATA: TemplateData[] = [
  // Policy templates
  {
    type: 'policy',
    level: 'general',
    file: '/templates/policy-general.docx',
    title: 'General Policy Template',
    description: 'Standard policy template for organization-wide policies accessible to all employees.',
  },
  {
    type: 'policy',
    level: 'executive',
    file: '/templates/policy-executive.docx',
    title: 'Executive Policy Template',
    description: 'Policy template for executive-level strategic and confidential policies.',
  },
  {
    type: 'policy',
    level: 'board',
    file: '/templates/policy-board.docx',
    title: 'Board Policy Template',
    description: 'Policy template for board-level governance and confidential policies.',
  },
  // Process templates
  {
    type: 'process',
    level: 'general',
    file: '/templates/process-general.docx',
    title: 'General Process Template',
    description: 'Step-by-step process template for standard operational procedures.',
  },
  {
    type: 'process',
    level: 'executive',
    file: '/templates/process-executive.docx',
    title: 'Executive Process Template',
    description: 'Process template for executive-level procedures and workflows.',
  },
  {
    type: 'process',
    level: 'board',
    file: '/templates/process-board.docx',
    title: 'Board Process Template',
    description: 'Process template for board-level procedures and governance workflows.',
  },
  // Checklist templates
  {
    type: 'checklist',
    level: 'general',
    file: '/templates/checklist-general.docx',
    title: 'General Checklist Template',
    description: 'Checklist template for standard compliance and operational tasks.',
  },
  {
    type: 'checklist',
    level: 'executive',
    file: '/templates/checklist-executive.docx',
    title: 'Executive Checklist Template',
    description: 'Checklist template for executive-level compliance and review tasks.',
  },
  {
    type: 'checklist',
    level: 'board',
    file: '/templates/checklist-board.docx',
    title: 'Board Checklist Template',
    description: 'Checklist template for board-level governance and compliance tasks.',
  },
];

const typeIcons: Record<TemplateType, React.ReactNode> = {
  policy: <FileText className="h-4 w-4" />,
  process: <Workflow className="h-4 w-4" />,
  checklist: <ClipboardList className="h-4 w-4" />,
};

/**
 * TemplatePreviewGrid - Grid of all 9 templates organized by type tabs
 */
export const TemplatePreviewGrid: React.FC = () => {
  const getTemplatesByType = (type: TemplateType) =>
    TEMPLATE_DATA.filter((t) => t.type === type);

  return (
    <Tabs defaultValue="policy" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="policy" className="flex items-center gap-2">
          {typeIcons.policy}
          <span className="hidden sm:inline">Policy</span>
        </TabsTrigger>
        <TabsTrigger value="process" className="flex items-center gap-2">
          {typeIcons.process}
          <span className="hidden sm:inline">Process</span>
        </TabsTrigger>
        <TabsTrigger value="checklist" className="flex items-center gap-2">
          {typeIcons.checklist}
          <span className="hidden sm:inline">Checklist</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="policy">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getTemplatesByType('policy').map((template) => (
            <TemplatePreviewCard
              key={`${template.type}-${template.level}`}
              templateType={template.type}
              accessLevel={template.level}
              filePath={template.file}
              title={template.title}
              description={template.description}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="process">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getTemplatesByType('process').map((template) => (
            <TemplatePreviewCard
              key={`${template.type}-${template.level}`}
              templateType={template.type}
              accessLevel={template.level}
              filePath={template.file}
              title={template.title}
              description={template.description}
            />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="checklist">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getTemplatesByType('checklist').map((template) => (
            <TemplatePreviewCard
              key={`${template.type}-${template.level}`}
              templateType={template.type}
              accessLevel={template.level}
              filePath={template.file}
              title={template.title}
              description={template.description}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TemplatePreviewGrid;
