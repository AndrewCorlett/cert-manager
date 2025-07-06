# Bulletproof Localhost Launch Guidelines

## Quick Launch Commands

### Primary Development Server
```bash
cd "New folder"
npm run dev
```
- **URL**: http://localhost:3000
- **Purpose**: Main Next.js application
- **Status**: ✅ Working

### Component Development (Storybook)
```bash
cd "New folder"
npm run storybook
```
- **URL**: http://localhost:6006
- **Purpose**: Component library and testing
- **Status**: ⚠️ Working with minor error

## Troubleshooting Checklist

### 1. Port Conflicts
- **Check if ports are in use**: `lsof -i :3000` and `lsof -i :6006`
- **Kill existing processes**: `kill -9 <PID>`
- **Alternative ports**: Use `npm run dev -- -p 3001` if needed

### 2. Dependency Issues
- **Clear cache**: `npm cache clean --force`
- **Reinstall**: `rm -rf node_modules package-lock.json && npm install`
- **Check Node version**: Ensure Node 18+ is installed

### 3. Build Issues
- **Check build**: `npm run build` before starting dev server
- **Lint check**: `npm run lint`
- **TypeScript check**: `npx tsc --noEmit`

### 4. Environment Issues
- **Working directory**: Always run from `"New folder"` directory
- **Environment variables**: Check if `.env.local` exists and is properly configured
- **Permissions**: Ensure proper file permissions for node_modules

## Known Issues & Fixes

### Storybook FloatingNavBar Error
**Issue**: `Cannot read properties of null (reading 'startsWith')`
**Location**: `src/components/FloatingNavBar.tsx:60`
**Cause**: `pathname` is null in Storybook environment
**Fix**: Add null checks:
```typescript
if (pathname?.startsWith('/cert/')) {
  setMode('settings.doc');
} else {
  setMode('settings.home');
}
```

## Testing Verification

### Automated Test Script
```bash
# Test both servers
curl -s http://localhost:3000 > /dev/null && echo "✅ Next.js server running" || echo "❌ Next.js server down"
curl -s http://localhost:6006 > /dev/null && echo "✅ Storybook server running" || echo "❌ Storybook server down"
```

### Manual Verification
1. Navigate to http://localhost:3000 - Should show Cert Manager dashboard
2. Navigate to http://localhost:6006 - Should show Storybook interface
3. Check browser console for any critical errors

## Development Workflow

1. **Start servers**: Always run both `npm run dev` and `npm run storybook` for full development
2. **Check status**: Use browser dev tools to monitor for errors
3. **Component testing**: Use Storybook for isolated component development
4. **Integration testing**: Use main app for full feature testing

## Emergency Recovery

If localhost completely fails:
1. `pkill -f "next\|storybook"`
2. `rm -rf .next node_modules package-lock.json`
3. `npm install`
4. `npm run dev`

## Success Indicators

- ✅ Next.js shows "Ready in Xms" message
- ✅ Storybook shows "Storybook X.X.X for nextjs started"
- ✅ Browser can access both URLs without connection errors
- ✅ No critical JavaScript errors in browser console