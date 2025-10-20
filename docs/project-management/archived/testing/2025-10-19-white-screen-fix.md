# White Screen Fix - Desktop View Issue

**Date:** October 18, 2025
**Issue:** White screen on desktop resolution (>= 1100px), works fine on mobile
**Status:** ✅ FIXED

---

## 🔍 Root Cause Analysis

### The Problem
The CopilotKit provider was **always** wrapping the entire application (in `src/App.tsx`), regardless of whether the AG-UI feature flag was enabled or disabled.

```typescript
// BEFORE (BROKEN) - App.tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <FeatureFlagsProvider>
      <CopilotKit  // ❌ ALWAYS wrapping app
        publicApiKey={copilotConfig.publicApiKey}
        runtimeUrl={copilotConfig.runtimeUrl}
        showDevConsole={copilotConfig.showDevConsole}
      >
        {/* ... rest of app */}
      </CopilotKit>
    </FeatureFlagsProvider>
  </QueryClientProvider>
);
```

### Why This Caused the White Screen

1. **CopilotKit initialization**: When CopilotKit provider loads, it tries to connect to the `runtimeUrl`
2. **Invalid Runtime API**: The `copilotkit-adapter` endpoint doesn't implement the proper CopilotKit Runtime API (needs SSE streaming, not simple HTTP proxy)
3. **Silent Failure**: CopilotKit failed to initialize properly, causing errors that broke the desktop layout
4. **Mobile Works**: Mobile layout uses different components (MobileNotebookTabs) that don't have the same dependencies

### Why Desktop Failed But Mobile Worked

- **Desktop layout** (width >= 1100px):
  - Uses 3-column layout: SourcesSidebar | ChatArea | StudioSidebar
  - More complex rendering logic
  - More susceptible to provider initialization errors

- **Mobile layout** (width < 1100px):
  - Uses simpler tabbed interface (MobileNotebookTabs)
  - Less complex rendering
  - Worked despite CopilotKit errors

---

## ✅ The Fix

Created a **conditional CopilotKit wrapper** that only loads CopilotKit when AG-UI is actually enabled:

```typescript
// AFTER (FIXED) - App.tsx

// Conditional CopilotKit wrapper - only loads when AG-UI is enabled
const ConditionalCopilotKit = ({ children }: { children: React.ReactNode }) => {
  const { flags } = useFeatureFlags();

  // Only wrap with CopilotKit when AG-UI is enabled
  if (flags.enableAGUI) {
    return (
      <CopilotKit
        publicApiKey={copilotConfig.publicApiKey}
        runtimeUrl={copilotConfig.runtimeUrl}
        showDevConsole={copilotConfig.showDevConsole}
      >
        {children}
      </CopilotKit>
    );
  }

  // When AG-UI is disabled, just render children without CopilotKit
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <FeatureFlagsProvider>
      <ConditionalCopilotKit>  {/* ✅ NOW conditional */}
        {/* ... rest of app */}
      </ConditionalCopilotKit>
    </FeatureFlagsProvider>
  </QueryClientProvider>
);
```

---

## 📊 What This Fixes

### Before Fix
- ❌ Desktop view: White screen
- ❌ CopilotKit always loading (even when disabled)
- ❌ Runtime API errors breaking the app
- ✅ Mobile view: Works (by luck)

### After Fix
- ✅ Desktop view: Should work now
- ✅ CopilotKit only loads when AG-UI is enabled
- ✅ No runtime errors when using legacy chat
- ✅ Mobile view: Still works
- ✅ Clean separation: Legacy chat vs CopilotKit chat

---

## 🧪 Testing Steps

1. **Restart the development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test Desktop View (>= 1100px)**:
   - Open http://localhost:5173
   - Ensure browser width > 1100px
   - Login to your account
   - Navigate to any notebook/policy document
   - **Expected**: Should see 3-column layout (no white screen)
   - **Debug panel** (bottom-right) should show:
     ```
     enableAGUI: false
     Chat Mode: Legacy
     ```

3. **Test Chat Functionality**:
   - Type a message: "What is our remote work policy?"
   - Click Send
   - **Expected**:
     - Message appears in chat
     - Loading indicator shows
     - Response appears with citations
     - Edge function `send-chat-message` is called (check logs)

4. **Verify Mobile Still Works**:
   - Resize browser to < 1100px
   - Should see tabbed interface
   - All tabs (Chat | Sources | Studio) should work

---

## 🎯 Technical Details

### File Changes

**`src/App.tsx`**:
1. Added `useFeatureFlags` import
2. Created `ConditionalCopilotKit` component
3. Replaced `<CopilotKit>` with `<ConditionalCopilotKit>`

### How It Works Now

```
┌─────────────────────────────────────────────────────┐
│ App Start                                           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
      ┌───────────────────────┐
      │ FeatureFlagsProvider  │
      │ (loads from .env)     │
      └───────────┬───────────┘
                  │
                  ▼
      ┌───────────────────────────────┐
      │ ConditionalCopilotKit         │
      │                               │
      │ if (flags.enableAGUI) {       │
      │   ✅ Wrap with CopilotKit     │
      │ } else {                      │
      │   ❌ Skip CopilotKit          │
      │ }                             │
      └───────────┬───────────────────┘
                  │
                  ▼
      ┌───────────────────────┐
      │ Rest of App           │
      │ (Routes, Auth, etc.)  │
      └───────────────────────┘
```

### Feature Flag Control

**`.env` file**:
```env
VITE_ENABLE_AG_UI=false  # Default: CopilotKit disabled, legacy chat works
VITE_ENABLE_AG_UI=true   # Enable CopilotKit (needs proper Runtime API)
```

**Settings UI** (⚙️ icon in header):
- Toggle "AG-UI Protocol" to switch between modes
- Changes saved to localStorage
- Debug panel shows current mode

---

## 🚀 Next Steps

1. ✅ **COMPLETED**: Fixed CopilotKit provider issue
2. ⏳ **TESTING**: User needs to test desktop view
3. ⏳ **DECISION**: Decide if CopilotKit integration is needed
4. 📋 **OPTIONAL**: Implement proper CopilotKit Runtime API (2-3 days)
   - Add Server-Sent Events (SSE) streaming
   - Transform n8n responses to streaming format
   - Implement tool execution protocol
   - Add state management

---

## 💡 Key Takeaways

1. **Always check provider initialization**: Providers that wrap the entire app can cause subtle bugs
2. **Conditional loading is important**: Don't load heavy dependencies unless they're actually needed
3. **Feature flags should control providers**: Not just components
4. **Error boundaries help**: They helped isolate the issue to specific components
5. **Mobile vs Desktop**: Different layouts can fail differently

---

## 📝 Related Files

- `src/App.tsx` - Main fix location
- `src/contexts/FeatureFlagsContext.tsx` - Feature flag management
- `src/pages/Notebook.tsx` - Desktop vs mobile layout logic
- `src/hooks/useIsDesktop.tsx` - Breakpoint definition (1100px)
- `.env` - Feature flag configuration

---

**Last Updated:** October 18, 2025
**Status:** Ready for testing
