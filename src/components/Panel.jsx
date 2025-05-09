import styled from 'styled-components';
import { motion } from 'framer-motion';

const PanelContainer = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => 
    props.variant === 'rounded' ? props.theme.borderRadius.xl : 
    props.variant === 'sharp' ? props.theme.borderRadius.sm : 
    props.theme.borderRadius.md};
  box-shadow: ${props => 
    props.variant === 'elevated' ? props.theme.shadows.lg : 
    props.variant === 'flat' ? 'none' : 
    props.theme.shadows.md};
  overflow: hidden;
  position: relative;
  width: 100% !important;
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  border: ${props => 
    props.variant === 'outlined' ? `1px solid ${props.theme.colors.border}` : 
    props.variant === 'flat' ? `1px solid ${props.theme.colors.border}` : 
    'none'};
  
  /* Gradient accent variants */
  ${props => props.accent === 'primary' && `
    border-top: 4px solid ${props.theme.colors.primary};
  `}
  
  ${props => props.accent === 'secondary' && `
    border-top: 4px solid ${props.theme.colors.secondary};
  `}
  
  ${props => props.accent === 'gradient' && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
    }
  `}
  
  /* Glass effect for transparent panels */
  ${props => props.variant === 'glass' && `
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  /* Dashboard stat panel styles */
  ${props => props.variant === 'stat' && `
    padding: ${props.theme.spacing.md};
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, ${props.theme.colors.surface}, ${props.theme.colors.background});
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: ${props.theme.shadows.lg};
    }
    
    @media (max-width: ${props.theme.breakpoints.sm}) {
      padding: ${props.theme.spacing.sm};
      &:hover {
        transform: translateY(-2px);
      }
    }
  `}
  
  /* Darkened panel */
  ${props => props.variant === 'dark' && `
    background-color: ${props.theme.colors.background};
  `}
  
  /* Tablet styles for all panels */
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    border-radius: ${props => props.theme.borderRadius.md};
  }
  
  /* Mobile styles for all panels */
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100% !important;
    border-radius: ${props => props.theme.borderRadius.sm};
    margin: 0 0 ${props => props.theme.spacing.md} 0;
  }
`;

const PanelHeader = styled.div`
  padding: ${props => props.compact ? `${props.theme.spacing.sm} ${props.theme.spacing.md}` : `${props.theme.spacing.md} ${props.theme.spacing.lg}`};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  /* Gradient header */
  ${props => props.gradient && `
    background: linear-gradient(135deg, ${props.theme.colors.primary}15, ${props.theme.colors.secondary}15);
  `}
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.compact ? `${props.theme.spacing.xs} ${props.theme.spacing.sm}` : `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
    width: 100%;
  }
`;

const PanelTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const PanelIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${props => props.theme.borderRadius.circular};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}20, ${props => props.theme.colors.secondary}20);
  color: ${props => props.theme.colors.primary};
`;

const PanelContent = styled.div`
  padding: ${props => props.noPadding ? '0' : props.compact ? props.theme.spacing.sm : `${props.theme.spacing.lg}`};
  width: 100% !important;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    padding: ${props => props.noPadding ? '0' : props.compact ? props.theme.spacing.sm : `${props.theme.spacing.md}`};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.noPadding ? '0' : props.compact ? props.theme.spacing.xs : `${props.theme.spacing.md}`};
    width: 100% !important;
    
    /* Remove all padding for tables */
    table {
      margin: 0;
      padding: 0;
      width: 100% !important;
    }
  }
`;

const PanelFooter = styled.div`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: ${props => props.align || 'flex-end'};
  gap: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.background}10;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
  }
`;

// Animation variants
const panelVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const Panel = ({ 
  children, 
  title, 
  icon,
  variant = 'default',
  accent,
  fullHeight,
  actions,
  footer,
  footerAlign,
  noPadding,
  compact = false,
  gradientHeader,
  animate = true,
  ...props 
}) => {
  return (
    <PanelContainer 
      variant={variant}
      accent={accent}
      fullHeight={fullHeight}
      variants={animate ? panelVariants : null}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      {...props}
    >
      {(title || actions) && (
        <PanelHeader gradient={gradientHeader} compact={compact}>
          <PanelTitle>
            {icon && <PanelIcon>{icon}</PanelIcon>}
            {title}
          </PanelTitle>
          {actions}
        </PanelHeader>
      )}
      
      <PanelContent noPadding={noPadding} compact={compact}>
        {children}
      </PanelContent>
      
      {footer && (
        <PanelFooter align={footerAlign}>
          {footer}
        </PanelFooter>
      )}
    </PanelContainer>
  );
};

export default Panel;