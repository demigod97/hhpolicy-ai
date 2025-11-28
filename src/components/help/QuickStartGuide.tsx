import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Download,
  Upload,
  MessageSquare,
  ArrowRight,
  FileText,
  Search
} from 'lucide-react';

interface QuickStartStep {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: {
    to: string;
    label: string;
  };
}

const steps: QuickStartStep[] = [
  {
    number: 1,
    title: 'Download a Template',
    description: 'Start by downloading a policy template that matches your needs. Choose from Policy, Process, or Checklist templates at different access levels.',
    icon: <Download className="h-5 w-5" />,
    link: {
      to: '/templates',
      label: 'Go to Templates',
    },
  },
  {
    number: 2,
    title: 'Upload Your Document',
    description: 'Fill out your template in Microsoft Word, then upload it to PolicyAi. Add metadata like title, category, access level, and effective date during upload.',
    icon: <Upload className="h-5 w-5" />,
    link: {
      to: '/dashboard',
      label: 'Go to Dashboard',
    },
  },
  {
    number: 3,
    title: 'Wait for Processing',
    description: 'PolicyAi will process your document (usually 2-5 minutes). Once complete, your policy is searchable and indexed for AI-powered Q&A.',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    number: 4,
    title: 'Search & Browse',
    description: 'Use the Dashboard to browse all policy documents. Filter by role, status, or search by keywords. Click any document to view the full PDF.',
    icon: <Search className="h-5 w-5" />,
    link: {
      to: '/dashboard',
      label: 'Browse Documents',
    },
  },
  {
    number: 5,
    title: 'Ask Questions',
    description: 'Start a chat session to ask questions about your policies. The AI will search through your documents and provide answers with citations.',
    icon: <MessageSquare className="h-5 w-5" />,
    link: {
      to: '/chat',
      label: 'Start a Chat',
    },
  },
];

/**
 * QuickStartGuide - Step-by-step interactive guide for new users
 */
export const QuickStartGuide: React.FC = () => {
  return (
    <div className="space-y-4">
      <p className="text-gray-600 mb-6">
        Get up and running with PolicyAi in 5 simple steps:
      </p>

      <ol className="space-y-6">
        {steps.map((step) => (
          <li key={step.number} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {step.number}
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-primary">{step.icon}</span>
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
              </div>
              <p className="text-sm text-gray-600">{step.description}</p>
              {step.link && (
                <Link to={step.link.to}>
                  <Button variant="link" size="sm" className="p-0 h-auto text-primary">
                    {step.link.label}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default QuickStartGuide;
