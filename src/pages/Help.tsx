import React from 'react';
import { Link } from 'react-router-dom';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { HelpCircle, ArrowLeft, Book, MessageSquare, Mail } from 'lucide-react';

const Help = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-normal text-gray-900 mb-2">Help & Support</h1>
            <p className="text-gray-600">
              Get help with PolicyAi and learn how to make the most of the platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Book className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Learn how to use PolicyAi effectively
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Comprehensive guides on uploading documents, using chat, and managing policies.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Frequently asked questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Find answers to common questions about features, security, and best practices.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Mail className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Get personalized assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Reach out to our support team for help with specific issues or questions.
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
              <CardDescription>
                Get started with PolicyAi in a few simple steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">1.</span>
                  <span>
                    <strong>Upload Documents:</strong> Navigate to the Dashboard and click "Upload Document" to add your policy PDFs.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">2.</span>
                  <span>
                    <strong>Browse Policies:</strong> View all uploaded policy documents in the document grid on the Dashboard.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">3.</span>
                  <span>
                    <strong>View PDFs:</strong> Click any document card to view the PDF in the built-in viewer.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">4.</span>
                  <span>
                    <strong>Start Chatting:</strong> Click "New Chat" to ask questions about your policies using AI.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-primary">5.</span>
                  <span>
                    <strong>Manage Sessions:</strong> View your chat history in the sidebar and switch between conversations.
                  </span>
                </li>
              </ol>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
