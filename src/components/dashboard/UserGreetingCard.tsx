import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
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
import { getRoleColors, getRoleIcon, getRoleDisplayName } from '@/lib/rolePalette';
import {
  Upload,
  MessageSquarePlus,
  Settings,
  FileText,
  Clock,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
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

  // Get greeting icon
  const greetingIcon = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 18) return '☀️';
    return '🌙';
  }, []);

  // Get user initials
  const initials = useMemo(() => {
    if (!user?.email) return '?';
    const email = user.email;
    return email.charAt(0).toUpperCase();
  }, [user?.email]);

  // Get role colors
  const roleColors = useMemo(() => {
    return getRoleColors(userRole || 'administrator');
  }, [userRole]);

  // Determine quick actions based on role
  const isOperator = ['system_owner', 'company_operator'].includes(userRole || '');

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="border-2 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            {/* Left: Greeting and User Info */}
            <div className="flex items-start gap-4 flex-1">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Avatar className="h-16 w-16 border-4 border-primary/20 shadow-lg">
                  <AvatarFallback className={`${roleColors.badgeBg} ${roleColors.badgeText} text-2xl font-bold`}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              <div className="space-y-2 flex-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                    <span>{greetingIcon}</span>
                    <span>{greeting}, {user?.email?.split('@')[0] || 'User'}</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.email}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Badge
                    variant="outline"
                    className={`${roleColors.badgeBg} ${roleColors.border} ${roleColors.badgeText} border-2 font-semibold px-4 py-1.5 text-sm`}
                  >
                    <span className="mr-2">{getRoleIcon(userRole || 'administrator')}</span>
                    {getRoleDisplayName(userRole as any || 'administrator')}
                  </Badge>
                </motion.div>
              </div>
            </div>

            {/* Right: Quick Actions */}
            <motion.div
              className="flex flex-wrap gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNewChat}
                  className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Chat</span>
                </Button>
              </motion.div>

              {isOperator && (
                <>
                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpload}
                      className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Upload className="h-4 w-4" />
                      <span className="hidden sm:inline">Upload</span>
                    </Button>
                  </motion.div>

                  <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                    <Button
                      size="sm"
                      onClick={handleManageDocuments}
                      className="gap-2 shadow-sm hover:shadow-md transition-shadow bg-primary hover:bg-primary/90"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Manage</span>
                    </Button>
                  </motion.div>
                </>
              )}
            </motion.div>
          </div>

          <Separator className="my-6" />

          {/* Document Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Total Accessible Documents */}
            <motion.div
              variants={statVariants}
              className="space-y-2 p-4 rounded-lg bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-2 text-primary">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-semibold">Total Documents</span>
              </div>
              <motion.p
                className="text-4xl font-bold text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                {stats.isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.data?.total || 0
                )}
              </motion.p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Accessible to you
              </p>
            </motion.div>

            {/* Recent Documents (Last 7 days) */}
            <motion.div
              variants={statVariants}
              className="space-y-2 p-4 rounded-lg bg-accent/50 border border-accent hover:bg-accent/60 transition-colors"
            >
              <div className="flex items-center gap-2 text-accent-foreground">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-semibold">Recent</span>
              </div>
              <motion.p
                className="text-4xl font-bold text-foreground"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                {stats.isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  stats.data?.recent || 0
                )}
              </motion.p>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </motion.div>

            {/* User's Uploads (if operator) or Processing Status */}
            <motion.div
              variants={statVariants}
              className="space-y-2 p-4 rounded-lg bg-secondary/50 border border-secondary hover:bg-secondary/60 transition-colors"
            >
              {isOperator ? (
                <>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-semibold">Your Uploads</span>
                  </div>
                  <motion.p
                    className="text-4xl font-bold text-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    {stats.isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.data?.uploaded || 0
                    )}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">
                    Documents uploaded
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-secondary-foreground">
                    <Clock className="h-5 w-5" />
                    <span className="text-sm font-semibold">Processing</span>
                  </div>
                  <motion.p
                    className="text-4xl font-bold text-foreground"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, type: "spring" }}
                  >
                    {stats.isLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      stats.data?.processing || 0
                    )}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">
                    In progress
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
