# Cert Manager - UI Implementation Job List

This document provides an extensive, granular job list for implementing the complete UI. Each job is estimated and organized by complexity and dependencies.

## 📋 **How to Use This Job List**

### **📝 For Current Developers**
1. **Choose a job** from the appropriate priority level (start with 🔴 Critical Path)
2. **Read all references** and specifications before starting
3. **Mark as in-progress** by adding your initials and start date: `[STARTED: JD 2025-01-15]`
4. **Complete the implementation** following all specified requirements
5. **Mark as completed** with a brief implementation note: `[COMPLETED: JD 2025-01-16 - Used Framer Motion variants with cubic-bezier timing]`
6. **Update acceptance criteria** if implementation differs from spec
7. **Make Proper use of available MCP tooling especially, Puppeteer for front end testing and Supabase for backend implementation, and context7 for a true source of documentation. 

### **🎓 For Future Developers**
- **Read completion notes** to understand how each feature was implemented
- **Check git commits** referenced in completion notes for detailed code changes
- **Use implementation notes** to quickly understand architecture decisions
- **Follow established patterns** from completed jobs when working on similar features

### **✅ Completion Note Format**
```
[COMPLETED: INITIALS DATE - Brief implementation summary (8-12 words)]
```

**Examples:**
- `[COMPLETED: JD 2025-01-15 - Implemented with CSS variables and Tailwind utilities]`
- `[COMPLETED: SM 2025-01-16 - Used Zustand store with TypeScript interfaces]`
- `[COMPLETED: AB 2025-01-17 - Framer Motion variants with stagger animations]`

### **🔄 Progress Tracking**
- **In Progress**: `[STARTED: INITIALS DATE]`
- **Blocked**: `[BLOCKED: INITIALS DATE - Reason for blocking]`
- **Completed**: `[COMPLETED: INITIALS DATE - Implementation approach]`
- **Needs Review**: `[REVIEW: INITIALS DATE - Ready for code review]`

### **📋 Maintaining This Document**
- **Keep completion notes concise** but informative for future developers
- **Update specifications** if implementation reveals better approaches
- **Add new jobs** if unexpected requirements are discovered during development
- **Reference git commit hashes** in completion notes for detailed code changes
- **Document deviations** from original specifications with reasoning
- **Update estimates** based on actual completion times for future planning

### **🔍 Quick Status Overview**
At any time, search for:
- `[COMPLETED:` to see finished jobs
- `[STARTED:` to see work in progress
- `[BLOCKED:` to identify blockers needing resolution
- Unmarked jobs to see remaining work

## 📋 **Job Categories & Priority**

- **🔴 Critical Path** - Core functionality, must be completed first
- **🟡 High Priority** - Important features, should be completed early
- **🟢 Medium Priority** - Nice-to-have features, can be done later
- **🔵 Polish & Enhancement** - Final touches and optimizations

## 🔗 **Essential References**

Before starting any job, developers should reference these key documents:

### **📷 Reference Images** (in `/non-codebase/Ref img/`)
- `Screenshot 2025-07-05 161530.png` - Home page with collapsed navbar
- `Screenshot 2025-07-05 161545.png` - Certificate viewer (full-screen PDF)
- `Screenshot 2025-07-05 161550.png` - List mode (expanded navbar)
- `Screenshot 2025-07-05 161604.png` - Settings panel (profile mode)
- `Screenshot 2025-07-05 161609.png` - Settings panel (document mode)
- `Screenshot 2025-07-05 161616.png` - Send panel Step 1
- `Screenshot 2025-07-05 161621.png` - Send panel Step 2

### **📁 Existing Code References**
- `src/lib/design-tokens.ts` - All colors, spacing, animation values
- `src/lib/store.ts` - Certificate data model and Zustand store
- `src/components/FloatingNavBar.tsx` - Complete navbar implementation
- `src/components/StatWidget.tsx` - Statistics display
- `src/components/FileTree.tsx` - Certificate browser
- `src/components/PDFViewer.tsx` - PDF display component
- `src/components/SendPanel.tsx` - Send workflow
- `src/components/SettingsPanel.tsx` - Settings forms
- `BACKEND_LINKS.md` - All TODO BACKEND markers and integration points

### **📋 Sample Data**
Mock certificate data is in `src/lib/store.ts` with these categories:
- **STCW**: Basic Fire Fighting, Medical First Aid, Personnel Survival Techniques, Social & Security
- **GWO**: Basic Safety Training
- **OPITO**: (add your own samples)
- **Contracts**: (add your own samples)

Each certificate has:
```typescript
{
  id: string;
  name: string;
  category: 'STCW' | 'GWO' | 'OPITO' | 'Contracts' | 'Other';
  filePath: string;
  issueDate: string; // YYYY-MM-DD format
  expiryDate: string; // YYYY-MM-DD format
  serialNumber: string;
  status: 'valid' | 'expired' | 'upcoming';
  pdfUrl: string; // Path to PDF file
}
```

### **🎬 Sample PDF Asset**
Use `/public/dev-assets/ENG-1-2023.pdf` for testing PDF viewer functionality.

## 🎨 **Design System Reference**

### **Colors (use exact hex values)**
```css
--grey-900: #121212    /* Primary background */
--grey-700: #1E1E1E    /* Secondary background */
--grey-500: #3B3B3B    /* Borders, inactive icons */
--white-pure: #FFFFFF  /* Primary text */
--gold-accent: #C89B3C /* Active states, selections */
--error-red: #F43F5E   /* Expired certificates */
--success-green: #10B981 /* Valid certificates */
--warn-amber: #F59E0B  /* Upcoming expiry */
```

### **Animation Specifications**
```css
/* Easing Function */
cubic-bezier(0.25, 0.46, 0.45, 0.94) /* iOS-like ease-out-quart */

/* Timing */
300ms /* Standard animations */
180ms /* Micro-interactions */
```

### **NavBar Specifications**
```css
/* Collapsed State */
height: 60px
width: clamp(90%, 350px, 100%)
border-radius: 30px
box-shadow: 0 4px 20px rgba(0,0,0,0.4)

/* Expanded State */
height: auto (grows upward)
border-radius: 20px
max-height: 85vh
backdrop-filter: blur(4px)
```

## 🎭 **Animation Definitions**

### **"Button Morphing Effects"**
Refers to buttons that change size, color, or shape during interactions:
```css
/* Send Button Example */
.send-button {
  /* Disabled State */
  background-color: var(--grey-500);
  opacity: 0.5;
  
  /* Enabled State */
  background-color: var(--gold-accent);
  opacity: 1;
  
  /* Transition */
  transition: all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
```

### **"Smooth Transitions"**
All state changes should use the standard easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- Standard duration: 300ms
- Micro-interactions: 180ms
- Never use linear or default easing

### **"Shared Element Transitions"**
When navigating between pages, elements should appear to morph:
- Certificate cards → Full PDF viewer
- Navbar icons → Panel headers
- Use Framer Motion's `layoutId` prop for automatic shared animations

### **"Physics-Based Animations"**
Use Framer Motion's spring animations for natural feel:
```typescript
const springConfig = {
  type: "spring",
  damping: 20,
  stiffness: 100
};
```

## 📖 **Development Terms Glossary**

### **"Apple-grade animations"**
Refers to smooth, polished animations similar to iOS:
- Always use `cubic-bezier(0.25, 0.46, 0.45, 0.94)` easing
- 60fps performance (use transform and opacity only)
- Natural, non-linear motion curves
- Subtle bounce/spring effects for interactions

### **"Floating Navigation"**
The main navigation component positioned at bottom of screen:
- Fixed position with `bottom: 24px`
- Rounded corners (30px → 20px when expanded)
- Semi-transparent dark background
- Shadow depth for elevation

### **"Backdrop blur"**
Semi-transparent overlay behind expanded navbar:
- `backdrop-filter: blur(4px)`
- Slight darkening of background content
- Maintains visibility of underlying content

### **"Context-aware panels"**
Settings panel content changes based on current page:
- Home page → Profile settings (email, notifications)
- Certificate viewer → Document settings (dates, file location)

### **"Stagger effects"**
Animated elements appearing in sequence with slight delay:
```typescript
transition: {
  staggerChildren: 0.1, // 100ms delay between items
  delayChildren: 0.2    // Initial delay before first item
}
```

### **"Touch-friendly sizing"**
Minimum touch target sizes for mobile:
- Buttons: 44px minimum height
- Icons: 24px with 20px padding (64px total touch area)
- List items: 48px minimum height

### **"Long-press detection"**
Mobile gesture for secondary actions:
```typescript
onTouchStart={() => {
  const timer = setTimeout(() => handleLongPress(), 500);
  const cleanup = () => clearTimeout(timer);
  document.addEventListener('touchend', cleanup, { once: true });
}}
```

---

## **🏗️ FOUNDATION & SETUP JOBS**

### **ENV-001: Project Bootstrap** 🔴 `[COMPLETED: EXAMPLE 2025-01-15 - Next.js 15 with TypeScript, Tailwind, App Router]`
- **Task**: Initialize Next.js project with TypeScript
- **Estimate**: 1 hour
- **References**: Follow Next.js documentation at https://nextjs.org/docs/getting-started/installation
- **Exact Commands**:
  ```bash
  npx create-next-app@latest cert-manager-codebase --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
  cd cert-manager-codebase
  ```
- **File Structure Required**:
  ```
  src/
  ├── app/
  ├── components/
  └── lib/
  ```
- **Acceptance**: Project starts successfully with `npm run dev` on http://localhost:3000

### **ENV-002: Dependencies Installation** 🔴  
- **Task**: Install all required packages
- **Estimate**: 1 hour
- **References**: Check existing `package.json` for exact versions
- **Exact Commands**:
  ```bash
  npm install framer-motion lucide-react zustand react-pdf pdfjs-dist@3.11.174
  npm install @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-select
  npm install --save-dev @storybook/nextjs@8.6.14 @storybook/react@8.6.14 @storybook/addon-essentials@8.6.14 @playwright/test
  npx shadcn@latest init
  npx shadcn@latest add button dialog accordion alert-dialog select checkbox
  ```
- **Acceptance**: All packages install without conflicts, shadcn/ui components available

### **ENV-003: Design System Configuration** 🔴
- **Task**: Set up design tokens and CSS variables
- **Estimate**: 2 hours
- **References**: Copy exact values from design system reference above
- **Files to Create**:
  - `src/lib/design-tokens.ts` (see existing file for exact structure)
  - Update `src/app/globals.css` with CSS custom properties
- **Exact CSS Variables to Add**:
  ```css
  :root {
    --grey-900: #121212;
    --grey-700: #1E1E1E;
    --grey-500: #3B3B3B;
    --white-pure: #FFFFFF;
    --gold-accent: #C89B3C;
    --error-red: #F43F5E;
    --success-green: #10B981;
    --warn-amber: #F59E0B;
  }
  
  @layer utilities {
    .ease-out-quart {
      transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .navbar-shadow {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .blur-backdrop {
      backdrop-filter: blur(4px);
    }
  }
  ```
- **Acceptance**: Design tokens accessible via CSS variables and TypeScript exports

### **ENV-004: Project Structure** 🔴
- **Task**: Organize folder structure and routing
- **Estimate**: 1 hour
- **References**: Follow existing structure in completed codebase
- **Required Folder Structure**:
  ```
  src/
  ├── app/
  │   ├── cert/[id]/page.tsx
  │   ├── upload/page.tsx
  │   ├── globals.css
  │   ├── layout.tsx
  │   └── page.tsx
  ├── components/
  │   ├── ui/ (shadcn components)
  │   ├── FloatingNavBar.tsx
  │   ├── StatWidget.tsx
  │   ├── FileTree.tsx
  │   ├── PDFViewer.tsx
  │   ├── SendPanel.tsx
  │   └── SettingsPanel.tsx
  ├── lib/
  │   ├── design-tokens.ts
  │   ├── store.ts
  │   └── utils.ts
  public/
  ├── dev-assets/
  ├── manifest.json
  └── [icon files]
  ```
- **Acceptance**: Clean, scalable folder structure matching specification

### **ENV-005: Development Guidelines** 🔴
- **Task**: Establish team development standards
- **Estimate**: 2 hours
- **References**: Based on existing codebase patterns and React best practices
- **Code Style Guidelines**:
  ```typescript
  // Component Structure
  'use client'; // Always at top for client components
  
  import { useState } from 'react';
  import { motion } from 'framer-motion';
  import { ComponentName } from '@/components/ui/component';
  
  interface Props {
    // Define all props with TypeScript
  }
  
  export default function ComponentName({ prop }: Props) {
    // State hooks first
    // Effect hooks second
    // Custom hooks third
    // Functions last
    
    return (
      <div className="style-classes">
        {/* JSX content */}
      </div>
    );
  }
  ```
- **Animation Standards**:
  ```typescript
  // Always use design system timing
  const standardTransition = {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94]
  };
  
  const microTransition = {
    duration: 0.18,
    ease: [0.25, 0.46, 0.45, 0.94]
  };
  ```
- **Color Usage**:
  ```css
  /* Always use CSS variables, never hardcoded hex */
  style={{ color: 'var(--white-pure)' }}
  style={{ backgroundColor: 'var(--grey-900)' }}
  ```
- **Component Patterns**:
  - Use TypeScript interfaces for all props
  - Export as default from component files
  - Place in appropriate folders (ui/ for reusable, root for page-specific)
  - Include TODO BACKEND: comments for integration points
- **Testing Requirements**:
  - Unit tests for utility functions
  - Integration tests for user workflows
  - Visual regression tests for animations
  - Mobile device testing for touch interactions
- **Acceptance**: All developers follow consistent patterns, code reviews check adherence

---

## **🧩 CORE COMPONENT JOBS**

### **COMP-001: Basic Button Components** 🔴
- **Task**: Implement shadcn/ui button variants
- **Estimate**: 2 hours
- **Details**:
  - Install and configure shadcn/ui button
  - Create custom button styles matching design
  - Add loading states and disabled states
  - Test button variants (primary, secondary, destructive)
- **Acceptance**: Reusable button component with all states

### **COMP-002: Icon System Setup** 🔴
- **Task**: Create icon component system
- **Estimate**: 1.5 hours
- **Details**:
  - Set up Lucide React icons
  - Create custom SVG icon components for navbar
  - Implement icon sizing and color variants
  - Create icon utility functions
- **Acceptance**: Consistent icon system across app

### **COMP-003: Form Components** 🟡
- **Task**: Build form input components
- **Estimate**: 3 hours
- **Details**:
  - Create text input with dark theme styling
  - Build date picker component
  - Implement select dropdown component
  - Add textarea component
  - Include form validation states
- **Acceptance**: Complete form component library

### **COMP-004: Dialog & Modal System** 🟡
- **Task**: Implement modal and dialog components
- **Estimate**: 2.5 hours
- **Details**:
  - Set up Radix Dialog primitive
  - Style confirmation dialogs
  - Create alert dialog for destructive actions
  - Add modal backdrop and focus management
- **Acceptance**: Accessible modal system

---

## **🧭 NAVIGATION SYSTEM JOBS**

### **NAV-001: FloatingNavBar Structure** 🔴
- **Task**: Create basic navbar container and layout
- **Estimate**: 3 hours
- **References**: 
  - Reference image: `Screenshot 2025-07-05 161530.png` shows collapsed navbar
  - See existing `src/components/FloatingNavBar.tsx` for complete implementation
- **Exact Specifications**:
  ```css
  /* Container Positioning */
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  
  /* Sizing */
  width: clamp(90%, 350px, 100%);
  height: 60px; /* collapsed state */
  
  /* Styling */
  background-color: var(--grey-900);
  border-radius: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  
  /* Icon Layout */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  ```
- **Icons Required** (from Lucide React):
  - `Home` (24x24px)
  - `List` (24x24px) 
  - `Send` (24x24px)
  - `Settings` (24x24px)
- **Icon Colors**:
  - Default: `var(--grey-500)`
  - Active: `var(--gold-accent)`
- **Acceptance**: Static navbar renders at bottom with 4 icons in correct positions

### **NAV-002: Icon Animations** 🔴
- **Task**: Implement icon slide animations
- **Estimate**: 4 hours
- **References**: 
  - Animation timing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` over 180ms
  - See design brief: "Active icon glides left to x = 20px; others fade & slide (x: ±40px, opacity: 0)"
- **Exact Framer Motion Variants**:
  ```typescript
  const iconVariants = {
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    hidden: {
      x: 40, // slides right off-screen
      opacity: 0,
      transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    activeLeft: {
      x: -140, // slides to left position
      opacity: 1,
      transition: { duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };
  ```
- **Animation Behavior**:
  - When expanding: Active icon slides left, others slide right and fade out
  - When collapsing: Icons slide back to center and fade in
  - Stagger delay: 30ms between icon animations
- **Acceptance**: Icons smoothly animate on navbar expand/collapse with exact timing

### **NAV-003: Expand/Collapse Animation** 🔴
- **Task**: Implement navbar height and radius animations
- **Estimate**: 3.5 hours
- **Details**:
  - Animate height from 60px to auto
  - Morph border-radius from 30px to 20px
  - Sync animations with icon movements
  - Add proper layout shift prevention
- **Acceptance**: Smooth navbar expansion/collapse

### **NAV-004: Backdrop Blur Effect** 🟡
- **Task**: Add backdrop blur during expansion
- **Estimate**: 2 hours
- **Details**:
  - Create backdrop overlay component
  - Implement blur(4px) effect
  - Add fade in/out animations
  - Sync with navbar expansion state
- **Acceptance**: Smooth backdrop blur effect

### **NAV-005: Swipe Gesture Handling** 🟡
- **Task**: Add swipe-to-close functionality
- **Estimate**: 3 hours
- **Details**:
  - Implement drag detection with Framer Motion
  - Set up velocity and distance thresholds
  - Add visual feedback during drag
  - Handle edge cases and touch events
- **Acceptance**: Reliable swipe-to-close gesture

### **NAV-006: Navigation State Management** 🔴
- **Task**: Implement navigation mode system
- **Estimate**: 2.5 hours
- **Details**:
  - Create NavMode type definitions
  - Handle mode transitions
  - Add state persistence logic
  - Implement mode-specific behaviors
- **Acceptance**: Robust navigation state system

---

## **📊 HOME PAGE JOBS**

### **HOME-001: Page Layout Structure** 🔴
- **Task**: Create home page basic layout
- **Estimate**: 2 hours
- **Details**:
  - Set up page container with proper spacing
  - Add header with app title
  - Create main content area
  - Implement mobile-first responsive design
- **Acceptance**: Clean home page layout

### **HOME-002: Statistics Widget** 🔴
- **Task**: Build certificate statistics dashboard
- **Estimate**: 4 hours
- **References**: 
  - Reference image: `Screenshot 2025-07-05 161530.png` shows stats widget layout
  - See existing `src/components/StatWidget.tsx` for implementation
- **Exact Layout**:
  ```typescript
  // Three-column layout
  <div className="flex items-center justify-between">
    <div className="text-center">
      <div className="text-3xl font-semibold" style={{color: 'var(--error-red)'}}>
        {stats.expired}
      </div>
      <div style={{color: 'var(--white-pure)'}}>Expired</div>
    </div>
    
    <div className="text-center">
      <div className="text-5xl font-semibold" style={{color: 'var(--white-pure)'}}>
        {stats.valid}
      </div>
      <div style={{color: 'var(--white-pure)'}}>Valid</div>
    </div>
    
    <div className="text-center">
      <div className="text-3xl font-semibold" style={{color: 'var(--warn-amber)'}}>
        {stats.upcoming}
      </div>
      <div style={{color: 'var(--white-pure)'}}>Upcoming</div>
    </div>
  </div>
  ```
- **Styling**:
  - Background: `var(--grey-700)`
  - Padding: 24px
  - Border-radius: 8px
- **Data Source**: Use `useCertStore((state) => state.getStatistics())`
- **Acceptance**: Widget displays three counts with correct colors matching reference image

### **HOME-003: File Tree Component** 🔴
- **Task**: Build hierarchical certificate browser
- **Estimate**: 6 hours
- **Details**:
  - Create expandable category sections
  - Implement chevron rotation animations
  - Add certificate list items with status badges
  - Include expand/collapse animations
  - Handle empty states
- **Acceptance**: Interactive file tree browser

### **HOME-004: File Tree Interactions** 🟡
- **Task**: Add touch interactions to file tree
- **Estimate**: 3 hours
- **Details**:
  - Implement tap to view certificate
  - Add long-press for settings (mobile)
  - Include hover states for desktop
  - Add selection feedback
- **Acceptance**: Responsive touch interactions

### **HOME-005: Certificate Status Indicators** 🟡
- **Task**: Add visual status indicators
- **Estimate**: 2 hours
- **Details**:
  - Create status badge component
  - Implement color coding (red/green/amber)
  - Add expiry date calculations
  - Include status text labels
- **Acceptance**: Clear status visualization

---

## **📄 PDF VIEWER JOBS**

### **PDF-001: PDF.js Integration** 🔴
- **Task**: Set up react-pdf library
- **Estimate**: 3 hours
- **Details**:
  - Install and configure react-pdf
  - Set up PDF.js worker
  - Create basic PDFViewer component
  - Handle loading states
- **Acceptance**: PDF files render successfully

### **PDF-002: PDF Viewer Component** 🔴
- **Task**: Build full-featured PDF viewer
- **Estimate**: 5 hours
- **Details**:
  - Implement document loading and error handling
  - Add page navigation controls
  - Scale PDF to fit mobile screen
  - Handle multi-page documents
  - Add loading and error states
- **Acceptance**: Robust PDF viewing experience

### **PDF-003: Certificate Viewer Page** 🔴
- **Task**: Create certificate viewing page
- **Estimate**: 3 hours
- **Details**:
  - Set up dynamic route /cert/[id]
  - Create full-screen PDF layout
  - Add floating certificate name badge
  - Integrate with navbar overlay
- **Acceptance**: Complete certificate viewing page

### **PDF-004: PDF Viewer Controls** 🟡
- **Task**: Add PDF navigation controls
- **Estimate**: 2.5 hours
- **Details**:
  - Create page counter display
  - Add previous/next page buttons
  - Implement zoom controls (if needed)
  - Style controls for dark theme
- **Acceptance**: User-friendly PDF controls

### **PDF-005: PDF Loading Optimization** 🟢
- **Task**: Optimize PDF loading performance
- **Estimate**: 2 hours
- **Details**:
  - Add progressive loading
  - Implement loading skeletons
  - Cache PDF documents
  - Handle large file sizes
- **Acceptance**: Fast PDF loading experience

---

## **📁 FILE MANAGEMENT JOBS**

### **FILE-001: Certificate Data Model** 🔴
- **Task**: Define certificate data structure
- **Estimate**: 1.5 hours
- **Details**:
  - Create Certificate interface
  - Define status types and categories
  - Add validation rules
  - Document data relationships
- **Acceptance**: Clear data model definition

### **FILE-002: Zustand Store Setup** 🔴
- **Task**: Implement state management store
- **Estimate**: 4 hours
- **Details**:
  - Create certificate store with Zustand
  - Implement CRUD operations
  - Add selection state management
  - Include computed getters (statistics, filters)
- **Acceptance**: Functional state management

### **FILE-003: Mock Data Creation** 🔴
- **Task**: Create realistic mock certificate data
- **Estimate**: 2 hours
- **Details**:
  - Generate sample certificates for all categories
  - Include various status types
  - Add realistic dates and serial numbers
  - Create diverse file names
- **Acceptance**: Rich mock data set

### **FILE-004: File Upload Component** 🟡
- **Task**: Build upload interface
- **Estimate**: 4 hours
- **Details**:
  - Create upload page layout
  - Add file input with drag-and-drop
  - Implement file validation (PDF only)
  - Add upload progress indication
  - Include file preview functionality
- **Acceptance**: Working file upload interface

### **FILE-005: Camera Integration Stub** 🟢
- **Task**: Add camera scan placeholder
- **Estimate**: 2 hours
- **Details**:
  - Create camera scan button
  - Add placeholder functionality
  - Design for future camera integration
  - Include user feedback messages
- **Acceptance**: Camera scan UI ready for Phase 2

---

## **📧 SEND SYSTEM JOBS**

### **SEND-001: Send Panel Component** 🔴
- **Task**: Create send workflow panel
- **Estimate**: 5 hours
- **References**: 
  - Reference images: `Screenshot 2025-07-05 161616.png` (Step 1) and `Screenshot 2025-07-05 161621.png` (Step 2)
  - See existing `src/components/SendPanel.tsx` for implementation
- **Step 1 Layout**:
  ```typescript
  <div className="space-y-3">
    <Button className="w-full py-6 justify-start">
      <div>
        <div className="font-medium">This Document Only</div>
        <div className="text-sm opacity-75">Send current certificate</div>
      </div>
    </Button>
    
    <Button className="w-full py-6 justify-start">
      <div>
        <div className="font-medium">Select Multiple</div>
        <div className="text-sm opacity-75">Choose multiple certificates</div>
      </div>
    </Button>
  </div>
  ```
- **Step 2 Layout**: 
  - Reuse FileTree component with `showSelection={true}`
  - Add gold Send button (paper plane icon) in bottom-right
  - Include "Back" button to return to Step 1
- **Button Styling**:
  - Background: `var(--grey-700)`
  - Border: `1px solid var(--grey-500)`
  - Text: `var(--white-pure)`
- **Slide Animation**: Use Framer Motion with `x: 0` → `x: '-100%'` for step transitions
- **Acceptance**: Two-step workflow with smooth transitions matching reference images

### **SEND-002: Multi-Select Interface** 🟡
- **Task**: Build certificate selection UI
- **Estimate**: 4 hours
- **Details**:
  - Add checkboxes to file tree
  - Implement selection state visualization
  - Create select/deselect all functionality
  - Add selection counter
- **Acceptance**: Intuitive multi-selection interface

### **SEND-003: Send Button & Actions** 🟡
- **Task**: Implement send functionality
- **Estimate**: 3 hours
- **Details**:
  - Create animated send button
  - Add disabled/enabled states
  - Implement mailto: link generation
  - Include selection validation
- **Acceptance**: Working send actions

### **SEND-004: Email Template System** 🟡
- **Task**: Build email template functionality
- **Estimate**: 3 hours
- **Details**:
  - Create email template editor
  - Add template variables
  - Implement template preview
  - Save template preferences
- **Acceptance**: Customizable email templates

### **SEND-005: Send Animation Flow** 🟢
- **Task**: Add smooth send workflow animations
- **Estimate**: 2.5 hours
- **Details**:
  - Animate step transitions
  - Add button morphing effects
  - Include success feedback
  - Polish transition timing
- **Acceptance**: Polished send animations

---

## **⚙️ SETTINGS SYSTEM JOBS**

### **SET-001: Settings Panel Structure** 🔴
- **Task**: Create settings panel component
- **Estimate**: 3 hours
- **Details**:
  - Build context-aware settings panel
  - Implement home vs document modes
  - Add proper form layouts
  - Include section headers
- **Acceptance**: Structured settings interface

### **SET-002: Profile Settings** 🟡
- **Task**: Build user profile settings
- **Estimate**: 4 hours
- **Details**:
  - Add email configuration
  - Implement notification preferences
  - Create email template editor
  - Add save/cancel actions
- **Acceptance**: Complete profile settings

### **SET-003: Document Settings** 🟡
- **Task**: Build certificate-specific settings
- **Estimate**: 4 hours
- **Details**:
  - Add file location selector
  - Implement date pickers for issue/expiry
  - Add certificate number input
  - Include delete confirmation
- **Acceptance**: Full document settings

### **SET-004: Settings Persistence** 🟡
- **Task**: Add settings save/load functionality
- **Estimate**: 2 hours
- **Details**:
  - Implement local storage persistence
  - Add form validation
  - Handle save/load errors
  - Include reset to defaults
- **Acceptance**: Persistent settings system

### **SET-005: Settings Animations** 🟢
- **Task**: Add settings panel animations
- **Estimate**: 2 hours
- **Details**:
  - Animate form field focus
  - Add save confirmation feedback
  - Polish panel transitions
  - Include loading states
- **Acceptance**: Smooth settings interactions

---

## **📱 PWA & MOBILE JOBS**

### **PWA-001: Manifest Configuration** 🟡
- **Task**: Set up PWA manifest
- **Estimate**: 2 hours
- **References**: See existing `public/manifest.json` for structure
- **Exact Manifest Content**:
  ```json
  {
    "name": "Cert Manager",
    "short_name": "CertManager",
    "description": "Professional certificate management application",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#121212",
    "theme_color": "#C89B3C",
    "orientation": "portrait",
    "categories": ["productivity", "business"],
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any maskable"
      },
      {
        "src": "/icon-512.png", 
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ]
  }
  ```
- **Meta Tags to Add** (in `src/app/layout.tsx`):
  ```html
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#C89B3C" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
  <link rel="apple-touch-icon" href="/icon-192.png" />
  ```
- **Icon Requirements**: Create 192x192 and 512x512 PNG icons with gold accent color
- **Acceptance**: App shows "Add to Home Screen" prompt on mobile devices

### **PWA-002: Mobile Optimization** 🟡
- **Task**: Optimize for mobile devices
- **Estimate**: 4 hours
- **Details**:
  - Add viewport meta tags
  - Implement touch-friendly sizing
  - Optimize for various screen sizes
  - Handle safe areas (notch)
- **Acceptance**: Great mobile experience

### **PWA-003: Service Worker Setup** 🟢
- **Task**: Add offline functionality
- **Estimate**: 3 hours
- **Details**:
  - Create service worker
  - Implement caching strategies
  - Add offline fallbacks
  - Handle updates
- **Acceptance**: Basic offline functionality

### **PWA-004: Touch Gestures** 🟡
- **Task**: Implement mobile touch patterns
- **Estimate**: 3 hours
- **Details**:
  - Add long-press detection
  - Implement swipe gestures
  - Handle touch feedback
  - Optimize scroll behavior
- **Acceptance**: Natural mobile interactions

### **PWA-005: iOS Safari Optimization** 🟢
- **Task**: Optimize for iOS Safari
- **Estimate**: 2 hours
- **Details**:
  - Add apple-touch-icon
  - Handle status bar styling
  - Fix iOS-specific issues
  - Test on various iOS versions
- **Acceptance**: Great iOS experience

---

## **🎨 ANIMATION & POLISH JOBS**

### **ANIM-001: Core Animation System** 🔴
- **Task**: Set up Framer Motion configuration
- **Estimate**: 3 hours
- **Details**:
  - Configure animation timing functions
  - Set up motion variants
  - Create reusable animation presets
  - Test performance on mobile
- **Acceptance**: Smooth animation foundation

### **ANIM-002: List Animations** 🟡
- **Task**: Add file tree animations
- **Estimate**: 3 hours
- **Details**:
  - Animate list item expansion
  - Add stagger effects
  - Include enter/exit animations
  - Polish chevron rotations
- **Acceptance**: Smooth list interactions

### **ANIM-003: Page Transitions** 🟢
- **Task**: Add page transition animations
- **Estimate**: 4 hours
- **Details**:
  - Create route transition system
  - Add slide-in/slide-out effects
  - Handle loading states
  - Optimize performance
- **Acceptance**: Smooth page transitions

### **ANIM-004: Micro-interactions** 🟢
- **Task**: Add subtle interaction feedback
- **Estimate**: 3 hours
- **Details**:
  - Button hover/press states
  - Input focus animations
  - Loading spinners
  - Success/error feedback
- **Acceptance**: Polished micro-interactions

### **ANIM-005: Loading States** 🟡
- **Task**: Create loading animations
- **Estimate**: 2.5 hours
- **Details**:
  - Design loading skeletons
  - Add progress indicators
  - Create smooth transitions
  - Handle different loading states
- **Acceptance**: Professional loading experience

---

## **🧪 TESTING & QA JOBS**

### **TEST-001: Component Testing Setup** 🟡
- **Task**: Set up component testing framework
- **Estimate**: 3 hours
- **Details**:
  - Configure Jest and React Testing Library
  - Write example component tests
  - Set up testing utilities
  - Add test scripts to package.json
- **Acceptance**: Working test framework

### **TEST-002: Unit Tests** 🟡
- **Task**: Write unit tests for core components
- **Estimate**: 8 hours
- **Details**:
  - Test StatWidget calculations
  - Test FileTree expand/collapse
  - Test send workflow logic
  - Test settings form validation
- **Acceptance**: Good test coverage

### **TEST-003: Integration Tests** 🟡
- **Task**: Write integration tests
- **Estimate**: 6 hours
- **Details**:
  - Test navigation flow
  - Test file upload process
  - Test send workflow
  - Test settings persistence
- **Acceptance**: Critical paths tested

### **TEST-004: E2E Testing Setup** 🟡
- **Task**: Set up Playwright e2e testing
- **Estimate**: 4 hours
- **Details**:
  - Configure Playwright
  - Write navigation tests
  - Test animation completion
  - Add visual regression tests
- **Acceptance**: E2E test suite

### **TEST-005: Mobile Testing** 🟡
- **Task**: Test on various mobile devices
- **Estimate**: 4 hours
- **Details**:
  - Test touch interactions
  - Verify animations on mobile
  - Check different screen sizes
  - Test PWA installation
- **Acceptance**: Mobile compatibility verified

---

## **📚 DOCUMENTATION JOBS**

### **DOC-001: Storybook Setup** 🟡
- **Task**: Configure Storybook for component docs
- **Estimate**: 3 hours
- **Details**:
  - Install and configure Storybook
  - Set up dark theme
  - Create example stories
  - Configure controls and actions
- **Acceptance**: Working Storybook instance

### **DOC-002: Component Stories** 🟡
- **Task**: Write Storybook stories for all components
- **Estimate**: 6 hours
- **Details**:
  - FloatingNavBar with all states
  - StatWidget with different data
  - FileTree with various configurations
  - SendPanel workflow stories
  - SettingsPanel variations
- **Acceptance**: Complete component documentation

### **DOC-003: README Documentation** 🟡
- **Task**: Write comprehensive README
- **Estimate**: 3 hours
- **Details**:
  - Project overview and features
  - Installation instructions
  - Development workflow
  - Component architecture
  - Design system documentation
- **Acceptance**: Clear project documentation

### **DOC-004: Backend Integration Guide** 🟡
- **Task**: Document backend integration points
- **Estimate**: 2 hours
- **Details**:
  - List all TODO BACKEND markers
  - Document expected API contracts
  - Create integration checklist
  - Add database schema requirements
- **Acceptance**: Clear integration roadmap

### **DOC-005: API Documentation** 🟢
- **Task**: Document component APIs and props
- **Estimate**: 2 hours
- **References**: Extract from existing component prop interfaces
- **Details**:
  - Document all component props with examples
  - Create usage examples for each component
  - Document hook APIs (useCertStore methods)
  - Include integration examples with backend stubs
- **Component API Examples**:
  ```typescript
  // FloatingNavBar
  interface FloatingNavBarProps {
    onModeChange?: (mode: NavMode) => void;
    children?: React.ReactNode;
  }
  
  // FileTree  
  interface FileTreeProps {
    showSelection?: boolean;
    onFileSelect?: (certId: string) => void;
    onLongPress?: (certId: string) => void;
  }
  ```
- **Acceptance**: Complete API documentation for all components

---

## **🔧 PERFORMANCE & OPTIMIZATION JOBS**

### **PERF-001: Bundle Optimization** 🟢
- **Task**: Optimize JavaScript bundle size
- **Estimate**: 3 hours
- **Details**:
  - Analyze bundle composition
  - Implement code splitting
  - Add dynamic imports
  - Optimize dependencies
- **Acceptance**: Smaller bundle sizes

### **PERF-002: Image Optimization** 🟢
- **Task**: Optimize image assets
- **Estimate**: 2 hours
- **Details**:
  - Compress images
  - Add multiple sizes
  - Implement lazy loading
  - Use modern formats (WebP)
- **Acceptance**: Fast image loading

### **PERF-003: Animation Performance** 🟡
- **Task**: Optimize animation performance
- **Estimate**: 3 hours
- **Details**:
  - Use GPU-accelerated properties
  - Optimize animation complexity
  - Reduce layout thrashing
  - Test on low-end devices
- **Acceptance**: Smooth 60fps animations

### **PERF-004: PDF Loading Optimization** 🟡
- **Task**: Optimize PDF rendering performance
- **Estimate**: 2.5 hours
- **Details**:
  - Implement progressive loading
  - Add PDF caching
  - Optimize memory usage
  - Handle large documents
- **Acceptance**: Fast PDF loading

### **PERF-005: Mobile Performance** 🟡
- **Task**: Optimize for mobile performance
- **Estimate**: 3 hours
- **Details**:
  - Test on various devices
  - Optimize touch response
  - Reduce memory usage
  - Handle low-bandwidth scenarios
- **Acceptance**: Great mobile performance

---

## **🎁 ENHANCEMENT JOBS**

### **ENH-001: Accessibility Improvements** 🟡
- **Task**: Enhance accessibility support
- **Estimate**: 4 hours
- **Details**:
  - Add ARIA labels
  - Implement keyboard navigation
  - Ensure color contrast
  - Add screen reader support
- **Acceptance**: WCAG AA compliance

### **ENH-002: Dark/Light Theme Toggle** 🟢
- **Task**: Add theme switching capability
- **Estimate**: 3 hours
- **Details**:
  - Create light theme variants
  - Add theme toggle component
  - Persist theme preference
  - Smooth theme transitions
- **Acceptance**: Working theme system

### **ENH-003: Search Functionality** 🟢
- **Task**: Add certificate search
- **Estimate**: 4 hours
- **Details**:
  - Create search input component
  - Implement filtering logic
  - Add search highlighting
  - Include search suggestions
- **Acceptance**: Fast certificate search

### **ENH-004: Keyboard Shortcuts** 🟢
- **Task**: Add keyboard shortcuts
- **Estimate**: 2.5 hours
- **Details**:
  - Define shortcut mappings
  - Add visual indicators
  - Handle shortcut conflicts
  - Include help overlay
- **Acceptance**: Efficient keyboard navigation

### **ENH-005: Advanced Animations** 🟢
- **Task**: Add sophisticated animations
- **Estimate**: 4 hours
- **Details**:
  - Shared element transitions
  - Morphing animations
  - Physics-based animations
  - Interactive gestures
- **Acceptance**: Delightful animations

---

## **🤖 AI INTEGRATION JOBS**

*These jobs can be completed after the frontend is functional, using client-side AI APIs without requiring a full backend.*

### **AI-001: OpenAI API Integration Setup** 🟡
- **Task**: Set up OpenAI API client for frontend use
- **Estimate**: 3 hours
- **References**: OpenAI API documentation at https://platform.openai.com/docs
- **Implementation Approach**:
  ```typescript
  // src/lib/openai-client.ts
  import OpenAI from 'openai';
  
  const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // For client-side usage
  });
  
  export async function analyzeDocument(imageBase64: string) {
    // TODO AI:DOCUMENT_ANALYSIS
    return await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [...]
    });
  }
  ```
- **Environment Variables Needed**:
  ```env
  NEXT_PUBLIC_OPENAI_API_KEY=sk-...
  ```
- **Security Considerations**: Use API key restrictions to limit to specific domains
- **Acceptance**: OpenAI client configured and can make basic API calls

### **AI-002: PDF Text Extraction** 🟡
- **Task**: Extract text content from PDF files for AI analysis
- **Estimate**: 4 hours
- **References**: Combine existing PDFViewer component with pdf.js text extraction
- **Implementation**:
  ```typescript
  // src/lib/pdf-text-extractor.ts
  import { getDocument } from 'pdfjs-dist';
  
  export async function extractTextFromPDF(pdfUrl: string): Promise<string> {
    const pdf = await getDocument(pdfUrl).promise;
    let fullText = '';
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  }
  ```
- **Integration Points**: 
  - Hook into existing file upload flow
  - Use with PDFViewer component
- **Acceptance**: Can extract readable text from PDF certificates

### **AI-003: Certificate Information Extraction** 🟡
- **Task**: Use AI to extract certificate metadata from PDF text
- **Estimate**: 6 hours
- **References**: Use GPT-4 with structured prompts for data extraction
- **AI Prompt Template**:
  ```typescript
  const CERTIFICATE_EXTRACTION_PROMPT = `
  Analyze the following certificate text and extract key information.
  Return ONLY a JSON object with these exact fields:
  
  {
    "certificateName": "extracted name",
    "issueDate": "YYYY-MM-DD or null",
    "expiryDate": "YYYY-MM-DD or null", 
    "issuingAuthority": "authority name or null",
    "certificateNumber": "number/serial or null",
    "category": "STCW|GWO|OPITO|Contracts|Other",
    "confidence": 0.95
  }
  
  Certificate text:
  ${extractedText}
  `;
  ```
- **Integration**: 
  - Add "AI Extract" button to upload flow
  - Auto-populate certificate form fields
  - Show confidence score to user
- **Error Handling**: Fallback to manual entry if extraction fails
- **Acceptance**: Successfully extracts metadata from common certificate formats

### **AI-004: Smart Document Categorization** 🟡
- **Task**: Automatically categorize uploaded certificates
- **Estimate**: 4 hours
- **References**: Use GPT-4 to classify certificate types
- **Implementation**:
  ```typescript
  export async function categorizeCertificate(
    certificateName: string, 
    extractedText: string
  ): Promise<CertificateCategory> {
    const prompt = `
    Based on the certificate name "${certificateName}" and content, 
    classify this into exactly one category:
    
    - STCW: Seafarer training (Basic Fire Fighting, Medical First Aid, etc.)
    - GWO: Global Wind Organisation training
    - OPITO: Offshore petroleum industry training
    - Contracts: Employment contracts, agreements
    - Other: Everything else
    
    Respond with only the category name.
    
    Content: ${extractedText.substring(0, 1000)}
    `;
    
    // Return classification result
  }
  ```
- **UI Integration**: 
  - Show suggested category with confidence
  - Allow user to override AI suggestion
  - Learn from user corrections
- **Acceptance**: Accurately categorizes 85%+ of common certificate types

### **AI-005: Expiry Date Intelligence** 🟡
- **Task**: Smart detection and validation of certificate expiry dates
- **Estimate**: 3 hours
- **References**: Combine text extraction with date parsing logic
- **Implementation**:
  ```typescript
  export async function validateExpiryDate(
    extractedDate: string | null,
    certificateText: string
  ): Promise<{
    suggestedDate: string | null;
    confidence: number;
    warnings: string[];
  }> {
    // 1. Parse extracted date
    // 2. Look for date patterns in full text
    // 3. Validate against certificate type (STCW = 5 years, etc.)
    // 4. Check for renewal vs. original issue
    // 5. Flag suspicious dates (past expiry, too far future)
  }
  ```
- **Smart Features**:
  - Detect renewal certificates vs. new issues
  - Flag potentially expired certificates
  - Suggest renewal dates based on certificate type
  - Warn about approaching expiries
- **Acceptance**: Accurately identifies expiry dates and flags issues

### **AI-006: Document Quality Assessment** 🟡
- **Task**: Analyze PDF quality and readability for better extraction
- **Estimate**: 4 hours
- **Implementation**:
  ```typescript
  export async function assessDocumentQuality(pdfUrl: string): Promise<{
    textQuality: 'excellent' | 'good' | 'poor' | 'unreadable';
    isScanned: boolean;
    recommendsOCR: boolean;
    issues: string[];
    suggestions: string[];
  }> {
    // 1. Check if PDF has embedded text or is image-only
    // 2. Analyze text extraction success rate
    // 3. Detect image quality issues
    // 4. Recommend improvements
  }
  ```
- **User Feedback**:
  - Show quality assessment in upload flow
  - Suggest document rescanning if quality is poor
  - Offer tips for better document capture
- **Acceptance**: Provides useful quality feedback and improvement suggestions

### **AI-007: Smart Email Template Generation** 🟡
- **Task**: Generate contextual email templates for certificate sharing
- **Estimate**: 3.5 hours
- **References**: Use existing SendPanel component with AI enhancement
- **Implementation**:
  ```typescript
  export async function generateEmailTemplate(
    certificates: Certificate[],
    context: 'job_application' | 'renewal_reminder' | 'general'
  ): Promise<string> {
    const prompt = `
    Generate a professional email template for sending these certificates:
    ${certificates.map(c => `- ${c.name} (expires: ${c.expiryDate})`).join('\n')}
    
    Context: ${context}
    
    Include:
    - Professional greeting
    - Brief explanation of attached certificates
    - Relevant details (expiry dates if recent)
    - Professional closing
    
    Keep it concise and professional.
    `;
  }
  ```
- **UI Integration**:
  - Add "Generate Email" button to SendPanel
  - Allow editing of generated template
  - Save user preferences for future generation
- **Acceptance**: Generates appropriate email templates for different contexts

### **AI-008: Certificate Validity Checker** 🟡
- **Task**: Cross-reference certificate details for potential issues
- **Estimate**: 4 hours
- **Implementation**:
  ```typescript
  export async function validateCertificateLogic(cert: Certificate): Promise<{
    isValid: boolean;
    warnings: string[];
    suggestions: string[];
  }> {
    // 1. Check date logic (issue < expiry)
    // 2. Validate certificate number format
    // 3. Check typical validity periods for cert type
    // 4. Flag unusual patterns
    // 5. Suggest corrections
  }
  ```
- **Smart Checks**:
  - Issue date after expiry date
  - Unrealistic validity periods
  - Duplicate certificate numbers
  - Inconsistent naming patterns
- **UI Integration**: Show validation warnings in settings panel
- **Acceptance**: Identifies common certificate data issues

### **AI-009: Search and Query Enhancement** 🟡
- **Task**: Natural language search across certificate content
- **Estimate**: 5 hours
- **References**: Combine text extraction with semantic search
- **Implementation**:
  ```typescript
  export async function semanticSearch(
    query: string,
    certificates: Certificate[]
  ): Promise<{
    matches: Array<{
      certificate: Certificate;
      relevance: number;
      matchedContent: string[];
    }>;
  }> {
    // 1. Extract embeddings for query
    // 2. Compare with certificate text embeddings
    // 3. Rank by semantic similarity
    // 4. Return relevant matches with context
  }
  ```
- **Search Features**:
  - "Find my fire safety certificates"
  - "Show certificates expiring next month"
  - "What medical training do I have?"
- **UI Integration**: Enhanced search bar with natural language support
- **Acceptance**: Understands natural language queries and returns relevant certificates

### **AI-010: Batch Processing Intelligence** 🟡
- **Task**: Smart batch operations for multiple certificates
- **Estimate**: 3.5 hours
- **Implementation**:
  ```typescript
  export async function suggestBatchOperations(
    certificates: Certificate[]
  ): Promise<{
    suggestions: Array<{
      action: 'renew' | 'update' | 'categorize' | 'merge';
      certificates: string[];
      reason: string;
      confidence: number;
    }>;
  }> {
    // 1. Identify certificates needing renewal
    // 2. Find potential duplicates
    // 3. Suggest categorization improvements
    // 4. Recommend updates based on patterns
  }
  ```
- **Smart Suggestions**:
  - "These 3 certificates expire within 30 days"
  - "You have duplicate STCW certificates"
  - "Consider updating these file locations"
- **UI Integration**: Show suggestions in home page widget
- **Acceptance**: Provides actionable insights for certificate management

---

## **🚀 DEPLOYMENT JOBS**

### **DEPLOY-001: Build Configuration** 🟡
- **Task**: Configure production build
- **Estimate**: 2 hours
- **Details**:
  - Optimize Next.js config
  - Set up environment variables
  - Configure static export
  - Add build scripts
- **Acceptance**: Optimized production build

### **DEPLOY-002: Error Handling** 🟡
- **Task**: Implement comprehensive error handling
- **Estimate**: 3 hours
- **Details**:
  - Add error boundaries
  - Create error pages (404, 500)
  - Handle API errors
  - Add error reporting
- **Acceptance**: Robust error handling

### **DEPLOY-003: Analytics Setup** 🟢
- **Task**: Add analytics tracking
- **Estimate**: 2 hours
- **Details**:
  - Implement event tracking
  - Add performance monitoring
  - Track user interactions
  - Set up dashboards
- **Acceptance**: Comprehensive analytics

### **DEPLOY-004: SEO Optimization** 🟢
- **Task**: Optimize for search engines
- **Estimate**: 2 hours
- **Details**:
  - Add meta tags
  - Create sitemap
  - Optimize page titles
  - Add structured data
- **Acceptance**: SEO-friendly pages

### **DEPLOY-005: Production Testing** 🟡
- **Task**: Test production deployment
- **Estimate**: 3 hours
- **Details**:
  - Test on staging environment
  - Verify PWA functionality
  - Check performance metrics
  - Validate all features
- **Acceptance**: Production-ready deployment

---

## **📊 ESTIMATION SUMMARY**

### **By Priority:**
- **🔴 Critical Path**: ~49 hours (includes development guidelines)
- **🟡 High Priority**: ~109 hours (includes AI integration)
- **🟢 Medium Priority**: ~40 hours
- **🔵 Polish & Enhancement**: ~24 hours

### **By Category:**
- **Foundation & Setup**: 7 hours (includes development guidelines)
- **Core Components**: 9 hours
- **Navigation System**: 18 hours
- **Home Page**: 17 hours
- **PDF Viewer**: 15.5 hours
- **File Management**: 13.5 hours
- **Send System**: 17.5 hours
- **Settings System**: 15 hours
- **PWA & Mobile**: 14 hours
- **Animation & Polish**: 15.5 hours
- **AI Integration**: 37 hours (new category)
- **Testing & QA**: 25 hours
- **Documentation**: 16 hours
- **Performance**: 13.5 hours
- **Enhancements**: 17.5 hours
- **Deployment**: 12 hours

### **Total Estimated Time: ~222 hours**

---

## **🎯 RECOMMENDED IMPLEMENTATION PHASES**

### **Phase A: Foundation (15 hours)**
Complete all 🔴 Critical Path jobs to establish core functionality

### **Phase B: Core Features (45 hours)**
Implement essential components and navigation system

### **Phase C: User Experience (60 hours)** 
Add animations, mobile optimization, and polish

### **Phase D: AI Integration (37 hours)**
Add AI-powered features using client-side OpenAI APIs (no backend database required)

### **Phase E: Quality Assurance (40 hours)**
Complete testing, documentation, and deployment preparation

### **Phase F: Enhancement (25 hours)**
Add nice-to-have features and advanced functionality

---

*This job list provides granular tracking for implementing a production-quality certificate management UI with Apple-grade polish and animations.*