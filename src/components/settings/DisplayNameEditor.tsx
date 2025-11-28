import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DisplayNameEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string | null;
  onSave: (newName: string) => Promise<void>;
  isSaving?: boolean;
}

export function DisplayNameEditor({
  open,
  onOpenChange,
  currentName,
  onSave,
  isSaving = false,
}: DisplayNameEditorProps) {
  const [name, setName] = useState(currentName || '');
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(currentName || '');
      setError(null);
    }
  }, [open, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();

    // Validation
    if (!trimmedName) {
      setError('Display name cannot be empty');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Display name must be 100 characters or less');
      return;
    }

    try {
      await onSave(trimmedName);
      onOpenChange(false);
    } catch (err) {
      // Error is handled by the mutation's onError
    }
  };

  const handleCancel = () => {
    setName(currentName || '');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
            <DialogDescription>
              This name will be displayed in your profile and throughout the application.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your display name"
                autoFocus
                disabled={isSaving}
              />
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
