import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { FeatureFlagsProvider, useFeatureFlags } from "@/contexts/FeatureFlagsContext";
import { supabase } from "@/integrations/supabase/client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PermissionGuard } from "@/components/navigation/PermissionGuard";
import Dashboard from "./pages/Dashboard";
import ChatInterface from "./components/chat/ChatInterface";
import Search from "./pages/Search";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Error/Unauthorized";
import UserManagementPage from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

// CopilotKit Cloud configuration
// Using CopilotKit Cloud for Inspector + custom runtime for chat
const copilotConfig = {
  publicApiKey: import.meta.env.VITE_COPILOTKIT_PUBLIC_API_KEY || 'ck_pub_824d83fce47e418886702e221b5c6648',
  runtimeUrl: import.meta.env.VITE_COPILOTKIT_RUNTIME_URL || 'https://vnmsyofypuhxjlzwnuhh.supabase.co/functions/v1/copilotkit-runtime',
  showDevConsole: import.meta.env.DEV // Show dev console only in development
};

// Conditional CopilotKit wrapper - only loads when AG-UI is enabled
// Now inside AuthProvider so it can access the session token
const ConditionalCopilotKit = ({ children }: { children: React.ReactNode }) => {
  const { flags } = useFeatureFlags();
  const { user } = useAuth();
  const [headers, setHeaders] = React.useState<Record<string, string>>({});

  // Get auth token for CopilotKit requests
  React.useEffect(() => {
    const getAuthHeaders = async () => {
      if (user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setHeaders({
            'Authorization': `Bearer ${session.access_token}`
          });
        }
      }
    };

    getAuthHeaders();
  }, [user]);

  // Only wrap with CopilotKit when AG-UI is enabled
  if (flags.enableAGUI) {
    return (
      <CopilotKit
        publicApiKey={copilotConfig.publicApiKey}
        runtimeUrl={copilotConfig.runtimeUrl}
        showDevConsole={copilotConfig.showDevConsole}
        headers={headers}
      >
        {children}
      </CopilotKit>
    );
  }

  // When AG-UI is disabled, just render children without CopilotKit
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes - accessible to all authenticated users */}
      <Route
        path="/"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Chat Routes */}
      <Route
        path="/chat/:sessionId"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <ChatInterface />
          </ProtectedRoute>
        }
      />

      {/* Utility Pages */}
      <Route
        path="/search"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Search />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/help"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Help />
          </ProtectedRoute>
        }
      />

      {/* Legacy Notebook Routes - Redirect to Dashboard (notebooks deprecated) */}
      <Route
        path="/notebook"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notebook/:id"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <ChatInterface />
          </ProtectedRoute>
        }
      />

      {/* Admin routes - requires company_operator or system_owner role */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="company_operator" redirectTo="/unauthorized">
              <AdminDashboard />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-management"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="company_operator" redirectTo="/unauthorized">
              <UserManagementPage />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/api-keys"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredPermission="canAccessAPIKeys" redirectTo="/unauthorized">
              <AdminDashboard />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/token-dashboard"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredPermission="canAccessTokenDashboard" redirectTo="/unauthorized">
              <AdminDashboard />
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/system-settings"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="system_owner" redirectTo="/unauthorized">
              <div>System Settings Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user-limits"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="system_owner" redirectTo="/unauthorized">
              <div>User Limits Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      {/* Board routes - requires board role */}
      <Route
        path="/board/overview"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="board" redirectTo="/unauthorized">
              <div>Board Overview Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/policy-analysis"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="board" redirectTo="/unauthorized">
              <div>Policy Analysis Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/risk-assessment"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="board" redirectTo="/unauthorized">
              <div>Risk Assessment Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/board/alerts"
        element={
          <ProtectedRoute fallback={<Auth />}>
            <PermissionGuard requiredRole="board" redirectTo="/unauthorized">
              <div>System Alerts Page (To be implemented)</div>
            </PermissionGuard>
          </ProtectedRoute>
        }
      />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FeatureFlagsProvider>
      <AuthProvider>
        <ConditionalCopilotKit>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </TooltipProvider>
        </ConditionalCopilotKit>
      </AuthProvider>
    </FeatureFlagsProvider>
  </QueryClientProvider>
);

export default App;
