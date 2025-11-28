import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Accordion } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { HelpSection } from '@/components/help/HelpSection';
import { HelpSearch, HELP_SECTIONS } from '@/components/help/HelpSearch';
import { PermissionMatrix } from '@/components/help/PermissionMatrix';
import { QuickStartGuide } from '@/components/help/QuickStartGuide';
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
} from 'lucide-react';

const Help = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const location = useLocation();

  // Track which sections to show (all by default, filtered when searching)
  const [visibleSections, setVisibleSections] = useState<string[]>(
    HELP_SECTIONS.map(s => s.id)
  );
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  // Handle deep linking - open section based on URL hash
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && HELP_SECTIONS.some(s => s.id === hash)) {
      setOpenSections([hash]);
      // Scroll to section after a short delay to allow rendering
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  const handleSectionMatch = useCallback((matchedIds: string[]) => {
    setVisibleSections(matchedIds);
    setOpenSections(matchedIds); // Auto-open matched sections
  }, []);

  const handleSearchClear = useCallback(() => {
    setVisibleSections(HELP_SECTIONS.map(s => s.id));
    setOpenSections(['getting-started']);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-normal text-gray-900 mb-2">
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

          {/* Accordion Sections */}
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-2"
          >
            {/* Section 1: Getting Started */}
            {visibleSections.includes('getting-started') && (
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
                  )}
                </div>
              </HelpSection>
            )}

            {/* Section 2: Templates */}
            {visibleSections.includes('templates') && (
              <HelpSection
                id="templates"
                title="Templates"
                icon={<FileText className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">What are Templates?</h3>
                    <p>
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

                  <div>
                    <h3 className="font-semibold text-lg mb-3">How to Download a Template</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Click <strong>Templates</strong> in the navigation bar</li>
                      <li>Select the tab for your document type (Policy/Process/Checklist)</li>
                      <li>Choose the appropriate access level</li>
                      <li>Click <strong>Download Template</strong> on the desired template card</li>
                      <li>The Word document will download to your computer</li>
                      <li>Open in Microsoft Word and customize for your needs</li>
                    </ol>
                  </div>

                  <Link to="/templates">
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Go to Templates
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </HelpSection>
            )}

            {/* Section 3: Document Upload */}
            {visibleSections.includes('document-upload') && (
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
                    <div className="space-y-3 text-sm">
                      <div>
                        <strong>Title</strong> (Required): The name of your policy document
                      </div>
                      <div>
                        <strong>Document Category</strong>: Type of document (Policy, Process, Checklist)
                      </div>
                      <div>
                        <strong>Access Level</strong>: Who can view this document (General, Executive, Board)
                      </div>
                      <div>
                        <strong>Policy Summary</strong>: Brief description of what the policy covers
                      </div>
                      <div>
                        <strong>Attributed To</strong>: Department or person responsible for the policy
                      </div>
                      <div>
                        <strong>Eligibility</strong>: Who the policy applies to
                      </div>
                      <div>
                        <strong>Policy Effective Date</strong>: When the policy becomes active
                      </div>
                      <div>
                        <strong>Policy Last Updated</strong>: Most recent revision date
                      </div>
                      <div>
                        <strong>Notes/Comments</strong>: Internal notes visible to document managers
                      </div>
                      <div>
                        <strong>Executive Notes</strong>: Confidential notes visible only to executives
                      </div>
                    </div>
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

            {/* Section 4: Roles & Permissions */}
            {visibleSections.includes('roles-permissions') && (
              <HelpSection
                id="roles-permissions"
                title="Roles & Permissions"
                icon={<Users className="h-5 w-5" />}
              >
                <div className="space-y-6">
                  {userRole && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <p className="text-sm text-blue-800">
                          <strong>Your Current Role:</strong> {getRoleDisplayLabel(userRole)}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Role Definitions</h3>
                    <div className="space-y-4">
                      <div className="border-l-4 border-red-500 pl-4">
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

                      <div className="border-l-4 border-orange-500 pl-4">
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

                      <div className="border-l-4 border-blue-500 pl-4">
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

                      <div className="border-l-4 border-purple-500 pl-4">
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

                      <div className="border-l-4 border-amber-500 pl-4">
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
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Permission Matrix</h3>
                    <PermissionMatrix />
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3">How to Change Your Role</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      If you need a different role assignment:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Contact your Company Operator or HR administrator</li>
                      <li>Explain which role you need and why</li>
                      <li>They will review and assign the appropriate role</li>
                      <li>Log out and log back in for changes to take effect</li>
                    </ol>
                  </div>
                </div>
              </HelpSection>
            )}

            {/* Section 5: Access Levels & Security */}
            {visibleSections.includes('access-security') && (
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

            {/* Section 6: FAQ */}
            {visibleSections.includes('faq') && (
              <HelpSection
                id="faq"
                title="Frequently Asked Questions"
                icon={<HelpCircle className="h-5 w-5" />}
              >
                <div className="space-y-6">
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
                        Once complete, the status changes to "Processed" and the document becomes searchable.
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
                        Q: How do I download a template?
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Navigate to the Templates page from the main navigation. Select your document type
                        (Policy, Process, or Checklist), choose the access level, and click the Download
                        button on the template card.
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
                        Q: Can I use PolicyAi on my mobile device?
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Yes, PolicyAi is fully responsive and works on mobile devices. You can browse
                        documents, use the chat feature, and download templates from any device with
                        a web browser.
                      </p>
                    </div>
                  </div>

                  <Card className="bg-gray-50">
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Still have questions?</strong> Contact your Company Operator or HR
                        administrator for assistance with PolicyAi.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </HelpSection>
            )}
          </Accordion>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
