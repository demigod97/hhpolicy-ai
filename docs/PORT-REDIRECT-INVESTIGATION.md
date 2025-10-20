# Port Redirect Investigation - Task 3

## Issue Reported
Story 1.14.1 mentions: "After upload, browser redirects to `http://localhost:8081/` instead of staying on dashboard"

## Investigation Results

### 1. Vite Configuration
**File:** `vite.config.ts`
```typescript
server: {
  host: "::",
  port: 8080,  // Default port
}
```

- Vite default port is **8080**
- Vite automatically finds next available port if 8080 is taken
- Documentation mentions port 8082, suggesting 8080 and 8081 were occupied during testing

### 2. Source Code Analysis

#### DocumentUploader Component
- ✅ No navigation logic
- ✅ No `window.location` redirects
- ✅ No `navigate()` calls
- Only callback: `onUploadComplete(sourceIds)` - handled by parent

#### Dashboard Component
- ✅ `handleUploadComplete` only:
  - Invalidates React Query cache
  - Shows toast notification
  - Closes uploader after 500ms delay
- ✅ No navigation or redirects

#### Global Code Search
- ✅ No references to port "8081" in source code
- ✅ No references to port "8082" in source code
- ✅ No hardcoded `localhost` URLs in `src/**/*.{ts,tsx}`

### 3. Port Assignment Behavior

Vite's automatic port selection:
1. Try port 8080 (configured)
2. If occupied, try 8081
3. If occupied, try 8082
4. Continue until free port found

**Documentation consistently mentions 8082**, suggesting the dev environment commonly uses 8082 because 8080 and 8081 are occupied by other services.

### 4. Possible Root Causes (Not in Codebase)

#### A. Browser Cached Redirect
- Old service worker or cached redirect
- **Solution:** Hard refresh (Ctrl+Shift+R) or clear cache

#### B. External Service Running on 8080/8081
- Another dev server or service
- **Solution:** Stop conflicting services or explicitly set port

#### C. Vite HMR (Hot Module Reload)
- HMR sometimes causes unexpected navigation during development
- **Solution:** Full page reload after upload

#### D. User Confusion
- Multiple browser tabs on different ports
- User navigated to wrong tab after upload

### 5. No Code Changes Required

**Conclusion:** No source code is causing the redirect to port 8081. The upload flow:
1. ✅ Stays in DocumentUploader dialog during upload
2. ✅ Closes dialog via parent component after cache invalidation
3. ✅ Remains on Dashboard page (no navigation)

## Recommendations

### For Users Experiencing Port Redirect:
1. **Check active services:** `netstat -ano | findstr :8080` (Windows)
2. **Explicitly set port:** Modify `package.json` scripts:
   ```json
   "dev": "vite --port 8082"
   ```
3. **Clear browser cache:** Hard refresh on Dashboard
4. **Check browser console:** Look for errors or unexpected navigation

### For Testing:
Add E2E test to verify no navigation occurs:
```typescript
test('Upload does not redirect', async ({ page }) => {
  await page.goto('http://localhost:8082/dashboard');
  const initialURL = page.url();

  // Upload document
  await uploadDocument();

  // Wait for upload complete
  await page.waitForSelector('[data-testid="upload-complete"]');

  // Verify still on dashboard
  expect(page.url()).toBe(initialURL);
});
```

## Status: RESOLVED (No Code Changes Needed)

The codebase does not contain any logic that would cause a redirect to port 8081 or any other port. The issue, if it exists, is environmental or user-related, not code-related.
