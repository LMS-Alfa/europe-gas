import styled from 'styled-components';
import { motion } from 'framer-motion';

const PanelContainer = styled(motion.div).attrs(props => {
  // Filter out custom props
  const { accent, variant, fullHeight, ...rest } = props;
  return rest;
})`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: box-shadow ${props => props.theme.transition.medium};
  width: 100%;
  height: ${props => props.fullHeight ? '100%' : 'auto'};
  overflow: hidden;
  
  /* Accent styling */
  ${props => props.accent && `
    border-left: 4px solid ${
      props.accent === 'primary' ? props.theme.colors.primary :
      props.accent === 'secondary' ? props.theme.colors.secondary :
      props.accent === 'success' ? props.theme.colors.success :
      props.accent === 'error' ? props.theme.colors.error :
      props.accent === 'warning' ? props.theme.colors.warning :
      props.accent === 'gradient' ? 'transparent' :
      props.theme.colors.primary
    };
    
    ${props.accent === 'gradient' && `
      position: relative;
      
      &:before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to bottom, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
      }
    `}
  `}
  
  /* Elevated panel */
  ${props => props.variant === 'elevated' && `
    box-shadow: ${props.theme.shadows.md};
    transition: box-shadow 0.3s ease, transform 0.3s ease;
    
    &:hover {
      box-shadow: ${props.theme.shadows.lg};
    }
  `}
  
  /* Stat card */
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

const PanelHeader = styled.div.attrs(props => {
  // Filter out custom props
  const { compact, gradient, ...rest } = props;
  return rest;
})`
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

const PanelContent = styled.div.attrs(props => {
  // Filter out custom props
  const { noPadding, compact, ...rest } = props;
  return rest;
})`
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