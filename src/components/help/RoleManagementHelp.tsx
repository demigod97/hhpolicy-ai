import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  HelpCircle, 
  Upload, 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Eye,
  UserCheck
} from 'lucide-react';

interface RoleManagementHelpProps {
  trigger?: React.ReactNode;
}

const RoleManagementHelp = ({ trigger }: RoleManagementHelpProps) => {
  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <HelpCircle className="h-4 w-4 mr-2" />
      Role Management Help
    </Button>
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span>Role Management Help</span>
          </DialogTitle>
          <DialogDescription>
            Learn how to manage policy document access using role assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Role assignment controls which user groups can access specific policy documents. 
                This ensures that sensitive documents are only visible to authorized personnel.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Executive
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Role Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Role Types</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                  <span className="font-medium">System Management & Configuration</span>
                </div>
                <p className="text-sm text-gray-600 ml-20">
                  Documents related to system setup, user management, technical configurations, 
                  and operational procedures. Only administrators can access these documents.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Executive
                  </Badge>
                  <span className="font-medium">Leadership & Decision-Making</span>
                </div>
                <p className="text-sm text-gray-600 ml-20">
                  Strategic documents, executive policies, leadership guidelines, and high-level 
                  decision-making materials. Only executives can access these documents.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uploading Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Uploading Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-medium flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>During Upload</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
                  <li>Select your policy document file</li>
                  <li>Choose the appropriate role from the dropdown menu</li>
                  <li>Upload the document - it will be automatically assigned to the selected role</li>
                </ol>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-blue-800">Default Assignment</h5>
                    <p className="text-sm text-blue-700">
                      Documents uploaded without explicit role selection default to Administrator role
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Managing Existing Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-4 w-4" />
                <span>Managing Existing Documents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Single Document</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
                  <li>Find the document in your policy document list</li>
                  <li>Click the role badge or "Edit Role" button</li>
                  <li>Select the new role and confirm the change</li>
                  <li>Access permissions update immediately</li>
                </ol>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Bulk Operations</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 ml-6">
                  <li>Select multiple documents using the checkboxes</li>
                  <li>Click the "Bulk Assign Role" button that appears</li>
                  <li>Choose the target role for all selected documents</li>
                  <li>Confirm the bulk operation</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span>Important Notes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-yellow-800">Access Control Impact</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Role changes take effect immediately</li>
                      <li>• Users may lose access to documents if their role doesn't match</li>
                      <li>• Chat history and related data respect the same access controls</li>
                      <li>• Super admins can always override role restrictions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-red-800">Permissions Required</h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Only administrators can change role assignments</li>
                      <li>• Only administrators can upload new policy documents</li>
                      <li>• Role assignment changes cannot be undone automatically</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HelpCircle className="h-4 w-4" />
                <span>Quick Reference</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <h5 className="font-medium">Visual Indicators</h5>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-blue-100 text-blue-800 text-xs">Administrator</Badge>
                      <span className="text-gray-600">Blue badge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-purple-100 text-purple-800 text-xs">Executive</Badge>
                      <span className="text-gray-600">Purple badge</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium">Common Actions</h5>
                  <div className="space-y-1 text-gray-600">
                    <div>• Hover over badges for details</div>
                    <div>• Click badges to edit roles</div>
                    <div>• Use bulk selection for efficiency</div>
                    <div>• Check tooltips for guidance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoleManagementHelp;