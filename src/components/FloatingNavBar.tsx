'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Home, List, Send, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export type NavMode = 'collapsed' | 'list' | 'send.step1' | 'send.step2' | 'settings.home' | 'settings.doc';

interface FloatingNavBarProps {
  onModeChange?: (mode: NavMode) => void;
  children?: React.ReactNode;
  mode?: NavMode;
}

export default function FloatingNavBar({ onModeChange, children, mode: externalMode }: FloatingNavBarProps) {
  const [mode, setMode] = useState<NavMode>(externalMode || 'collapsed');
  const [dragProgress, setDragProgress] = useState(0); // 0 = fully open, 1 = fully closed
  const [isAnimating, setIsAnimating] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [touchStartY, setTouchStartY] = useState(0);
  const [isSwipeDetected, setIsSwipeDetected] = useState(false);
  const [iconsAtHome, setIconsAtHome] = useState(false);

  const isExpanded = mode !== 'collapsed';
  const activeIcon = getActiveIcon(mode, pathname);

  useEffect(() => {
    if (onModeChange) {
      onModeChange(mode);
    }
  }, [mode, onModeChange]);

  // Effect to measure content height when expanded
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      const measureHeight = () => {
        const height = contentRef.current?.scrollHeight || 0;
        setContentHeight(height);
      };
      
      // Initial measurement
      measureHeight();
      
      // Set up ResizeObserver to track content changes
      const resizeObserver = new ResizeObserver(measureHeight);
      resizeObserver.observe(contentRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isExpanded, children]);

  const handleIconClick = (iconType: string) => {
    // Prevent interactions during animations
    if (isAnimating) return;

    if (mode === 'collapsed') {
      // Start choreographed expansion
      setIsAnimating(true);
      
      // First: Animate icons to their final positions
      // This will be handled by the icon animation logic
      
      // After a short delay, trigger the mode change to expand the panel
      setTimeout(() => {
        // Reset icons at home state for new expansion
        setIconsAtHome(false);
        
        switch (iconType) {
          case 'home':
            // Navigate to home if not already there, do nothing if already on home
            if (pathname !== '/') {
              window.location.href = '/';
            }
            // If already on home, do nothing (as requested)
            break;
          case 'list':
            setMode('list');
            break;
          case 'send':
            setMode('send.step1');
            break;
          case 'settings':
            if (pathname.startsWith('/cert/')) {
              setMode('settings.doc');
            } else {
              setMode('settings.home');
            }
            break;
          default:
            break;
        }
        
        // Allow interactions again after expansion completes
        setTimeout(() => setIsAnimating(false), 300);
      }, 200); // Delay to let icon animation complete first
      
    } else {
      // If expanded, handle icon switching or active icon tap
      if (iconType === getIconTypeFromMode(mode)) {
        // Clicking active icon - do nothing (panel stays open)
        return;
      } else {
        // Switching to different section while open
        switch (iconType) {
          case 'home':
            if (pathname !== '/') {
              window.location.href = '/';
            }
            break;
          case 'list':
            setMode('list');
            break;
          case 'send':
            setMode('send.step1');
            break;
          case 'settings':
            if (pathname.startsWith('/cert/')) {
              setMode('settings.doc');
            } else {
              setMode('settings.home');
            }
            break;
        }
      }
    }
  };

  const handleDragStart = () => {
    if (!isExpanded) return;
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { y: number } }) => {
    if (!isExpanded || isAnimating) return;
    
    const dragDistance = Math.max(0, info.offset.y); // Only allow downward drag
    
    // Calculate drag progress based on available drag distance to minimum height
    const expandedHeight = getMaxExpandedHeight();
    const minHeight = 120; // Minimum height restriction
    const maxDragDistance = expandedHeight - minHeight;
    
    // Calculate progress (0 = fully expanded, 1 = at minimum height)
    const progress = Math.min(1, dragDistance / maxDragDistance);
    setDragProgress(progress);
    
    // Track when icons reach home positions
    if (progress >= 0.8 && !iconsAtHome) {
      setIconsAtHome(true);
    }
    
    // Don't set currentDragY - we want height change, not position change
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: { velocity: { y: number } }) => {
    if (!isExpanded) return;
    
    const velocity = info.velocity.y;
    
    // Snap logic: 50% threshold or fast downward velocity (> 500px/s)
    const shouldClose = dragProgress > 0.5 || velocity > 500;
    
    setIsAnimating(true);
    
    if (shouldClose) {
      // Snap to collapsed state
      setMode('collapsed');
      setDragProgress(0);
      setIconsAtHome(false); // Reset icons at home state
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10); // Light tick
      }
    } else {
      // Snap back to expanded state - but keep icons at home if they reached there
      setDragProgress(0);
      // Don't reset iconsAtHome - keep them at home positions
      
      // Reset drag element position to ensure it remains responsive
      if (dragRef.current) {
        animate(dragRef.current, 
          { y: 0 }, 
          { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
        );
      }
    }
    
    // Allow interactions again after animation completes
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleClickOutside = () => {
    if (isExpanded) {
      setMode('collapsed');
      setIconsAtHome(false); // Reset icons at home state
    }
  };

  // Add swipe-down detection from top of screen
  useEffect(() => {
    const handleGlobalTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStartY(touch.clientY);
      setIsSwipeDetected(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!isExpanded) return;
      
      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartY;
      
      // If user swipes down from top 50px of screen
      if (touchStartY <= 50 && deltaY > 30) {
        setIsSwipeDetected(true);
        e.preventDefault(); // Prevent default scrolling
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isSwipeDetected && isExpanded) {
        setMode('collapsed');
        setIsSwipeDetected(false);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('touchstart', handleGlobalTouchStart, { passive: false });
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
    }

    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('touchstart', handleGlobalTouchStart);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      }
    };
  }, [isExpanded, touchStartY, isSwipeDetected]);

  // Calculate dynamic navbar properties based on drag progress
  const getNavbarHeight = () => {
    if (!isExpanded) return 72;
    
    // Calculate the maximum available height (70% of viewport)
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500;
    
    // Base height includes content + padding + icons row
    const baseHeight = contentHeight + 32 + 72; // 32px for padding (16px top + 16px bottom), 72px for icons row
    
    // Use the smaller of content-based height or max height
    const expandedHeight = Math.min(baseHeight, maxHeight);
    const collapsedHeight = 72;
    const minHeight = 120; // Minimum height to prevent icons from moving vertically
    
    // Interpolate between expanded height and minimum height based on drag progress
    const targetHeight = Math.max(collapsedHeight, minHeight);
    const currentHeight = expandedHeight - (expandedHeight - targetHeight) * dragProgress;
    
    // Ensure we never go below the minimum height
    return Math.max(currentHeight, minHeight);
  };

  // Get the maximum expanded height for calculations
  const getMaxExpandedHeight = () => {
    const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 500;
    const baseHeight = contentHeight + 32 + 72;
    return Math.min(baseHeight, maxHeight);
  };

  const getNavbarRadius = () => {
    if (!isExpanded) return '36px';
    // Interpolate between 24px (expanded) and 36px (collapsed) based on drag progress
    const expandedRadius = 24;
    const collapsedRadius = 36;
    const currentRadius = expandedRadius + (collapsedRadius - expandedRadius) * dragProgress;
    return `${currentRadius}px`;
  };

  const navVariants = {
    collapsed: {
      height: '72px',
      borderRadius: '36px',
      transition: {
        duration: 0.3,
      },
    },
    expanded: {
      height: `${getNavbarHeight()}px`,
      borderRadius: getNavbarRadius(),
      transition: {
        duration: isAnimating ? 0.3 : 0,
      },
    },
  };


  const panelVariants = {
    hidden: {
      opacity: 0,
      y: 8,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.18,
        delay: 0.1,
      },
    },
  };

  return (
    <>
      {/* Blur backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={backdropRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 blur-backdrop cursor-pointer"
            style={{ 
              backdropFilter: 'blur(4px)',
              touchAction: 'none', // Prevent scrolling on backdrop
              overscrollBehavior: 'none',
            }}
            onClick={handleClickOutside}
            onTouchStart={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
          />
        )}
      </AnimatePresence>

      {/* Navigation Shell */}
      <motion.div
        className="fixed left-1/2 z-50 navbar-shadow overflow-hidden"
        style={{
          x: '-50%',
          bottom: '24px', // Bottom always stays fixed
          width: 'clamp(90%, 350px, 100%)',
          maxWidth: '350px',
          minWidth: '90%',
          backgroundColor: 'var(--grey-700)', // Theme-aware background
          touchAction: 'none', // Prevent scrolling on navbar
          overscrollBehavior: 'none',
        }}
        variants={navVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        // Remove drag from the entire navbar - we'll add it to a specific drag handle
      >
        {/* Expanded Panel Content - positioned first so icons appear at bottom */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex-1 overflow-hidden"
              style={{ 
                opacity: 1 - dragProgress, // Fade out as user drags down
              }}
            >
              {/* Drag Handle Area at Top */}
              <div className="w-full h-6 flex items-center justify-center relative">
                {/* Invisible drag area that covers the entire width */}
                <motion.div
                  ref={dragRef}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  style={{
                    touchAction: 'none',
                  }}
                  drag="y"
                  dragConstraints={{ top: 0, bottom: getMaxExpandedHeight() - 120 }}
                  dragElastic={0}
                  onDragStart={handleDragStart}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                />
                {/* Visual drag indicator - fixed position, non-draggable */}
                <div 
                  className="w-8 h-1 rounded-full opacity-40 pointer-events-none"
                  style={{ backgroundColor: 'var(--white-pure)' }}
                />
              </div>
              
              <div
                ref={contentRef}
                className="px-4 pb-4 overflow-y-auto relative"
                style={{
                  maxHeight: `calc(${getNavbarHeight()}px - 72px - 24px)`, // Subtract icons row height and drag handle
                  touchAction: 'pan-y', // Allow vertical scrolling only within content
                  overscrollBehavior: 'contain',
                }}
              >
                {/* Content fade overlay that transitions from transparent to background color */}
                <div
                  className="absolute inset-0 pointer-events-none z-10"
                  style={{
                    background: `color-mix(in srgb, var(--grey-700) ${dragProgress * 90}%, transparent)`, // Fade to navbar background color
                    transition: isAnimating ? 'background-color 0.3s ease' : 'none',
                  }}
                />
                
                {/* Actual content with blur and opacity effects */}
                <div
                  style={{
                    opacity: 1 - dragProgress * 0.8, // Stronger fade out as user drags
                    filter: `blur(${dragProgress * 4}px)`, // More pronounced blur effect during drag
                    transition: isAnimating ? 'opacity 0.3s ease, filter 0.3s ease' : 'none', // Smooth when snapping
                  }}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icons Row - positioned at bottom */}
        <div className="flex items-center h-[72px] relative overflow-hidden px-6">
          {/* This div will be empty during animations - icons are positioned absolutely below */}
        </div>
      </motion.div>
      
      {/* Icons positioned absolutely relative to viewport bottom - prevents vertical movement during collapse */}
      <div className="fixed left-1/2 z-50" style={{ transform: 'translateX(-50%)', bottom: '24px' }}>
        <div className="flex items-center h-[72px] relative px-0" style={{ width: 'clamp(90%, 350px, 100%)', maxWidth: '350px', minWidth: '90%' }}>
          {['home', 'list', 'send', 'settings'].map((icon, index) => {
            const isActiveIcon = icon === activeIcon;
            
            // Calculate unified icon positions for smooth transitions
            const getIconProps = () => {
              // Calculate collapsed positions (evenly spaced) - use dynamic width calculation
              const getAvailableWidth = () => {
                if (typeof window === 'undefined') return 280; // Fallback for SSR
                const viewportWidth = window.innerWidth;
                // Match the navbar CSS: clamp(90%, 350px, 100%) = min(max(90%, 350px), 100%)
                const navbarWidth = Math.min(Math.max(viewportWidth * 0.9, 350), viewportWidth);
                const padding = 32; // Add some padding to keep icons away from edges
                return navbarWidth - padding;
              };
              
              const totalWidth = getAvailableWidth();
              // For 4 icons evenly spaced and centered:
              // Account for icon button size (44px including padding) and distribute remaining space
              const iconButtonSize = 44; // p-2 = 8px padding on each side + 28px icon = 44px total
              const totalIconSpace = iconButtonSize * 4; // Space taken by all 4 icons
              const remainingSpace = totalWidth - totalIconSpace; // Space available for gaps
              const iconSpacing = remainingSpace / 3; // 3 gaps between 4 icons
              const totalSpanWidth = totalIconSpace + (iconSpacing * 3); // Total width of icon group
              const startX = -totalSpanWidth / 2 + (iconButtonSize / 2); // Start from center, account for icon center
              const collapsedX = startX + (index * (iconButtonSize + iconSpacing));
              
              if (!isExpanded) {
                // Collapsed state: all icons in their natural positions
                return {
                  x: collapsedX,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  color: isActiveIcon ? 'var(--gold-accent)' : 'var(--white-pure)',
                  size: 28,
                };
              } else {
                // Expanded state with drag progress and home position locking
                if (isActiveIcon) {
                  // Allow movement back toward expanded position, but prevent moving past home position
                  
                  // Active icon: interpolate between left position (expanded) and collapsed position
                  const expandedX = -150; // translateX(-150px) when fully expanded (left side)
                  
                  const clampedProgress = Math.min(1, Math.max(0, dragProgress));
                  
                  // When dragProgress reaches 1, navbar is at 120px height - all icons should be at home
                  const targetX = expandedX + (collapsedX - expandedX) * clampedProgress;
                  // Clamp position to prevent moving past home position, but allow movement back toward expanded
                  const currentX = Math.min(targetX, collapsedX); // Cannot go further right than home position
                  
                  const currentScale = 1.1 + (1 - 1.1) * clampedProgress; // Scale from 1.1 to 1.0
                  const currentColor = clampedProgress > 0.5 ? 'var(--white-pure)' : 'var(--gold-accent)';
                  const currentSize = 32 + (28 - 32) * clampedProgress; // Size from 32 to 28
                  
                  return {
                    x: currentX,
                    y: 0, // Always 0 - no vertical movement
                    opacity: 1,
                    scale: currentScale,
                    color: currentColor,
                    size: currentSize,
                  };
                } else {
                  // If icons have reached home, keep them there regardless of drag progress
                  if (iconsAtHome) {
                    return {
                      x: collapsedX,
                      y: 0,
                      opacity: 1,
                      scale: 1,
                      color: 'var(--white-pure)',
                      size: 28,
                    };
                  }
                  
                  // Inactive icons: hide when fully expanded, show during drag
                  const clampedProgress = Math.min(1, Math.max(0, dragProgress));
                  
                  // When fully expanded (dragProgress = 0), hide inactive icons completely
                  if (clampedProgress < 0.3) {
                    return {
                      x: collapsedX,
                      y: 0,
                      opacity: 0, // Hidden when fully expanded
                      scale: 1,
                      color: 'var(--white-pure)',
                      size: 28,
                    };
                  }
                  
                  // Start from a moderate offset and move toward home
                  const isLeftSideIcon = index <= 1; // home, list
                  const startOffset = isLeftSideIcon ? -80 : 80; // Closer starting position
                  const expandedX = collapsedX + startOffset; // Start near home position
                  
                  // When dragProgress reaches 0.8, all icons should be at home positions
                  const targetX = expandedX + (collapsedX - expandedX) * clampedProgress;
                  // Allow free movement for inactive icons - they should animate back to expanded positions
                  const currentX = targetX;
                  
                  // Fade in as user starts dragging (from 30% drag progress onward)
                  const opacityProgress = (clampedProgress - 0.3) / 0.7; // Normalize from 0.3-1.0 to 0-1.0
                  const currentOpacity = Math.max(0, opacityProgress);
                  
                  return {
                    x: currentX,
                    y: 0, // Always 0 - no vertical movement
                    opacity: currentOpacity,
                    scale: 1,
                    color: 'var(--white-pure)',
                    size: 28,
                  };
                }
              }
            };
            
            const iconProps = getIconProps();
            
            return (
              <motion.button
                key={icon}
                data-icon={icon}
                initial={false}
                animate={{
                  x: iconProps.x,
                  y: iconProps.y,
                  opacity: iconProps.opacity,
                  scale: iconProps.scale,
                }}
                transition={{ 
                  duration: isAnimating ? 0.4 : 0,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                onClick={() => handleIconClick(icon)}
                className="absolute p-2 rounded-full flex items-center justify-center"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-22px', // Half of icon button width (44px/2)
                  marginTop: '-22px',  // Half of icon button height (44px/2)
                }}
              >
                  {icon === 'home' && (
                    <Home
                      size={iconProps.size}
                      color={iconProps.color}
                      strokeWidth={2.5}
                    />
                  )}
                  {icon === 'list' && (
                    <List
                      size={iconProps.size}
                      color={iconProps.color}
                      strokeWidth={2.5}
                    />
                  )}
                  {icon === 'send' && (
                    <Send
                      size={iconProps.size}
                      color={iconProps.color}
                      strokeWidth={2.5}
                    />
                  )}
                  {icon === 'settings' && (
                    <Settings
                      size={iconProps.size}
                      color={iconProps.color}
                      strokeWidth={2.5}
                    />
                  )}
                </motion.button>
              );
            })}
        </div>
      </div>
    </>
  );
}

function getActiveIcon(mode: NavMode, pathname: string): string {
  switch (mode) {
    case 'list':
      return 'list';
    case 'send.step1':
    case 'send.step2':
      return 'send';
    case 'settings.home':
    case 'settings.doc':
      return 'settings';
    default:
      if (pathname.startsWith('/cert/')) {
        return 'settings'; // Settings active by default in cert viewer
      }
      return 'home';
  }
}

function getIconTypeFromMode(mode: NavMode): string {
  switch (mode) {
    case 'list':
      return 'list';
    case 'send.step1':
    case 'send.step2':
      return 'send';
    case 'settings.home':
    case 'settings.doc':
      return 'settings';
    default:
      return 'home';
  }
}