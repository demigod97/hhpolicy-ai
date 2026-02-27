import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Shield, Users, AlertTriangle, Scale } from 'lucide-react';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <main className="flex-1 py-12 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Scale className="h-10 w-10 text-primary" />
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last updated: October 22, 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                Welcome to PolicyAi by Human Habitat. By accessing or using our policy management
                and compliance platform, you agree to be bound by these Terms of Service. Please
                read these terms carefully before using the service.
              </p>
            </CardContent>
          </Card>

          {/* Acceptance of Terms */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By creating an account or accessing PolicyAi, you acknowledge that you have read,
                understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-sm text-muted-foreground">
                If you do not agree to these terms, you must not access or use the service.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts and Access */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Accounts and Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Account Creation</h3>
                <p className="text-sm text-muted-foreground">
                  You must provide accurate and complete information when creating your account.
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Role-Based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Access to documents and features is controlled by your assigned role (Administrator,
                  Executive, Board, etc.). You may only access content authorized for your role.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                  You must immediately notify Human Habitat of any unauthorized use of your account
                  or any other breach of security. We are not liable for any loss or damage from
                  your failure to comply with this security obligation.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Document Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Document Management and Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Document Uploads</h3>
                <p className="text-sm text-muted-foreground">
                  Authorized users may upload policy documents. You warrant that you have the right
                  to upload and share any documents you submit to PolicyAi.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Content Accuracy</h3>
                <p className="text-sm text-muted-foreground">
                  While our AI system strives for accuracy, you acknowledge that AI-generated responses
                  should be verified against source documents for critical compliance decisions.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Prohibited Content</h3>
                <p className="text-sm text-muted-foreground">
                  You may not upload content that is illegal, infringes intellectual property rights,
                  contains malware, or violates any applicable laws or regulations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Service Availability and Modifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We strive to provide continuous service but do not guarantee uninterrupted access.
                We may modify, suspend, or discontinue any part of the service at any time.
              </p>
              <p className="text-sm text-muted-foreground">
                We reserve the right to update these Terms of Service. Continued use of the service
                after changes constitutes acceptance of the modified terms.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                PolicyAi, including its software, design, and content, is owned by Human Habitat and
                protected by intellectual property laws. You may not copy, modify, or distribute any
                part of the service without our prior written consent.
              </p>
              <p className="text-sm text-muted-foreground">
                You retain ownership of your uploaded documents. By uploading content, you grant us
                a license to process, store, and display it as necessary to provide the service.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                To the maximum extent permitted by law, Human Habitat shall not be liable for any
                indirect, incidental, special, consequential, or punitive damages resulting from your
                use or inability to use the service.
              </p>
              <p className="text-sm text-muted-foreground">
                PolicyAi provides information and tools to assist with policy management and compliance.
                Users are responsible for making final compliance decisions and should consult legal
                professionals when necessary.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We reserve the right to suspend or terminate your account if you violate these Terms
                of Service or engage in conduct that we determine to be harmful to the service or
                other users.
              </p>
              <p className="text-sm text-muted-foreground">
                You may request account deletion at any time by contacting us. Upon termination, your
                data will be handled according to our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Governing Law</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                These Terms of Service are governed by the laws of Australia. Any disputes arising
                from these terms or your use of PolicyAi shall be subject to the exclusive jurisdiction
                of the courts of Australia.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about these Terms of Service, please contact:
              </p>
              <p className="text-sm font-medium text-foreground">
                Human Habitat Legal Team
              </p>
              <p className="text-sm text-muted-foreground">
                Email: legal@humanhabitat.com.au
              </p>
            </CardContent>
          </Card>

          {/* Developer Credit */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              PolicyAi developed by{' '}
              <a
                href="https://coralshades.com.au"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CoralShades
              </a>
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Terms;
