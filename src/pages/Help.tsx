import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { HelpSection } from '@/components/help/HelpSection';
import { HelpSearch, HELP_SECTIONS, SECTION_TAB_MAP } from '@/components/help/HelpSearch';
import { EnhancedPermissionMatrix } from '@/components/help/EnhancedPermissionMatrix';
import { QuickStartGuide } from '@/components/help/QuickStartGuide';
import { TemplatePreviewGrid } from '@/components/help/TemplatePreviewGrid';
import { RoleHighlightedContent } from '@/components/help/RoleHighlightedContent';
import { getRoleDisplayLabel } from '@/lib/roleLabelMapping';
import {
  Rocket,
  FileText,
  Upload,
  Users,
  Lock,
  HelpCircle,
  ArrowRight,
  Download,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ClipboardList,
  Shield,
  Mail,
  BookOpen,
  Wrench,
} from 'lucide-react';

// Tab configuration
const TABS = [
  { id: 'user-guide', label: 'User Guide', icon: BookOpen },
  { id: 'templates-upload', label: 'Templates & Upload', icon: FileText },
  { id: 'roles-access', label: 'Roles & Access', icon: Users },
  { id: 'faq-support', label: 'FAQ & Support', icon: HelpCircle },
];

const Help = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab from URL or default
  const [activeTab, setActiveTab] = useState(() => {
    return searchParams.get('tab') || 'user-guide';
  });

  // Track which sections to show (all by default, filtered when searching)
  const [visibleSections, setVisibleSections] = useState<string[]>(
    HELP_SECTIONS.map(s => s.id)
  );
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  // Handle tab change with URL update
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  }, [setSearchParams]);

  // Handle deep linking - open section based on URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && HELP_SECTIONS.some(s => s.id === hash)) {
      // Switch to the correct tab for this section
      const targetTab = SECTION_TAB_MAP[hash];
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab);
        setSearchParams({ tab: targetTab });
      }
      setOpenSections([hash]);
      // Scroll to section after a short delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash, activeTab, setSearchParams]);

  const handleSectionMatch = useCallback((matchedIds: string[]) => {
    setVisibleSections(matchedIds);
    setOpenSections(matchedIds);
    // If search results are in a different tab, switch to first matching tab
    if (matchedIds.length > 0) {
      const firstMatchTab = SECTION_TAB_MAP[matchedIds[0]];
      if (firstMatchTab && firstMatchTab !== activeTab) {
        setActiveTab(firstMatchTab);
        setSearchParams({ tab: firstMatchTab });
      }
    }
  }, [activeTab, setSearchParams]);

  const handleSearchClear = useCallback(() => {
    setVisibleSections(HELP_SECTIONS.map(s => s.id));
    setOpenSections(['getting-started']);
  }, []);

  // Get sections for a specific tab
  const getSectionsForTab = (tabId: string) => {
    return HELP_SECTIONS.filter(s => SECTION_TAB_MAP[s.id] === tabId);
  };

  // Check if a section is visible (after search filter)
  const isSectionVisible = (sectionId: string) => visibleSections.includes(sectionId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-normal text-gray-900 mb-2">
              Help & Documentation
            </h1>
            <p className="text-gray-600">
              Everything you need to know about using PolicyAi effectively.
            </p>
          </div>

          {/* Search */}
          <div className="mb-6">
            <HelpSearch
              sections={HELP_SECTIONS}
              onSectionMatch={handleSectionMatch}
              onClear={handleSearchClear}
            />
            {visibleSections.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">
                No matching topics found. Try different keywords.
              </p>
            )}
            {visibleSections.length > 0 && visibleSections.length < HELP_SECTIONS.length && (
              <p className="text-sm text-gray-500 mt-2">
                Showing {visibleSections.length} of {HELP_SECTIONS.length} topics.
              </p>
            )}
          </div>

          {/* Tabs + Accordion Structure */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-xs md:text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab 1: User Guide */}
            <TabsContent value="user-guide">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-2"
              >
                {/* Getting Started */}
                {isSectionVisible('getting-started') && (
                  <HelpSection
                    id="getting-started"
                    title="Getting Started"
                    icon={<Rocket className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Welcome to PolicyAi</h3>
                        <p>
                          PolicyAi is an AI-powered policy management system designed to help organizations
                          manage, search, and understand their policy documents. Using advanced AI technology,
                          PolicyAi enables you to ask natural language questions about your policies and receive
                          accurate, citation-backed answers.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold text-lg mb-4">Quick Start Guide</h3>
                        <QuickStartGuide />
                      </div>

                      {userRole && (
                        <RoleHighlightedContent
                          relevantRoles={[userRole]}
                          currentRole={userRole}
                          highlightLabel="Your current role"
                        >
                          <Card className="bg-blue-50 border-blue-200">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-800">
                                  You are logged in as <strong>{getRoleDisplayLabel(userRole)}</strong>
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </RoleHighlightedContent>
                      )}
                    </div>
                  </HelpSection>
                )}

                {/* Dashboard & Documents */}
                {isSectionVisible('dashboard-documents') && (
                  <HelpSection
                    id="dashboard-documents"
                    title="Dashboard & Documents"
                    icon={<LayoutDashboard className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Your Dashboard</h3>
                        <p className="mb-4">
                          The Dashboard is your central hub for managing and viewing all policy documents.
                          Here you can browse, search, and access documents based on your role permissions.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Key Features</h3>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Document Grid/List View</h4>
                              <p className="text-sm text-gray-600">
                                Toggle between grid and list views to browse documents. Click any document
                                to view its full PDF content.
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Filter & Search</h4>
                              <p className="text-sm text-gray-600">
                                Use filters to narrow down documents by role assignment, status,
                                or search by keywords in document titles.
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Document Status</h4>
                              <p className="text-sm text-gray-600">
                                Documents show their processing status: Processing (being indexed),
                                Ready (available for Q&A), or Error (needs attention).
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">PDF Viewer</h4>
                              <p className="text-sm text-gray-600">
                                View full document PDFs with zoom, page navigation, search,
                                download, and print capabilities.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Button variant="outline" asChild>
                        <Link to="/dashboard">
                          Go to Dashboard <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </HelpSection>
                )}

                {/* Chat & Policy Q&A */}
                {isSectionVisible('chat-qa') && (
                  <HelpSection
                    id="chat-qa"
                    title="Chat & Policy Q&A"
                    icon={<MessageSquare className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">How AI Chat Works</h3>
                        <p className="mb-4">
                          PolicyAi uses Retrieval-Augmented Generation (RAG) to answer your policy questions.
                          When you ask a question, the AI searches through your organization's policy documents
                          and provides answers with direct citations from source documents.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Using the Chat</h3>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li>Type your policy question in natural language</li>
                          <li>The AI searches relevant documents based on your role permissions</li>
                          <li>You receive an answer with citations to source documents</li>
                          <li>Click citations to view the source document and verify information</li>
                        </ol>
                      </div>

                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-green-800 mb-2">Tips for Better Results</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                            <li>Be specific in your questions</li>
                            <li>Ask about one topic at a time</li>
                            <li>Use keywords from your policy documents</li>
                            <li>Review citations to verify AI responses</li>
                          </ul>
                        </CardContent>
                      </Card>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Chat Sessions</h3>
                        <p className="text-sm text-gray-600">
                          Your conversations are saved as chat sessions. You can view previous sessions,
                          continue conversations, or start new ones. Chat history is private to your account.
                        </p>
                      </div>

                      <Button variant="outline" asChild>
                        <Link to="/chat">
                          Start a Chat <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </HelpSection>
                )}

                {/* Settings & Profile */}
                {isSectionVisible('settings-profile') && (
                  <HelpSection
                    id="settings-profile"
                    title="Settings & Profile"
                    icon={<Settings className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Account Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Display Name</h4>
                            <p className="text-sm text-gray-600">
                              Set a custom display name that appears throughout the application.
                              This is optional and defaults to your email address.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Password Management</h4>
                            <p className="text-sm text-gray-600">
                              Change your password from the Settings page. You'll need to enter
                              your current password and confirm the new one.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Account Information</h4>
                            <p className="text-sm text-gray-600">
                              View your email address, current role, and account status.
                              Contact your Company Operator to change your role.
                            </p>
                          </div>
                        </div>
                      </div>

                      <Button variant="outline" asChild>
                        <Link to="/settings">
                          Go to Settings <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </HelpSection>
                )}
              </Accordion>
            </TabsContent>

            {/* Tab 2: Templates & Upload */}
            <TabsContent value="templates-upload">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-2"
              >
                {/* Template Library */}
                {isSectionVisible('templates') && (
                  <HelpSection
                    id="templates"
                    title="Template Library"
                    icon={<FileText className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">What are Templates?</h3>
                        <p className="mb-4">
                          Templates are pre-formatted Word documents (.docx) designed to help you create
                          consistent, well-structured policy documents. PolicyAi provides 9 standardized
                          templates covering three document types and three access levels.
                        </p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Template Types</h3>
                        <div className="grid gap-3">
                          <div className="flex gap-3 items-start">
                            <Badge variant="outline" className="bg-blue-50">Policy</Badge>
                            <p className="text-sm">
                              Formal organizational policies (e.g., HR policies, IT policies, compliance requirements)
                            </p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Badge variant="outline" className="bg-green-50">Process</Badge>
                            <p className="text-sm">
                              Procedural documents describing how to complete tasks step-by-step
                            </p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Badge variant="outline" className="bg-purple-50">Checklist</Badge>
                            <p className="text-sm">
                              Step-by-step checklists for compliance or operational tasks
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Access Levels</h3>
                        <div className="grid gap-3">
                          <div className="flex gap-3 items-start">
                            <Badge className="bg-gray-100 text-gray-800">General</Badge>
                            <p className="text-sm">Available to all staff members</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Badge className="bg-purple-100 text-purple-800">Executive</Badge>
                            <p className="text-sm">Restricted to C-Level executives and VPs</p>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Badge className="bg-amber-100 text-amber-800">Board</Badge>
                            <p className="text-sm">Restricted to Board members only</p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="font-semibold text-lg mb-4">Preview & Download Templates</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Click on any template below to preview its structure or download it for use.
                        </p>
                        <TemplatePreviewGrid />
                      </div>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <h4 className="font-medium text-blue-800 mb-2">Naming Convention</h4>
                          <p className="text-sm text-blue-700 mb-2">
                            When saving your completed document, use this format:
                          </p>
                          <code className="text-xs bg-blue-100 px-2 py-1 rounded">
                            CompanyInitial [Type] - [Name] - [Access Level] - YEARMMDD
                          </code>
                          <p className="text-xs text-blue-600 mt-2">
                            Example: HH Policy - Remote Work - Executive - 20251203
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </HelpSection>
                )}

                {/* Document Upload */}
                {isSectionVisible('document-upload') && (
                  <RoleHighlightedContent
                    relevantRoles={['system_owner', 'company_operator']}
                    currentRole={userRole}
                    highlightLabel="You can upload documents"
                  >
                    <HelpSection
                      id="document-upload"
                      title="Document Upload"
                      icon={<Upload className="h-5 w-5" />}
                    >
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-lg mb-3">Step-by-Step Upload Guide</h3>
                          <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Navigate to the <strong>Dashboard</strong></li>
                            <li>Click the <strong>Upload Document</strong> button</li>
                            <li>Select your file (.doc, .docx, or .pdf)</li>
                            <li>Fill in the required metadata fields</li>
                            <li>Click <strong>Upload</strong> to start processing</li>
                          </ol>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-3">Metadata Fields Explained</h3>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2 pr-4">Field</th>
                                  <th className="text-left py-2">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Title *</td>
                                  <td className="py-2 text-gray-600">The name of your policy document</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Document Category</td>
                                  <td className="py-2 text-gray-600">Type of document (Policy, Process, Checklist)</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Access Level *</td>
                                  <td className="py-2 text-gray-600">Who can view this document (General, Executive, Board)</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Policy Summary</td>
                                  <td className="py-2 text-gray-600">Brief description of what the policy covers</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Attributed To</td>
                                  <td className="py-2 text-gray-600">Department or person responsible for the policy</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Eligibility</td>
                                  <td className="py-2 text-gray-600">Who the policy applies to</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Effective Date</td>
                                  <td className="py-2 text-gray-600">When the policy becomes active</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Last Updated</td>
                                  <td className="py-2 text-gray-600">Most recent revision date</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Notes/Comments</td>
                                  <td className="py-2 text-gray-600">Internal notes visible to document managers</td>
                                </tr>
                                <tr>
                                  <td className="py-2 pr-4 font-medium">Executive Notes</td>
                                  <td className="py-2 text-gray-600">Confidential notes visible only to executives</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">* Required fields</p>
                        </div>

                        <Card className="bg-gray-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Info className="h-4 w-4" />
                              File Requirements
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p><strong>Accepted formats:</strong> .doc, .docx, .pdf</p>
                            <p><strong>Maximum file size:</strong> 10MB</p>
                            <p><strong>Processing time:</strong> 2-5 minutes (larger files may take up to 10 minutes)</p>
                          </CardContent>
                        </Card>
                      </div>
                    </HelpSection>
                  </RoleHighlightedContent>
                )}

                {/* Processing & Status */}
                {isSectionVisible('processing-status') && (
                  <HelpSection
                    id="processing-status"
                    title="Processing & Status"
                    icon={<Clock className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Document Processing</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          After uploading, documents go through several processing steps before they're
                          available for AI-powered Q&A:
                        </p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                          <li><strong>Upload:</strong> File is securely stored</li>
                          <li><strong>Text Extraction:</strong> Content is extracted from the document</li>
                          <li><strong>Chunking:</strong> Text is split into searchable segments</li>
                          <li><strong>Embedding:</strong> AI creates vector embeddings for semantic search</li>
                          <li><strong>Indexing:</strong> Document is added to the search index</li>
                        </ol>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Status Indicators</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              Processing
                            </Badge>
                            <p className="text-sm">Document is being processed. Usually completes in 2-5 minutes.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              Ready
                            </Badge>
                            <p className="text-sm">Document is fully processed and available for Q&A.</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                              Error
                            </Badge>
                            <p className="text-sm">Processing failed. Contact your Company Operator for assistance.</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Troubleshooting Upload Issues</h3>
                        <ul className="list-disc list-inside space-y-2 text-sm">
                          <li>Ensure file is under 10MB</li>
                          <li>Check that file format is .doc, .docx, or .pdf</li>
                          <li>Verify you have upload permissions (Company Operator or System Owner role)</li>
                          <li>Try refreshing the page if upload stalls</li>
                          <li>Contact your Company Operator if issues persist</li>
                        </ul>
                      </div>
                    </div>
                  </HelpSection>
                )}
              </Accordion>
            </TabsContent>

            {/* Tab 3: Roles & Access */}
            <TabsContent value="roles-access">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-2"
              >
                {/* Your Role */}
                {isSectionVisible('your-role') && userRole && (
                  <RoleHighlightedContent
                    relevantRoles={[userRole]}
                    currentRole={userRole}
                    highlightLabel="This is your current role"
                  >
                    <HelpSection
                      id="your-role"
                      title="Your Role"
                      icon={<Shield className="h-5 w-5" />}
                    >
                      <div className="space-y-6">
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="pt-4">
                            <div className="flex items-center gap-3 mb-4">
                              <Badge className="text-lg px-4 py-1">
                                {getRoleDisplayLabel(userRole)}
                              </Badge>
                            </div>
                            <p className="text-gray-700">
                              {userRole === 'system_owner' &&
                                'As a System Owner, you have full access to all features, documents, and administrative functions in PolicyAi.'}
                              {userRole === 'company_operator' &&
                                'As a Company Operator, you can manage documents, templates, and user roles. You have access to all document access levels.'}
                              {userRole === 'administrator' &&
                                'As a General user, you can view documents assigned to the General access level and use the AI chat for policy questions.'}
                              {userRole === 'executive' &&
                                'As an Executive, you can view General and Executive level documents and use the AI chat for policy questions.'}
                              {userRole === 'board' &&
                                'As a Board member, you have read access to all documents including Board-level confidential policies.'}
                            </p>
                          </CardContent>
                        </Card>

                        <div>
                          <h3 className="font-semibold text-lg mb-3">What You Can Do</h3>
                          <div className="grid gap-2">
                            {(userRole === 'system_owner' || userRole === 'company_operator') && (
                              <>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>Upload and manage documents</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>Manage user roles</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span>Access all document levels</span>
                                </div>
                              </>
                            )}
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>View documents at your access level</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Ask policy questions via AI chat</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span>Download templates</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-semibold text-lg mb-3">Need a Different Role?</h3>
                          <p className="text-sm text-gray-600">
                            Contact your Company Operator or HR administrator to request a role change.
                            They will review your request and assign the appropriate role.
                          </p>
                        </div>
                      </div>
                    </HelpSection>
                  </RoleHighlightedContent>
                )}

                {/* All Roles Explained */}
                {isSectionVisible('all-roles') && (
                  <HelpSection
                    id="all-roles"
                    title="All Roles Explained"
                    icon={<Users className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <RoleHighlightedContent
                          relevantRoles={['system_owner']}
                          currentRole={userRole}
                        >
                          <div className="border-l-4 border-red-500 pl-4 py-2">
                            <h4 className="font-medium">System Owner</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Who:</strong> Developers, IT administrators
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Purpose:</strong> Backend system management and configuration
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Permissions:</strong> Full access to all features, database, and settings
                            </p>
                          </div>
                        </RoleHighlightedContent>

                        <RoleHighlightedContent
                          relevantRoles={['company_operator']}
                          currentRole={userRole}
                        >
                          <div className="border-l-4 border-orange-500 pl-4 py-2">
                            <h4 className="font-medium">Company Operator</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Who:</strong> HR managers, compliance officers, document administrators
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Purpose:</strong> Manage policy documents and user roles
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Permissions:</strong> Upload/edit/delete documents, assign user roles, manage templates
                            </p>
                          </div>
                        </RoleHighlightedContent>

                        <RoleHighlightedContent
                          relevantRoles={['administrator']}
                          currentRole={userRole}
                        >
                          <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <h4 className="font-medium">General</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Who:</strong> All staff members
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Purpose:</strong> Day-to-day policy access and reference
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Permissions:</strong> View general-level documents, download templates, ask policy questions
                            </p>
                          </div>
                        </RoleHighlightedContent>

                        <RoleHighlightedContent
                          relevantRoles={['executive']}
                          currentRole={userRole}
                        >
                          <div className="border-l-4 border-purple-500 pl-4 py-2">
                            <h4 className="font-medium">Executive</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Who:</strong> C-Level executives, Vice Presidents
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Purpose:</strong> Access executive-level policies and strategic documents
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Permissions:</strong> View general + executive documents, download all templates
                            </p>
                          </div>
                        </RoleHighlightedContent>

                        <RoleHighlightedContent
                          relevantRoles={['board']}
                          currentRole={userRole}
                        >
                          <div className="border-l-4 border-amber-500 pl-4 py-2">
                            <h4 className="font-medium">Board</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              <strong>Who:</strong> Board of Directors members
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Purpose:</strong> Access board-level confidential policies
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Permissions:</strong> View all documents (general, executive, board), full template access
                            </p>
                          </div>
                        </RoleHighlightedContent>
                      </div>
                    </div>
                  </HelpSection>
                )}

                {/* Permission Matrix */}
                {isSectionVisible('permission-matrix') && (
                  <HelpSection
                    id="permission-matrix"
                    title="Permission Matrix"
                    icon={<ClipboardList className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <p className="text-sm text-gray-600">
                        This table shows which features are available to each role. Your role's column
                        is highlighted for easy reference.
                      </p>
                      <EnhancedPermissionMatrix currentRole={userRole} showCategories />
                    </div>
                  </HelpSection>
                )}

                {/* Access Levels & Security */}
                {isSectionVisible('access-security') && (
                  <HelpSection
                    id="access-security"
                    title="Access Levels & Security"
                    icon={<Lock className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Document Access Levels</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Every document in PolicyAi is assigned an access level that controls who can view it.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge className="bg-gray-100 text-gray-800 mt-0.5">General</Badge>
                            <div className="text-sm">
                              <p className="font-medium">Available to all users</p>
                              <p className="text-gray-600">Standard policies that all staff need access to</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                            <Badge className="bg-purple-100 text-purple-800 mt-0.5">Executive</Badge>
                            <div className="text-sm">
                              <p className="font-medium">Executives, Company Operators, and System Owners only</p>
                              <p className="text-gray-600">Strategic and sensitive business documents</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                            <Badge className="bg-amber-100 text-amber-800 mt-0.5">Board</Badge>
                            <div className="text-sm">
                              <p className="font-medium">Board members, Company Operators, and System Owners only</p>
                              <p className="text-gray-600">Highly confidential board-level documents</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-3">Role-Based Access Control (RBAC)</h3>
                        <p className="text-sm text-gray-600">
                          PolicyAi uses RBAC to ensure that users can only access documents appropriate
                          for their role. This is enforced at the database level, meaning:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                          <li>Document visibility is determined by your assigned role</li>
                          <li>AI chat responses only include citations from documents you can access</li>
                          <li>Search results are filtered based on your role</li>
                          <li>Access controls cannot be bypassed through the UI</li>
                        </ul>
                      </div>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <strong>Security Note:</strong> If you can access a document, you can share
                              information from it. Always follow your organization's data handling policies.
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </HelpSection>
                )}
              </Accordion>
            </TabsContent>

            {/* Tab 4: FAQ & Support */}
            <TabsContent value="faq-support">
              <Accordion
                type="multiple"
                value={openSections}
                onValueChange={setOpenSections}
                className="space-y-2"
              >
                {/* General Questions */}
                {isSectionVisible('general-questions') && (
                  <HelpSection
                    id="general-questions"
                    title="General Questions"
                    icon={<HelpCircle className="h-5 w-5" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: Why can't I see a document that my colleague can see?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Document visibility is controlled by access levels. If your colleague can see
                          a document you cannot, they likely have a higher role (e.g., Executive or Board)
                          and the document is restricted to that access level. Contact your Company Operator
                          if you believe you should have access.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: How long does document processing take?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Most documents process within 2-5 minutes after upload. Larger documents (5MB+)
                          may take up to 10 minutes. You'll see a "Processing" status in the document table.
                          Once complete, the status changes to "Ready" and the document becomes searchable.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: Can I edit a document after uploading it?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Only Company Operators and System Owners can edit uploaded documents. If you need
                          to update a document, contact your Company Operator or re-upload a corrected version.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: How do I change my role?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Contact your Company Operator or HR administrator to request a role change. They
                          will review your request and assign the appropriate role. You may need to log out
                          and back in for changes to take effect.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: What file types are supported?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          PolicyAi supports .doc, .docx, and .pdf files up to 10MB in size. For best results,
                          use our templates which are in .docx format.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: Why is my document flagged as outdated?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Documents are flagged as outdated if they haven't been updated in 18 months or more.
                          This is a reminder to review and update the policy to ensure it remains accurate
                          and compliant. Contact your Company Operator to update or confirm the document.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: Who can see Executive Notes?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Executive Notes are confidential and only visible to users with Executive, Board,
                          Company Operator, or System Owner roles. General users cannot see Executive Notes.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: Can I use PolicyAi on my mobile device?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Yes, PolicyAi is fully responsive and works on mobile devices. You can browse
                          documents, use the chat feature, and download templates from any device with
                          a web browser.
                        </p>
                      </div>
                    </div>
                  </HelpSection>
                )}

                {/* Technical Issues */}
                {isSectionVisible('technical-issues') && (
                  <HelpSection
                    id="technical-issues"
                    title="Technical Issues"
                    icon={<Wrench className="h-5 w-5" />}
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: My upload keeps failing. What should I do?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          First, check that your file is under 10MB and in a supported format (.doc, .docx, .pdf).
                          Try refreshing the page and uploading again. If the problem persists, clear your browser
                          cache or try a different browser. Contact your Company Operator if issues continue.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: The PDF viewer isn't loading. What can I do?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Try refreshing the page. If the PDF still doesn't load, check your internet connection.
                          Some browsers may block PDF rendering - try Chrome or Firefox for best results.
                          You can also try downloading the PDF and viewing it locally.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: The AI chat isn't responding to my questions.
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          AI responses may take a few seconds, especially for complex questions. If there's no
                          response after 30 seconds, try refreshing the page and starting a new chat session.
                          Ensure you have processed documents in the system for the AI to search.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: How do I reset my password?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Click "Forgot Password" on the login page and enter your email address. You'll
                          receive a password reset link via email. If you don't receive it, check your
                          spam folder or contact your Company Operator.
                        </p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-medium text-gray-900">
                          Q: I'm seeing an error message. What should I do?
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Note the exact error message if possible. Try refreshing the page first. If the error
                          persists, log out and log back in. For persistent issues, contact your Company Operator
                          with details about what you were trying to do when the error occurred.
                        </p>
                      </div>
                    </div>
                  </HelpSection>
                )}

                {/* Contact & Support */}
                {isSectionVisible('contact-support') && (
                  <HelpSection
                    id="contact-support"
                    title="Contact & Support"
                    icon={<Mail className="h-5 w-5" />}
                  >
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-lg mb-3">Who to Contact</h3>
                        <div className="space-y-4">
                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">Company Operator</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Your first point of contact for:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                <li>Role change requests</li>
                                <li>Document access issues</li>
                                <li>Template questions</li>
                                <li>General PolicyAi usage questions</li>
                              </ul>
                            </CardContent>
                          </Card>

                          <Card className="bg-gray-50">
                            <CardContent className="pt-4">
                              <h4 className="font-medium mb-2">HR Administrator</h4>
                              <p className="text-sm text-gray-600 mb-2">
                                Contact for:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                <li>Policy content questions</li>
                                <li>Policy interpretation guidance</li>
                                <li>HR-related document requests</li>
                              </ul>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4">
                          <p className="text-sm text-blue-800">
                            <strong>Still have questions?</strong> Contact your Company Operator or HR
                            administrator for assistance with PolicyAi.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </HelpSection>
                )}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
