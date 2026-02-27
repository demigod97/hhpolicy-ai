import React, { useState } from 'react';
import { PrimaryNavigationBar } from '@/components/navigation/PrimaryNavigationBar';
import { Footer } from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ProfileCard,
  DisplayNameEditor,
  ChangePasswordForm,
  SecurityCard,
  AccountActions,
} from '@/components/settings';
import { useUserProfile, useUpdateDisplayName, useChangePassword, useUploadAvatar } from '@/hooks/useUserProfile';
import { useLogout } from '@/services/authService';

const Settings = () => {
  // Dialogs state
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Hooks
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useUserProfile();
  const updateDisplayName = useUpdateDisplayName();
  const changePassword = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const { logout } = useLogout();

  // Handlers
  const handleSaveDisplayName = async (newName: string) => {
    await updateDisplayName.mutateAsync({ full_name: newName });
  };

  const handleChangePassword = async (newPassword: string) => {
    await changePassword.mutateAsync({ newPassword });
  };

  const handleLogout = () => {
    logout();
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 py-8">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Settings</h1>
            <div className="space-y-6">
              {/* Profile Card Skeleton */}
              <div className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-20" />
                <div className="flex items-start gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              {/* Security Card Skeleton */}
              <div className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-32" />
              </div>
              {/* Account Card Skeleton */}
              <div className="border rounded-lg p-6 space-y-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PrimaryNavigationBar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">Unable to load settings</h1>
            <p className="text-gray-600 mb-4">
              {profileError?.message || 'There was a problem loading your profile information.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#1e3a8a] hover:underline"
            >
              Try again
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PrimaryNavigationBar />

      <main className="flex-1 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">User Settings</h1>

          <div className="space-y-6">
            {/* Profile Section */}
            <ProfileCard
              email={profile.email}
              role={profile.role}
              displayName={profile.full_name}
              avatarUrl={profile.avatar_url}
              onEditDisplayName={() => setIsEditingDisplayName(true)}
              onUploadAvatar={(file) => uploadAvatar.mutate(file)}
              isLoading={updateDisplayName.isPending || uploadAvatar.isPending}
            />

            {/* Security Section */}
            <SecurityCard
              onChangePassword={() => setIsChangingPassword(true)}
              isLoading={changePassword.isPending}
            />

            {/* Account Actions */}
            <AccountActions onLogout={handleLogout} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Edit Display Name Dialog */}
      <DisplayNameEditor
        open={isEditingDisplayName}
        onOpenChange={setIsEditingDisplayName}
        currentName={profile.full_name}
        onSave={handleSaveDisplayName}
        isSaving={updateDisplayName.isPending}
      />

      {/* Change Password Dialog */}
      <ChangePasswordForm
        open={isChangingPassword}
        onOpenChange={setIsChangingPassword}
        onSubmit={handleChangePassword}
        isSubmitting={changePassword.isPending}
      />
    </div>
  );
};

export default Settings;
