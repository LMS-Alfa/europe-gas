import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';

const ToggleButton = styled(motion.button)`
  background-color: ${props => props.isDarkMode 
    ? `rgba(255, 255, 255, 0.1)` 
    : `rgba(0, 0, 0, 0.1)`
  };
  color: ${props => props.isDarkMode 
    ? props.theme.colors.text.primary 
    : props.theme.colors.text.primary
  };
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  position: relative;
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transition.medium};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: ${props => props.theme.shadows.md};
    background-color: ${props => props.isDarkMode 
      ? `rgba(255, 255, 255, 0.15)` 
      : `rgba(0, 0, 0, 0.15)`
    };
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const IconContainer = styled.div`
  position: relative;
  width: 24px;
  height: 24px;
`;

const IconWrapper = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  return (
    <ToggleButton 
      onClick={toggleTheme} 
      isDarkMode={isDarkMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      whileTap={{ scale: 0.9 }}
    >
      <IconContainer>
        <IconWrapper
          animate={{ 
            opacity: isDarkMode ? 0 : 1,
            rotateY: isDarkMode ? 90 : 0
          }}
          transition={{ duration: 0.3 }}
          initial={false}
        >
          <FiSun size={20} />
        </IconWrapper>
        
        <IconWrapper
          animate={{ 
            opacity: isDarkMode ? 1 : 0,
            rotateY: isDarkMode ? 0 : -90
          }}
          transition={{ duration: 0.3 }}
          initial={false}
        >
          <FiMoon size={20} />
        </IconWrapper>
      </IconContainer>
    </ToggleButton>
  );
};

export default ThemeToggle; 