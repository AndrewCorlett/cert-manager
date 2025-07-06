'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, List, Send, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';

export type NavMode = 'collapsed' | 'list' | 'send.step1' | 'send.step2' | 'settings.home' | 'settings.doc';

interface FloatingNavBarProps {
  onModeChange?: (mode: NavMode) => void;
  children?: React.ReactNode;
}

export default function FloatingNavBar({ onModeChange, children }: FloatingNavBarProps) {
  const [mode, setMode] = useState<NavMode>('collapsed');
  const [dragProgress, setDragProgress] = useState(0); // 0 = fully open, 1 = fully closed
  const [isAnimating, setIsAnimating] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [currentDragY, setCurrentDragY] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
    setDragStartY(currentDragY);
  };

  const handleDrag = (event: any, info: any) => {
    if (!isExpanded || isAnimating) return;
    
    const dragDistance = info.offset.y;
    setCurrentDragY(dragDistance);
    
    // Calculate drag progress based on navbar height
    const expandedHeight = getNavbarHeight();
    const collapsedHeight = 72;
    const maxDragDistance = expandedHeight - collapsedHeight;
    
    // Ensure drag distance doesn't exceed the max (navbar can't be dragged past collapsed state)
    const clampedDragDistance = Math.max(0, Math.min(maxDragDistance, dragDistance));
    const progress = clampedDragDistance / maxDragDistance;
    setDragProgress(progress);
  };

  const handleDragEnd = (event: any, info: any) => {
    if (!isExpanded) return;
    
    const velocity = info.velocity.y;
    
    // Snap logic: 50% threshold or fast downward velocity
    const shouldClose = dragProgress > 0.5 || velocity > 800;
    
    if (shouldClose) {
      // Snap to close
      setIsAnimating(true);
      setMode('collapsed');
      setDragProgress(0);
      setCurrentDragY(0);
      
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(10); // Light tick
      }
      
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      // Snap back open
      setDragProgress(0);
      setCurrentDragY(0);
    }
  };

  const handleClickOutside = () => {
    if (isExpanded) {
      setMode('collapsed');
    }
  };

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
    
    // Interpolate between expanded height and collapsed height based on drag progress
    const currentHeight = expandedHeight - (expandedHeight - collapsedHeight) * dragProgress;
    return currentHeight;
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
        duration: isAnimating ? 0.3 : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    expanded: {
      height: `${getNavbarHeight()}px`,
      borderRadius: getNavbarRadius(),
      transition: {
        duration: isAnimating ? 0.3 : 0,
        ease: [0.25, 0.46, 0.45, 0.94],
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
        ease: [0.25, 0.46, 0.45, 0.94],
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 blur-backdrop cursor-pointer"
            style={{ backdropFilter: 'blur(4px)' }}
            onClick={handleClickOutside}
          />
        )}
      </AnimatePresence>

      {/* Navigation Shell */}
      <motion.div
        className="fixed left-1/2 z-50 navbar-shadow overflow-hidden"
        style={{
          x: '-50%',
          bottom: '24px',
          width: 'clamp(90%, 350px, 100%)',
          maxWidth: '350px',
          minWidth: '90%',
          backgroundColor: '#121212', // Always dark grey-900 regardless of theme
          y: isExpanded ? currentDragY : 0, // Apply drag offset only when expanded
        }}
        variants={navVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        drag={isExpanded ? 'y' : false}
        dragConstraints={{ top: 0, bottom: getNavbarHeight() - 72 }}
        dragElastic={0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
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
              <div
                ref={contentRef}
                className="px-4 pt-4 pb-4 overflow-y-auto"
                style={{
                  maxHeight: `calc(${getNavbarHeight()}px - 72px)`, // Subtract icons row height
                }}
              >
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Icons Row - positioned at bottom */}
        <div className={`flex items-center h-[72px] relative overflow-hidden ${isExpanded ? 'px-5' : 'px-6'}`}>
          {!isExpanded ? (
            // Collapsed state: use flexbox for perfect spacing
            <div className="flex items-center justify-between w-full">
              {['home', 'list', 'send', 'settings'].map((icon) => {
                const isActiveIcon = icon === activeIcon;
                
                return (
                  <motion.button
                    key={icon}
                    initial={false}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      x: 0,
                    }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    onClick={() => handleIconClick(icon)}
                    className="p-2 rounded-full"
                  >
                    {icon === 'home' && (
                      <Home
                        size={28}
                        color={isActiveIcon ? '#C89B3C' : '#FFFFFF'}
                        strokeWidth={2.5}
                      />
                    )}
                    {icon === 'list' && (
                      <List
                        size={28}
                        color={isActiveIcon ? '#C89B3C' : '#FFFFFF'}
                        strokeWidth={2.5}
                      />
                    )}
                    {icon === 'send' && (
                      <Send
                        size={28}
                        color={isActiveIcon ? '#C89B3C' : '#FFFFFF'}
                        strokeWidth={2.5}
                      />
                    )}
                    {icon === 'settings' && (
                      <Settings
                        size={28}
                        color={isActiveIcon ? '#C89B3C' : '#FFFFFF'}
                        strokeWidth={2.5}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          ) : (
            // Expanded state: complex positioning for choreographed movement
            ['home', 'list', 'send', 'settings'].map((icon, index) => {
              const isActiveIcon = icon === activeIcon;
              
              // Calculate icon positions and properties based on drag progress
              const getIconProps = () => {
                if (isActiveIcon) {
                  // Active icon: interpolate between bottom-left and original position based on drag progress
                  const targetX = -175; // translateX(-175px)
                  const targetY = 20; // translateY(20px)
                  const currentX = targetX * (1 - dragProgress); // Move back to center as user drags
                  const currentY = targetY * (1 - dragProgress); // Move back to center as user drags
                  const currentScale = 1.1 - (0.1 * dragProgress); // Scale down as user drags
                  const currentColor = dragProgress > 0.5 ? '#FFFFFF' : '#C89B3C'; // Change color at 50% drag
                  
                  return {
                    x: currentX,
                    y: currentY,
                    opacity: 1,
                    scale: currentScale,
                    color: currentColor,
                    size: 32,
                    position: 'absolute' as const,
                    left: '50%',
                  };
                } else {
                  // Inactive icons: calculate absolute positions
                  // In collapsed state, icons are evenly spaced
                  // The navbar is 350px max width, with 4 icons
                  // Icons are at roughly: -105px, -35px, 35px, 105px from center
                  const collapsedPositions = [-105, -35, 35, 105];
                  const targetX = collapsedPositions[index];
                  const targetY = 0;
                  
                  // In expanded state, move icons off-screen
                  const activeIndex = ['home', 'list', 'send', 'settings'].indexOf(activeIcon);
                  const iconIndex = index;
                  const isLeftOfActive = iconIndex < activeIndex;
                  const offScreenX = isLeftOfActive ? -200 : 200;
                  const offScreenY = 0;
                  
                  // Interpolate based on drag progress
                  const currentX = offScreenX + (targetX - offScreenX) * dragProgress;
                  const currentY = offScreenY + (targetY - offScreenY) * dragProgress;
                  const currentOpacity = dragProgress;
                  
                  return {
                    x: currentX,
                    y: currentY,
                    opacity: currentOpacity,
                    scale: 1,
                    color: '#FFFFFF',
                    size: 28,
                    position: 'absolute' as const,
                    left: '50%',
                  };
                }
              };
              
              const iconProps = getIconProps();
              
              return (
                <motion.button
                  key={icon}
                  initial={false}
                  animate={{
                    x: iconProps.x,
                    y: iconProps.y,
                    opacity: iconProps.opacity,
                    scale: iconProps.scale,
                  }}
                  transition={{ 
                    duration: isAnimating ? 0.4 : 0,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  onClick={() => handleIconClick(icon)}
                  className={`p-${iconProps.size === 32 ? '3' : '2'} rounded-full absolute`}
                  style={{
                    left: iconProps.left,
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
            })
          )}
        </div>
      </motion.div>
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