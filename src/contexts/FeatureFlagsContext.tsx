import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface FeatureFlags {
  enableAGUI: boolean;
  enableDualMode: boolean;
  enableN8NFallback: boolean;
}

interface FeatureFlagsContextType {
  flags: FeatureFlags;
  toggleAGUI: () => void;
  toggleDualMode: () => void;
  toggleN8NFallback: () => void;
  setFlag: (flag: keyof FeatureFlags, value: boolean) => void;
}

const FeatureFlagsContext = createContext<FeatureFlagsContextType | undefined>(undefined);

const STORAGE_KEY = 'policyai_feature_flags';

// Default flags from environment variables
const getDefaultFlags = (): FeatureFlags => ({
  enableAGUI: import.meta.env.VITE_ENABLE_AG_UI === 'true',
  enableDualMode: import.meta.env.VITE_ENABLE_DUAL_MODE === 'true',
  enableN8NFallback: import.meta.env.VITE_ENABLE_N8N_FALLBACK === 'true',
});

export const FeatureFlagsProvider = ({ children }: { children: ReactNode }) => {
  // Initialize from localStorage or defaults
  const [flags, setFlags] = useState<FeatureFlags>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...getDefaultFlags(), ...JSON.parse(stored) };
      } catch (e) {
        console.error('Failed to parse feature flags from localStorage', e);
      }
    }
    return getDefaultFlags();
  });

  // Persist to localStorage whenever flags change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
  }, [flags]);

  const toggleAGUI = () => {
    setFlags(prev => ({ ...prev, enableAGUI: !prev.enableAGUI }));
  };

  const toggleDualMode = () => {
    setFlags(prev => ({ ...prev, enableDualMode: !prev.enableDualMode }));
  };

  const toggleN8NFallback = () => {
    setFlags(prev => ({ ...prev, enableN8NFallback: !prev.enableN8NFallback }));
  };

  const setFlag = (flag: keyof FeatureFlags, value: boolean) => {
    setFlags(prev => ({ ...prev, [flag]: value }));
  };

  return (
    <FeatureFlagsContext.Provider value={{
      flags,
      toggleAGUI,
      toggleDualMode,
      toggleN8NFallback,
      setFlag,
    }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagsProvider');
  }
  return context;
};

export default FeatureFlagsContext;
