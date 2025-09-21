import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotebookTitleEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notebookId: string;
  currentTitle: string;
  currentDescription?: string;
  onTitleChanged?: () => void;
}

const NotebookTitleEditor = ({
  open,
  onOpenChange,
  notebookId,
  currentTitle,
  currentDescription,
  onTitleChanged
}: NotebookTitleEditorProps) => {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Title cannot be empty',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('policy_documents')
        .update({
          title: title.trim(),
          description: description.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', notebookId);

      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Chat updated successfully'
      });
      
      onTitleChanged?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update notebook:', error);
      toast({
        title: 'Error',
        description: 'Failed to update chat. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setTitle(currentTitle);
    setDescription(currentDescription || '');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Chat Details</DialogTitle>
          <DialogDescription>
            Update the title and description for this chat.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter chat title"
              maxLength={100}
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right mt-2">
              Summary
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              placeholder="Enter a brief summary (optional)"
              rows={3}
              maxLength={500}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUpdating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotebookTitleEditor;