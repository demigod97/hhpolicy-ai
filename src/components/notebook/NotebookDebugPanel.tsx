import React from 'react';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

/**
 * Debug panel to show feature flag status
 * Remove this component in production
 */
const NotebookDebugPanel = () => {
  const { flags } = useFeatureFlags();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 text-xs font-mono">
      <div className="font-bold mb-2">🐛 Debug Panel</div>
      <div className="space-y-1">
        <div>enableAGUI: <span className={flags.enableAGUI ? 'text-green-400' : 'text-red-400'}>{String(flags.enableAGUI)}</span></div>
        <div>enableDualMode: <span className={flags.enableDualMode ? 'text-green-400' : 'text-red-400'}>{String(flags.enableDualMode)}</span></div>
        <div>enableN8NFallback: <span className={flags.enableN8NFallback ? 'text-green-400' : 'text-red-400'}>{String(flags.enableN8NFallback)}</span></div>
        <div className="pt-2 border-t border-gray-600 mt-2">
          Chat Mode: <span className="text-yellow-400">{flags.enableAGUI ? 'CopilotKit' : 'Legacy'}</span>
        </div>
      </div>
    </div>
  );
};

export default NotebookDebugPanel;
