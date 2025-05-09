import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiBox } from 'react-icons/fi';

const LogoContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  cursor: pointer;
`;

const LogoIconWrapper = styled.div`
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  
  svg {
    filter: drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.1));
  }
`;

const LogoText = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  font-size: ${props => props.size === 'small' ? props.theme.typography.fontSize.md : props.theme.typography.fontSize.lg};
  
  span {
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.size === 'small' ? props.theme.typography.fontSize.sm : props.theme.typography.fontSize.md};
  }
`;

const WebsiteLogo = ({ size = 'normal', iconOnly = false, showText = true, className }) => {
  const logoContent = (
    <LogoContainer 
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <LogoIconWrapper>
        <FiBox size={size === 'small' ? 22 : 28} strokeWidth={2.5} />
      </LogoIconWrapper>
      
      {showText && !iconOnly && (
        <LogoText size={size}>
          <span>Europe Gas</span>
        </LogoText>
      )}
    </LogoContainer>
  );
  
  // Return the logo without wrapping it in a Link component
  return logoContent;
};

export default WebsiteLogo; 