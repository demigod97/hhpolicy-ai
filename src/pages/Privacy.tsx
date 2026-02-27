import React from 'react';
import { motion } from 'framer-motion';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, Mail } from 'lucide-react';

const Privacy = () => {
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
              <Shield className="h-10 w-10 text-primary" />
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: October 22, 2025
            </p>
          </div>

          {/* Introduction */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <p className="text-foreground leading-relaxed">
                Human Habitat ("we," "our," or "us") is committed to protecting your privacy.
                This Privacy Policy explains how PolicyAi collects, uses, and safeguards your
                information when you use our policy management and compliance platform.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Account Information</h3>
                <p className="text-sm text-muted-foreground">
                  Email address, name, and authentication credentials when you create an account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Document Data</h3>
                <p className="text-sm text-muted-foreground">
                  Policy documents you upload, including metadata such as upload date, file size, and document titles.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Usage Information</h3>
                <p className="text-sm text-muted-foreground">
                  Chat interactions, search queries, and platform usage patterns to improve our AI-powered features.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Provide and maintain our policy management services</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Process and analyze documents using AI technology</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Enforce role-based access control and security policies</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Improve our AI models and platform functionality</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Communicate important updates and security notifications</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Encryption of data in transit and at rest</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Row-level security (RLS) policies enforced at the database level</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Role-based access control (RBAC) to segregate data by user role</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Regular security audits and compliance monitoring</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Secure authentication via Supabase Auth</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You have the right to:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Access your personal data and documents</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Request correction of inaccurate data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Request deletion of your account and associated data</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Export your data in a portable format</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Withdraw consent for data processing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact:
              </p>
              <p className="text-sm font-medium text-foreground">
                Human Habitat Privacy Team
              </p>
              <p className="text-sm text-muted-foreground">
                Email: privacy@humanhabitat.com.au
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

export default Privacy;
