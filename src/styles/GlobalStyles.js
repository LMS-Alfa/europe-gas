import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.md};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.background};
    line-height: ${props => props.theme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
    transition: all ${props => props.theme.transition.medium};
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  a {
    text-decoration: none;
    color: ${props => props.theme.colors.primary};
    transition: all ${props => props.theme.transition.fast};
    position: relative;

    &:hover {
      color: ${props => props.theme.colors.secondary};
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}40`};
    }
  }

  button {
    font-family: ${props => props.theme.typography.fontFamily};
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    transition: all ${props => props.theme.transition.fast};
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}40`};
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea, select {
    font-family: ${props => props.theme.typography.fontFamily};
    font-size: ${props => props.theme.typography.fontSize.md};
    transition: all ${props => props.theme.transition.fast};
    color: ${props => props.theme.colors.text.primary};
    background-color: ${props => props.theme.colors.surface};
    
    &:focus {
      outline: none;
    }
    
    &::placeholder {
      color: ${props => props.theme.colors.text.hint};
      opacity: 0.7;
    }
  }

  ul, ol {
    list-style: none;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    line-height: ${props => props.theme.typography.lineHeight.tight};
    color: ${props => props.theme.colors.text.primary};
    transition: color ${props => props.theme.transition.medium};
  }

  p {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    line-height: ${props => props.theme.typography.lineHeight.relaxed};
    transition: color ${props => props.theme.transition.medium};
  }

  ::selection {
    background-color: ${props => `${props.theme.colors.primary}30`};
    color: ${props => props.theme.colors.text.primary};
  }
  
  /* Scrollbar styling */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }
  
  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.text.hint};
  }
  
  /* Desktop/mobile visibility */
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    .desktop-actions {
      display: none !important;
    }
  }
  
  @media (min-width: ${props => `calc(${props.theme.breakpoints.sm} + 1px)`}) {
    .mobile-actions {
      display: none !important;
    }
  }
  
  /* Animations */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .slide-up {
    animation: slideUp 0.4s ease-in-out;
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  
  /* Theme transition */
  *, *::before, *::after {
    transition-property: background-color, border-color, color, fill, stroke;
    transition-duration: ${props => props.theme.transition.medium};
    transition-timing-function: ease-in-out;
  }
`;

export default GlobalStyles; 