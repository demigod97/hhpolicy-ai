
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotebookGeneration } from './useNotebookGeneration';
import { useUserRole } from './useUserRole';
import { useEffect } from 'react';

interface Source {
  id: string;
  notebook_id: string;
  title: string;
  type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio';
  content?: string;
  url?: string;
  file_path?: string;
  file_size?: number;
  processing_status: string;
  metadata?: Record<string, unknown>;
  visibility_scope?: string;
  target_role?: string;
  uploaded_by_user_id?: string;
  created_at: string;
  updated_at: string;
  policyDate?: string;
  policyType?: string;
  policyName?: string;
}

interface RealtimePayload {
  eventType: string;
  new?: Source;
  old?: Source;
}

export const useSources = (notebookId?: string) => {
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const queryClient = useQueryClient();
  const { generateNotebookContentAsync } = useNotebookGeneration();

  const {
    data: sources = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sources', userRole], // Removed notebookId as sources are now global
    queryFn: async () => {
      // Fetch all global sources - RLS policies will handle role-based filtering
      const { data: allSources, error } = await supabase
        .from('sources')
        .select('*')
        .eq('visibility_scope', 'global')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // RLS policies now handle the role-based filtering at database level
      // No need for client-side filtering
      return allSources || [];
    },
    enabled: !!user, // Enable when user is available instead of notebookId
  });

  // Set up Realtime subscription for sources table (global sources)
  useEffect(() => {
    if (!user) return;

    console.log('Setting up Realtime subscription for global sources table');

    const channel = supabase
      .channel('global-sources-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sources',
          filter: 'visibility_scope=eq.global'
        },
        (payload: RealtimePayload) => {
          console.log('Realtime: Global sources change received:', payload);
          
          // Update the query cache based on the event type
          queryClient.setQueryData(['sources', userRole], (oldSources: Source[] = []) => {
            switch (payload.eventType) {
              case 'INSERT': {
                // Add new source if it doesn't already exist
                const newSource = payload.new;
                const existsInsert = oldSources.some(source => source.id === newSource?.id);
                if (existsInsert) {
                  console.log('Source already exists, skipping INSERT:', newSource?.id);
                  return oldSources;
                }
                console.log('Adding new global source to cache:', newSource);
                return [newSource, ...oldSources];
              }

              case 'UPDATE': {
                // Update existing source
                const updatedSource = payload.new;
                console.log('Updating global source in cache:', updatedSource?.id);
                return oldSources.map(source =>
                  source.id === updatedSource?.id ? updatedSource : source
                );
              }

              case 'DELETE': {
                // Remove deleted source
                const deletedSource = payload.old;
                console.log('Removing global source from cache:', deletedSource?.id);
                return oldSources.filter(source => source.id !== deletedSource?.id);
              }
                
              default:
                console.log('Unknown event type:', payload.eventType);
                return oldSources;
            }
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for global sources:', status);
      });

    return () => {
      console.log('Cleaning up Realtime subscription for global sources');
      supabase.removeChannel(channel);
    };
  }, [user, userRole, queryClient]);

  const addSource = useMutation({
    mutationFn: async (sourceData: {
      notebookId: string;
      title: string;
      type: 'pdf' | 'text' | 'website' | 'youtube' | 'audio';
      content?: string;
      url?: string;
      file_path?: string;
      file_size?: number;
      processing_status?: string;
      metadata?: Record<string, unknown>;
      target_role?: 'board' | 'executive' | 'administrator';
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Default target_role based on user's role if not specified
      let targetRole = sourceData.target_role;
      if (!targetRole) {
        // Default to user's current role for new sources
        targetRole = userRole as 'board' | 'executive' | 'administrator' || 'administrator';
      }

      const { data, error } = await supabase
        .from('sources')
        .insert({
          notebook_id: sourceData.notebookId,
          title: sourceData.title,
          type: sourceData.type,
          content: sourceData.content,
          url: sourceData.url,
          file_path: sourceData.file_path,
          file_size: sourceData.file_size,
          processing_status: sourceData.processing_status,
          metadata: sourceData.metadata || {},
          // Global visibility with role-based access control
          visibility_scope: 'global',
          target_role: targetRole,
          uploaded_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (newSource) => {
      console.log('Source added successfully:', newSource);
      
      // The Realtime subscription will handle updating the cache
      // But we still check for first source to trigger generation
      const currentSources = queryClient.getQueryData(['sources', notebookId]) as Source[] || [];
      const isFirstSource = currentSources.length === 0;
      
      if (isFirstSource && notebookId) {
        console.log('This is the first source, checking notebook generation status...');
        
        // Check notebook generation status
        const { data: notebook } = await supabase
          .from('policy_documents')
          .select('generation_status')
          .eq('id', notebookId)
          .single();
        
        if (notebook?.generation_status === 'pending') {
          console.log('Triggering notebook content generation...');
          
          // Determine if we can trigger generation based on source type and available data
          const canGenerate = 
            (newSource.type === 'pdf' && newSource.file_path) ||
            (newSource.type === 'text' && newSource.content) ||
            (newSource.type === 'website' && newSource.url) ||
            (newSource.type === 'youtube' && newSource.url) ||
            (newSource.type === 'audio' && newSource.file_path);
          
          if (canGenerate) {
            try {
              await generateNotebookContentAsync({
                notebookId,
                filePath: newSource.file_path || newSource.url,
                sourceType: newSource.type
              });
            } catch (error) {
              console.error('Failed to generate notebook content:', error);
            }
          } else {
            console.log('Source not ready for generation yet - missing required data');
          }
        }
      }
    },
  });

  const updateSource = useMutation({
    mutationFn: async ({ sourceId, updates }: { 
      sourceId: string; 
      updates: { 
        title?: string;
        file_path?: string;
        processing_status?: string;
      }
    }) => {
      const { data, error } = await supabase
        .from('sources')
        .update(updates)
        .eq('id', sourceId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (updatedSource) => {
      // The Realtime subscription will handle updating the cache
      
      // If file_path was added and this is the first source, trigger generation
      if (updatedSource.file_path && notebookId) {
        const currentSources = queryClient.getQueryData(['sources', notebookId]) as Source[] || [];
        const isFirstSource = currentSources.length === 1;
        
        if (isFirstSource) {
          const { data: notebook } = await supabase
            .from('policy_documents')
            .select('generation_status')
            .eq('id', notebookId)
            .single();
          
          if (notebook?.generation_status === 'pending') {
            console.log('File path updated, triggering notebook content generation...');
            
            try {
              await generateNotebookContentAsync({
                notebookId,
                filePath: updatedSource.file_path,
                sourceType: updatedSource.type
              });
            } catch (error) {
              console.error('Failed to generate notebook content:', error);
            }
          }
        }
      }
    },
  });

  return {
    sources,
    isLoading,
    error,
    addSource: addSource.mutate,
    addSourceAsync: addSource.mutateAsync,
    isAdding: addSource.isPending,
    updateSource: updateSource.mutate,
    isUpdating: updateSource.isPending,
  };
};
