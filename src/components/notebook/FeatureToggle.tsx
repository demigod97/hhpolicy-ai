import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Sparkles } from 'lucide-react';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

const FeatureToggle = () => {
  const { flags, toggleAGUI, toggleDualMode, toggleN8NFallback } = useFeatureFlags();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          {flags.enableAGUI && <Sparkles className="h-3 w-3 text-blue-500" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Feature Flags</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2 space-y-3">
          {/* AG-UI Toggle */}
          <div className="flex items-center justify-between space-x-2">
            <div className="flex-1">
              <Label htmlFor="agui-toggle" className="text-sm font-medium cursor-pointer">
                AG-UI Protocol
              </Label>
              <p className="text-xs text-gray-500">
                Use CopilotKit AG-UI
              </p>
            </div>
            <Switch
              id="agui-toggle"
              checked={flags.enableAGUI}
              onCheckedChange={toggleAGUI}
            />
          </div>

          {/* Dual Mode Toggle - only show when AG-UI is enabled */}
          {flags.enableAGUI && (
            <>
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="dual-mode-toggle" className="text-sm font-medium cursor-pointer">
                    Dual Mode
                  </Label>
                  <p className="text-xs text-gray-500">
                    Run AG-UI + n8n in parallel
                  </p>
                </div>
                <Switch
                  id="dual-mode-toggle"
                  checked={flags.enableDualMode}
                  onCheckedChange={toggleDualMode}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="fallback-toggle" className="text-sm font-medium cursor-pointer">
                    n8n Fallback
                  </Label>
                  <p className="text-xs text-gray-500">
                    Fallback to n8n on error
                  </p>
                </div>
                <Switch
                  id="fallback-toggle"
                  checked={flags.enableN8NFallback}
                  onCheckedChange={toggleN8NFallback}
                />
              </div>
            </>
          )}
        </div>

        <DropdownMenuSeparator />
        <div className="p-2">
          <p className="text-xs text-gray-500">
            Changes take effect immediately
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FeatureToggle;
