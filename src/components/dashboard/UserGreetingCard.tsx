import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useDocumentStats } from '@/hooks/useDocumentStats';
import { useCreateChatSession } from '@/hooks/useChatSession';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  MessageSquarePlus,
  Settings,
  FileText,
  Clock,
  TrendingUp,
  Shield,
  Users,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RolePalette {
  bg: string;
  border: string;
  text: string;
  icon: string;
  label: string;
}

const rolePalette: Record<string, RolePalette> = {
  system_owner: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    text: 'text-red-700',
    icon: '=4',
    label: 'System Owner',
  },
  company_operator: {
    bg: 'bg-orange-50',
    border: 'border-orange-500',
    text: 'text-orange-700',
    icon: '=�',
    label: 'Company Operator',
  },
  board: {
    bg: 'bg-blue-50',
    border: 'border-blue-500',
    text: 'text-blue-700',
    icon: '=5',
    label: 'Board Member',
  },
  executive: {
    bg: 'bg-green-50',
    border: 'border-green-500',
    text: 'text-green-700',
    icon: '=�',
    label: 'Executive',
  },
  administrator: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    text: 'text-yellow-700',
    icon: '=�',
    label: 'Administrator',
  },
};

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'system_owner':
      return <Shield className="h-4 w-4" />;
    case 'company_operator':
      return <Users className="h-4 w-4" />;
    case 'board':
      return <Eye className="h-4 w-4" />;
    case 'executive':
      return <TrendingUp className="h-4 w-4" />;
    case 'administrator':
      return <FileText className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const UserGreetingCard: React.FC = () => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const stats = useDocumentStats();
  const navigate = useNavigate();
  const createSession = useCreateChatSession();
  const { toast } = useToast();

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Get user initials
  const initials = useMemo(() => {
    if (!user?.email) return '?';
    const email = user.email;
    return email.charAt(0).toUpperCase();
  }, [user?.email]);

  // Get role palette
  const palette = useMemo(() => {
    return rolePalette[userRole || 'administrator'] || rolePalette.administrator;
  }, [userRole]);

  // Determine quick actions based on role
  const isOperator = ['system_owner', 'company_operator'].includes(userRole || '');
  const isBoard = userRole === 'board';

  const handleNewChat = async () => {
    try {
      const session = await createSession.mutateAsync('New Chat');
      navigate(`/chat/${session.id}`);
    } catch (error) {
      console.error('Error creating chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create new chat session. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleManageDocuments = () => {
    navigate('/admin/documents');
  };

  const handleUpload = () => {
    // Trigger upload modal (will be handled by parent)
    window.dispatchEvent(new CustomEvent('open-upload-dialog'));
  };

  return (
    <Card className="border-2 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          {/* Left: Greeting and User Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarFallback className={`${palette.bg} ${palette.text} text-2xl font-semibold`}>
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {greeting}, {user?.email?.split('@')[0] || 'User'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {user?.email}
                </p>
              </div>

              <Badge
                variant="outline"
                className={`${palette.bg} ${palette.border} ${palette.text} border-2 font-semibold px-3 py-1`}
              >
                <span className="mr-2">{palette.icon}</span>
                {getRoleIcon(userRole || 'administrator')}
                <span className="ml-2">{palette.label}</span>
              </Badge>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="gap-2"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Chat
            </Button>

            {isOperator && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpload}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleManageDocuments}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Manage
                </Button>
              </>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Document Statistics */}
        <div className="grid grid-cols-3 gap-6">
          {/* Total Accessible Documents */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Total Documents</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.isLoading ? '...' : stats.data?.total || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Accessible to you
            </p>
          </div>

          {/* Recent Documents (Last 7 days) */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Recent</span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {stats.isLoading ? '...' : stats.data?.recent || 0}
            </p>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </div>

          {/* User's Uploads (if operator) or Processing Status */}
          <div className="space-y-1">
            {isOperator ? (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Your Uploads</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? '...' : stats.data?.uploaded || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  Documents uploaded
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Processing</span>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.isLoading ? '...' : stats.data?.processing || 0}
                </p>
                <p className="text-xs text-muted-foreground">
                  In progress
                </p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
