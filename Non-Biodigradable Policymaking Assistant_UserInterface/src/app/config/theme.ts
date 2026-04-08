// Customizable Theme Configuration for AI Assistant

export const theme = {
  // Color Scheme (60-30-10 rule)
  colors: {
    dominant: '#D1D4C9',      // 60% - Background
    theme: '#556E53',          // 30% - Theme color
    accent: '#29435C',         // 10% - Accent color
    font: '#152A38',           // Font color
    outputBackground: '#29435C', // AI output background
    outputText: '#D1D4C9',     // AI output text
  },

  // Typography
  fonts: {
    heading: 'GFS Didot, serif',
    headingOutput: 'Times New Roman, serif',
    body: 'system-ui, -apple-system, sans-serif',
  },

  // Application Text
  text: {
    appTitle: 'Policymaking AI Assistant',
    appSubtitle: 'Non-Biodegradable Waste Management',
    orgName: 'Environmental Policy Organization',
  },

  // Navigation Items
  navigation: [
    { label: 'About Us', icon: 'Info', href: '#about' },
    { label: 'How to Use?', icon: 'HelpCircle', href: '#how-to-use' },
    { label: 'Drafting', icon: 'FileEdit', href: '#drafting' },
    { label: 'Plans', icon: 'CreditCard', href: '#plans' },
    { label: 'Sign In', icon: 'UserPlus', href: '#sign-in' },
    { label: 'Login', icon: 'LogIn', href: '#login' },
  ],

  // Layout
  layout: {
    gridColumns: 8,
    gridRows: 8,
    margins: '40px',
  },

  // Animation
  animation: {
    transitionDuration: 0.4,
    skeletonDuration: 1.5, // seconds
  },
};

export type Theme = typeof theme;
