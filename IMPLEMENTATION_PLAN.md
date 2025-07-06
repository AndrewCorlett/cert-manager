# Certificate Manager - Comprehensive Implementation Plan

## Overview
This document outlines the detailed implementation plan for all requested changes to the Certificate Manager application. Each section includes specific tasks, files to modify, and implementation details.

---

## Phase 1: Navigation Bar Improvements

### 1.1 Icon Styling Updates
**Files to modify:**
- `/New folder/src/components/FloatingNavBar.tsx`
- `/New folder/src/app/globals.css`

**Tasks:**
- [ ] Change non-selected icons to white color
- [ ] Increase icon size and weight for all navigation icons
- [ ] Ensure selected icon remains gold (#C89B3C)
- [ ] Update CSS classes and Tailwind styles for icon appearance

### 1.2 Expanded Navbar Layout Fix
**Files to modify:**
- `/New folder/src/components/FloatingNavBar.tsx`

**Tasks:**
- [ ] Modify expanded navbar layout to keep icons on bottom row
- [ ] Ensure selected icon moves to left side of bottom row (not top)
- [ ] Adjust Framer Motion animations for smooth icon positioning
- [ ] Update layout logic to maintain bottom-row icon positioning

### 1.3 Navbar Control Gestures
**Files to modify:**
- `/New folder/src/components/FloatingNavBar.tsx`

**Tasks:**
- [ ] Implement finger-follow drag gesture for navbar collapse
- [ ] Add smooth transition with 5% snap-to-bottom behavior
- [ ] Enable collapse via clicking gold highlighted icon
- [ ] Add click-outside-to-collapse functionality for blurred area
- [ ] Ensure proportional horizontal icon transitions during vertical drag
- [ ] Disable home button action when already on home screen

---

## Phase 2: List View Certificate Status

### 2.1 Certificate Status Color Coding
**Files to modify:**
- `/New folder/src/components/FileTree.tsx`
- `/New folder/src/lib/store.ts`

**Tasks:**
- [ ] Remove existing "valid" and "expired" tags from certificate list
- [ ] Implement color-coded text system:
  - Valid certificates: white text
  - Due for expiry (within notification period): red text
  - Expired certificates: red text with red strikethrough
- [ ] Add logic to calculate certificate status based on expiry date and notification settings
- [ ] Update certificate display component to use new color system

---

## Phase 3: Send Section UI Fixes

### 3.1 Send Panel Visual Fixes
**Files to modify:**
- `/New folder/src/components/SendPanel.tsx`

**Tasks:**
- [ ] Fix white outline boxes for title elements
- [ ] Ensure text follows white-on-black background rules
- [ ] Style "This Document Only" and "Select Multiple" titles as white text

### 3.2 Send Panel Functionality
**Files to modify:**
- `/New folder/src/components/SendPanel.tsx`
- `/New folder/src/lib/store.ts`

**Tasks:**
- [ ] Implement "This Document Only" selection behavior:
  - Highlight selection in gold when active
  - Open email draft when Send button is clicked
- [ ] Implement "Select Multiple" functionality:
  - Reuse list view component
  - Keep send icon visible at top
  - Allow multiple document selection
  - Turn selected document text to gold
  - Open email draft with multiple attachments when Send is clicked
- [ ] Add email draft functionality (mailto: links or external email app integration)

---

## Phase 4: Settings Panel Fixes

### 4.1 Light Mode Color Scheme
**Files to modify:**
- `/New folder/src/components/SettingsPanel.tsx`
- `/New folder/src/app/globals.css`

**Tasks:**
- [ ] Fix light mode styling issues:
  - Change input fields from white to light grey
  - Ensure text outside input fields is white
  - Maintain black background for settings panel
- [ ] Test with Puppeteer to ensure optimal visual appearance
- [ ] Update theme-specific CSS classes

---

## Phase 5: Home Page Improvements

### 5.1 Certificate Statistics Widget
**Files to modify:**
- `/New folder/src/components/StatWidget.tsx`
- `/New folder/src/app/page.tsx`

**Tasks:**
- [ ] Add dark background to certificate count widget for contrast
- [ ] Use existing color palette for consistency
- [ ] Ensure proper contrast with white background
- [ ] Style widget similar to reference image provided

### 5.2 Fancy Header Implementation
**Files to modify:**
- `/New folder/src/app/page.tsx`
- `/New folder/src/app/globals.css`

**Tasks:**
- [ ] Design and implement fancy header for home screen
- [ ] Follow design pattern from reference image
- [ ] Ensure responsive design for mobile and desktop
- [ ] Add appropriate spacing and typography

---

## Phase 6: Dark Mode Improvements

### 6.1 Dark Mode Color Palette
**Files to modify:**
- `/New folder/src/app/globals.css`
- `/New folder/src/lib/theme-store.ts`

**Tasks:**
- [ ] Change application background to grey in dark mode
- [ ] Make navbar black with thin white outline border
- [ ] Ensure text has proper contrast (white on dark backgrounds)
- [ ] Make deselected icons white for better visibility
- [ ] Update all component styles for new dark mode palette

---

## Phase 7: File Upload & AI Integration

### 7.1 File Upload Modal
**Files to modify:**
- `/New folder/src/components/FileUploadModal.tsx` (new file)
- `/New folder/src/app/page.tsx`

**Tasks:**
- [ ] Create file upload modal component
- [ ] Add plus button functionality next to "Documentation" title
- [ ] Implement file picker for "Add from file explorer" option
- [ ] Implement camera capture for "Add from camera" option
- [ ] Style modal according to app design system

### 7.2 AI Integration Setup
**Files to modify:**
- `/New folder/src/lib/ai-service.ts` (new file)
- `/New folder/src/components/FileUploadModal.tsx`

**Tasks:**
- [ ] Create AI service for document processing
- [ ] Implement file upload to AI processing endpoint
- [ ] Add error handling for missing API key
- [ ] Display appropriate error message when API key not configured
- [ ] Process AI response and structure data appropriately
- [ ] Test with sample certificate upload

---

## Phase 8: Development Environment Fixes

### 8.1 NPM Dev Setup Optimization
**Files to modify:**
- `/New folder/package.json`
- `/New folder/next.config.js`
- `/New folder/turbo.json`

**Tasks:**
- [ ] Review and optimize Turbo configuration
- [ ] Ensure consistent `npm run dev` behavior
- [ ] Fix network accessibility issues (enable external access)
- [ ] Update development server configuration
- [ ] Test development server on different network configurations
- [ ] Document any required environment variables or setup steps

---

## Implementation Order & Dependencies

### Phase 1: Quick Wins (Day 1)
1. Icon styling updates (1.1)
2. List view color coding (2.1)
3. Send panel visual fixes (3.1)

### Phase 2: Core Functionality (Day 2)
1. Navbar gesture controls (1.3)
2. Expanded navbar layout (1.2)
3. Send panel functionality (3.2)

### Phase 3: UI Polish (Day 3)
1. Settings panel fixes (4.1)
2. Home page widget styling (5.1)
3. Dark mode improvements (6.1)

### Phase 4: New Features (Day 4)
1. File upload modal (7.1)
2. AI integration setup (7.2)
3. Fancy header implementation (5.2)

### Phase 5: Environment & Testing (Day 5)
1. NPM dev setup fixes (8.1)
2. Cross-browser testing
3. Mobile responsiveness testing
4. Final integration testing

---

## Testing Checklist

### Manual Testing
- [ ] All navbar interactions work smoothly
- [ ] Certificate status colors display correctly
- [ ] Send functionality works for both single and multiple documents
- [ ] Settings panel displays correctly in both light and dark modes
- [ ] File upload modal opens and functions properly
- [ ] AI integration shows appropriate error messages
- [ ] Development server runs consistently
- [ ] App works on network (not just localhost)

### Automated Testing
- [ ] Update existing tests for new functionality
- [ ] Add Puppeteer tests for visual regression
- [ ] Test gesture interactions
- [ ] Verify responsive design across device sizes

---

## Success Criteria

### User Experience
- Icons are clearly visible and appropriately sized
- Certificate status is immediately apparent through color coding
- Send workflow is intuitive and functional
- Settings panel is properly styled and functional
- File upload process is smooth and provides clear feedback
- Development experience is consistent and reliable

### Technical Quality
- All animations are smooth and performant
- Color palette is consistent across light and dark modes
- Code follows existing patterns and conventions
- No console errors or warnings
- Mobile-responsive design maintained
- Accessibility standards upheld

---

## Notes
- All changes should maintain existing design system principles
- Preserve current animation quality and smoothness
- Ensure backward compatibility with existing data
- Follow TypeScript best practices
- Test thoroughly on mobile devices
- Document any new dependencies or configuration requirements