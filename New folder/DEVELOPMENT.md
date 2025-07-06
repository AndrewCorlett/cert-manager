# Development Setup

## NPM Scripts

### Development Servers
- `npm run dev` - Start development server with network access (accessible from other devices)
- `npm run dev:local` - Start development server for localhost only
- `npm run build` - Build for production
- `npm run start` - Start production server

### Testing & Quality
- `npm run lint` - Run ESLint
- `npm run test` - Run Playwright tests
- `npm run e2e` - Run end-to-end tests

### Storybook
- `npm run storybook` - Start Storybook development server
- `npm run build-storybook` - Build Storybook for production

## Network Access

The main `npm run dev` command now enables network access:
- **Local access**: http://localhost:3000
- **Network access**: http://[your-ip]:3000

To find your IP address:
- **Windows**: `ipconfig`
- **macOS/Linux**: `ifconfig` or `ip addr show`

### Example
If your IP is `192.168.1.100`, the app will be accessible at:
- http://192.168.1.100:3000

## Development Improvements

### Removed Turbopack
- Removed `--turbopack` flag for better stability
- Using standard Next.js with SWC compiler for optimal performance

### Added Configuration
- `next.config.js` - Optimized development and build configuration
- Network binding (`-H 0.0.0.0`) for external access
- Explicit port binding (`-p 3000`) for consistency

### Performance Optimizations
- SWC minification enabled
- Optimized package imports for better bundle size
- Development-specific webpack optimizations
- Source maps configuration

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Network Access Issues
1. Ensure your firewall allows connections on port 3000
2. Make sure devices are on the same network
3. Some corporate networks may block development servers

### Development Server Won't Start
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for Node.js version compatibility (requires Node 18+)

## Environment Variables

Create a `.env.local` file for local development:
```env
# OpenAI API Key for certificate processing
NEXT_PUBLIC_OPENAI_API_KEY=your_api_key_here

# Development-specific variables
NODE_ENV=development
```

## VS Code Configuration

Recommended `.vscode/settings.json`:
```json
{
  "typescript.preferences.autoImportFileExcludePatterns": [
    "next/router.d.ts",
    "next/dist/client/router.d.ts"
  ],
  "eslint.workingDirectories": ["./"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```