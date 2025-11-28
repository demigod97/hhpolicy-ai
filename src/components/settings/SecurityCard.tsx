import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';

interface SecurityCardProps {
  onChangePassword: () => void;
  isLoading?: boolean;
}

export function SecurityCard({ onChangePassword, isLoading = false }: SecurityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Security</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">••••••••</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangePassword}
              disabled={isLoading}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Change
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
