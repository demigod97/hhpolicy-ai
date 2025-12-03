import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { FileText, Eye, Download, ClipboardList, Workflow } from 'lucide-react';

export type TemplateType = 'policy' | 'process' | 'checklist';
export type AccessLevel = 'general' | 'executive' | 'board';

interface TemplatePreviewCardProps {
  templateType: TemplateType;
  accessLevel: AccessLevel;
  pdfPath: string;
  title: string;
  description: string;
}

const typeIcons: Record<TemplateType, React.ReactNode> = {
  policy: <FileText className="h-5 w-5" />,
  process: <Workflow className="h-5 w-5" />,
  checklist: <ClipboardList className="h-5 w-5" />,
};

const typeLabels: Record<TemplateType, string> = {
  policy: 'Policy',
  process: 'Process',
  checklist: 'Checklist',
};

const accessLevelColors: Record<AccessLevel, string> = {
  general: 'bg-gray-100 text-gray-800 border-gray-300',
  executive: 'bg-purple-100 text-purple-800 border-purple-300',
  board: 'bg-amber-100 text-amber-800 border-amber-300',
};

const accessLevelLabels: Record<AccessLevel, string> = {
  general: 'General',
  executive: 'Executive',
  board: 'Board',
};

const accessLevelDescriptions: Record<AccessLevel, string> = {
  general: 'Available to all employees',
  executive: 'Restricted to executives',
  board: 'Board members only',
};

/**
 * TemplatePreviewCard - Card component with live PDF preview for template documents
 */
export const TemplatePreviewCard: React.FC<TemplatePreviewCardProps> = ({
  templateType,
  accessLevel,
  pdfPath,
  title,
  description,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfPath;
    link.download = `${typeLabels[templateType]}-${accessLevelLabels[accessLevel]}-Template.pdf`;
    link.click();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-primary">{typeIcons[templateType]}</span>
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <Badge
            variant="outline"
            className={accessLevelColors[accessLevel]}
          >
            {accessLevelLabels[accessLevel]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500">
          {accessLevelDescriptions[accessLevel]}
        </p>
        <div className="flex gap-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] p-0">
              <DialogHeader className="px-4 pt-4 pb-2">
                <DialogTitle className="flex items-center gap-2">
                  {typeIcons[templateType]}
                  {title}
                  <Badge variant="outline" className={accessLevelColors[accessLevel]}>
                    {accessLevelLabels[accessLevel]}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 h-[calc(85vh-60px)]">
                <PDFViewer
                  fileUrl={pdfPath}
                  fileName={`${typeLabels[templateType]}-${accessLevelLabels[accessLevel]}-Template.pdf`}
                />
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreviewCard;
