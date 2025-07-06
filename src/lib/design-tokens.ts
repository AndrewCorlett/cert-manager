export const designTokens = {
  colors: {
    grey: {
      900: '#121212',
      700: '#1E1E1E',
      500: '#3B3B3B',
    },
    white: {
      pure: '#FFFFFF',
    },
    gold: {
      accent: '#C89B3C',
    },
    error: {
      red: '#F43F5E',
    },
    success: {
      green: '#10B981',
    },
    warn: {
      amber: '#F59E0B',
    },
  },
  animations: {
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    duration: {
      standard: 300,
      micro: 180,
    },
  },
  spacing: {
    navBarHeight: {
      collapsed: 60,
      expanded: 'auto',
    },
    navBarWidth: {
      min: '90%',
      max: '350px',
    },
    borderRadius: {
      collapsed: 30,
      expanded: 20,
    },
    shadow: {
      navbar: '0 4px 20px rgba(0,0,0,0.4)',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;