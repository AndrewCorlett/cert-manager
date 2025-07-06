# Cert Manager - Phase 1 UI-Only Build

A Progressive Web App for professional certificate management with a mobile-first design and buttery-smooth animations.

## ✨ Features

- **Mobile-First PWA**: Optimized for mobile devices with installable PWA support
- **Floating Navigation**: Innovative bottom navigation bar with smooth expand/collapse animations
- **Certificate Management**: View, organize, and manage professional certificates
- **PDF Viewer**: Integrated PDF viewing with react-pdf
- **Smart Organization**: Categorized filing system (STCW, GWO, OPITO, Contracts)
- **Send Functionality**: Email certificates with customizable templates
- **Settings Management**: Profile and document-specific settings
- **Dark Theme**: Professional dark UI with gold accents

### 🤖 AI-Powered Features

- **Smart Document Analysis**: Automatically extract certificate details from PDFs using GPT-4
- **Intelligent Categorization**: AI categorizes certificates by type (STCW, GWO, OPITO, etc.)
- **Document Quality Assessment**: Analyze PDF quality and suggest improvements
- **Smart Email Templates**: Generate professional emails for certificate sharing
- **Validation Intelligence**: Detect data inconsistencies and potential issues

## 🎨 Design System

### Color Palette
- **Grey-900** (`#121212`) - Primary darkest background
- **Grey-700** (`#1E1E1E`) - Secondary background  
- **Grey-500** (`#3B3B3B`) - Borders, muted icons
- **White-pure** (`#FFFFFF`) - Text & icon default
- **Gold-accent** (`#C89B3C`) - Active/selected states
- **Error-red** (`#F43F5E`) - Expired certificate count
- **Success-green** (`#10B981`) - Valid certificate count
- **Warn-amber** (`#F59E0B`) - Upcoming expiry count

### Animation
- **Easing**: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (iOS-like ease-out-quart)
- **Duration**: 300ms standard, 180ms micro-interactions
- **Blur Effects**: 4px backdrop blur during navigation expansion

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

### AI Features Setup (Optional)

To enable AI-powered features, you'll need an OpenAI API key:

1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. **Copy Environment File**: 
   ```bash
   cp .env.local.example .env.local
   ```
3. **Add Your API Key**:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
   ```
4. **Security Note**: The API key is exposed to the browser, so:
   - Set usage limits in your OpenAI dashboard
   - Restrict the API key to your domain
   - Monitor usage to control costs

**Without AI setup**: The app works fully without an API key - you'll just see fallback behavior for AI features.

### Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Building
npm run build        # Production build
npm run start        # Start production server

# Quality Assurance
npm run lint         # ESLint
npm run test         # Playwright e2e tests
npm run e2e          # Alias for test

# Storybook
npm run storybook    # Start Storybook dev server
npm run build-storybook  # Build Storybook
```

## 📱 Navigation System

The **FloatingNavBar** is the core navigation component with these states:

- **Collapsed** (60px height) - Shows all 4 icons
- **Expanded** (auto height) - Active icon slides left, panel content appears
- **Backdrop Blur** - Background blurs during expansion

### Navigation Modes

| Icon | Mode | Panel Content |
|------|------|---------------|
| 🏠 Home | - | Navigate to home page |
| 📂 List | `list` | Certificate file tree |
| ✉️ Send | `send.step1` → `send.step2` | Email workflow |
| ⚙️ Settings | `settings.home` / `settings.doc` | Profile or document settings |

## 📄 Pages

### Home (`/`)
- Certificate statistics widget
- Expandable file tree by category
- Long-press to open document settings

### Certificate Viewer (`/cert/[id]`)
- Full-screen PDF display
- Floating name badge
- Settings panel active by default

### Upload (`/upload`)
- Camera scan button (Phase 2)
- File upload with preview
- Mock integration ready

## 🧩 Component Architecture

### Core Components

- **FloatingNavBar** - Main navigation with smooth animations
- **StatWidget** - Certificate count dashboard
- **FileTree** - Hierarchical certificate browser
- **PDFViewer** - react-pdf integration with navigation
- **SendPanel** - Multi-step email workflow
- **SettingsPanel** - Context-aware settings forms

### State Management

Using **Zustand** for certificate store:

```typescript
interface CertificateStore {
  certificates: Certificate[];
  selectedCertificates: string[];
  currentViewingCert: Certificate | null;
  // ... actions
}
```

## 🔗 Backend Integration Points

All backend integration points are documented in [`BACKEND_LINKS.md`](./BACKEND_LINKS.md).

**Phase 2 Integration**:
- Supabase database + auth
- OpenAI vision for certificate OCR
- Real-time notifications
- Email service integration

Key stubbed functions marked with `// TODO BACKEND:ID`:
- `FETCH_CERTS` - Load certificates from database
- `UPLOAD_FILE` - Process PDF uploads with AI
- `SEND_CERTIFICATES` - Email service integration
- `DELETE_CERT` - Remove certificates
- `SAVE_SETTINGS` - Persist user preferences

## 🎭 Storybook

Interactive component documentation available at:

```bash
npm run storybook
# Visit http://localhost:6006
```

Stories include:
- FloatingNavBar state transitions
- PDFViewer with sample certificate
- Send panel workflows
- Settings panel variations

## 🧪 Testing

### E2E Tests (Playwright)

```bash
npm run e2e
```

Tests cover:
- Navigation bar expansion/collapse
- Panel content visibility
- Animation timing
- Mobile interaction patterns

## 📦 PWA Configuration

The app is configured as a PWA with:
- Manifest file for installation
- Service worker ready (Phase 2)
- Mobile-optimized viewport
- Apple touch icons

## 🏗️ Project Structure

```
src/
├── app/                   # Next.js App Router
│   ├── cert/[id]/        # Certificate viewer
│   ├── upload/           # Upload page
│   ├── globals.css       # Global styles + design tokens
│   ├── layout.tsx        # Root layout with PWA meta
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── FloatingNavBar.tsx
│   ├── PDFViewer.tsx
│   ├── SendPanel.tsx
│   ├── SettingsPanel.tsx
│   ├── StatWidget.tsx
│   └── FileTree.tsx
└── lib/
    ├── design-tokens.ts  # Design system constants
    ├── store.ts         # Zustand state management
    └── utils.ts         # Utility functions
```

## 🎯 Phase 2 Roadmap

The current build provides a complete UI foundation for Phase 2 backend integration:

1. **Database Integration** - Replace mock data with Supabase
2. **Authentication** - Google OAuth via Supabase Auth
3. **File Processing** - AI-powered certificate OCR and categorization
4. **Real-time Features** - Live certificate status updates
5. **Notifications** - Automated expiry alerts
6. **Advanced Search** - Full-text search across certificates
7. **Backup/Sync** - Cloud storage and cross-device sync

## 📝 License

This project is part of a certificate management system development phase.

---

**Built with**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, react-pdf, Zustand