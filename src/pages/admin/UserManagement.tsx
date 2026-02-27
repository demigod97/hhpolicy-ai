import React from 'react';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import UserManagementDashboard from '@/components/admin/UserManagementDashboard';

const UserManagement = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <div className="flex-1 container mx-auto py-6 space-y-6">
        <UserManagementDashboard />
      </div>

      <Footer />
    </div>
  );
};

export default UserManagement;
