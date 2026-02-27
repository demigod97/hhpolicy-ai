import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pencil, Info, Camera } from 'lucide-react';
import {
  ROLE_DISPLAY_NAMES,
  ROLE_DESCRIPTIONS,
  ROLE_BADGE_COLORS,
  type UserRoleType,
} from '@/types/userProfile';

interface ProfileCardProps {
  email: string;
  role: UserRoleType;
  displayName: string | null;
  avatarUrl?: string | null;
  onEditDisplayName: () => void;
  onUploadAvatar: (file: File) => void;
  isLoading?: boolean;
}

/**
 * Get initials from a name or email
 */
function getInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  // Fall back to email
  return email.substring(0, 2).toUpperCase();
}

export function ProfileCard({
  email,
  role,
  displayName,
  avatarUrl,
  onEditDisplayName,
  onUploadAvatar,
  isLoading = false,
}: ProfileCardProps) {
  const initials = getInitials(displayName, email);
  const roleDisplayName = ROLE_DISPLAY_NAMES[role] || role;
  const roleDescription = ROLE_DESCRIPTIONS[role] || '';
  const roleBadgeColors = ROLE_BADGE_COLORS[role] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar and basic info */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              {avatarUrl && <AvatarImage src={avatarUrl} alt="Profile" />}
              <AvatarFallback className="bg-[#1e3a8a] text-white text-lg font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <label className="absolute -bottom-1 -right-1 cursor-pointer bg-white border rounded-full p-1 shadow-sm hover:bg-gray-50">
              <Camera className="h-3 w-3 text-gray-600" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadAvatar(file);
                  e.target.value = '';
                }}
              />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${roleBadgeColors.bg} ${roleBadgeColors.text} hover:${roleBadgeColors.bg}`}>
                {roleDisplayName}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>{roleDescription}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Display Name field */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-900">
              {displayName || <span className="text-gray-400 italic">Not set</span>}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEditDisplayName}
              disabled={isLoading}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
