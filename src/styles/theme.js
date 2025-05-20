const theme = {
  colors: {
    primary: '#1a73e8', // More vibrant blue
    secondary: '#34a853', // Google green
    success: '#4caf50',
    error: '#f44336',
    warning: '#ff9800',
    info: '#2196f3',
    background: '#f8f9fa', // Lighter background
    surface: '#ffffff',
    text: {
      primary: '#202124', // Dark grey
      secondary: '#5f6368', // Medium grey
      disabled: '#9aa0a6', // Light grey
      hint: '#80868b', // Grey
    },
    border: '#dadce0', // Very Light Grey
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      md: '1rem', // 16px
      lg: '1.25rem', // 20px
      xl: '1.5rem', // 24px
      xxl: '2rem', // 32px
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    xxl: '3rem', // 48px
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
    md: '0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 1px 2px 0 rgba(60, 64, 67, 0.3)',
    lg: '0 4px 8px 3px rgba(60, 64, 67, 0.15), 0 1px 3px rgba(60, 64, 67, 0.3)',
    xl: '0 6px 10px 4px rgba(60, 64, 67, 0.15), 0 2px 3px rgba(60, 64, 67, 0.3)',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '24px',
    circular: '50%',
  },
  transition: {
    fast: '0.2s ease',
    medium: '0.3s ease',
    slow: '0.5s ease',
  },
  animation: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.3 }
    },
    slideInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
      transition: { duration: 0.3 }
    },
    slideInLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { duration: 0.3 }
    },
    slideInRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
      transition: { duration: 0.3 }
    },
    scale: {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.2 }
    }
  },
  zIndex: {
    modal: 1000,
    overlay: 900,
    dropdown: 800,
    header: 700,
    footer: 600,
  }
};

export default theme; 