import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AccountActionsProps {
  onLogout: () => void;
  isLoggingOut?: boolean;
}

export function AccountActions({ onLogout, isLoggingOut = false }: AccountActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Signing out...' : 'Sign Out'}
        </Button>
      </CardContent>
    </Card>
  );
}
