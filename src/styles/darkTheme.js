import lightTheme from './theme';

const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#4f9bff', // Brighter blue for dark mode
    secondary: '#4eca7c', // Brighter green for dark mode
    success: '#64dd6b',
    error: '#ff6358',
    warning: '#ffc14f',
    info: '#4fb3ff',
    background: '#121212', // Dark background
    surface: '#1e1e1e', // Dark surface
    text: {
      primary: '#f1f3f5', // Light text
      secondary: '#adb5bd', // Medium grey
      disabled: '#6c757d', // Darker grey
      hint: '#868e96', // Grey
    },
    border: '#2c2c2c', // Darker border
  },
  shadows: {
    none: 'none',
    sm: '0 2px 4px 0 rgba(0, 0, 0, 0.4), 0 1px 3px 1px rgba(0, 0, 0, 0.6)',
    md: '0 4px 8px 2px rgba(0, 0, 0, 0.5), 0 2px 4px 0 rgba(0, 0, 0, 0.7)',
    lg: '0 6px 10px 4px rgba(0, 0, 0, 0.6), 0 3px 5px rgba(0, 0, 0, 0.8)',
    xl: '0 8px 12px 6px rgba(0, 0, 0, 0.7), 0 4px 6px rgba(0, 0, 0, 0.9)',
  },
};

export default darkTheme; 