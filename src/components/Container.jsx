import styled from 'styled-components';
import { motion } from 'framer-motion';

// Base container with consistent padding
const StyledContainer = styled(motion.div)`
  padding: ${props => props.padding || props.theme.spacing.xl};
  margin: ${props => props.margin || '0'};
  width: ${props => props.fluid || props.fullWidth ? '100% !important' : props.width || 'auto'};
  max-width: ${props => {
    if (props.fluid || props.fullWidth) return '100% !important';
    if (props.size === 'sm') return '640px';
    if (props.size === 'md') return '768px';
    if (props.size === 'lg') return '1024px';
    if (props.size === 'xl') return '1280px';
    if (props.size === '2xl') return '1536px';
    return props.maxWidth || '1280px';
  }};
  margin-left: ${props => (props.centered && !props.fluid && !props.fullWidth) ? 'auto' : props.marginLeft || '0'};
  margin-right: ${props => (props.centered && !props.fluid && !props.fullWidth) ? 'auto' : props.marginRight || '0'};
  background-color: ${props => props.background || 'transparent'};
  border-radius: ${props => props.borderRadius || props.theme.borderRadius.md};
  box-shadow: ${props => props.shadow ? props.theme.shadows.md : 'none'};
  position: relative;
  overflow: ${props => props.overflow || 'visible'};
  
  /* Responsive padding for mobile */
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    max-width: 100% !important;
    padding: ${props => props.mobilePadding || props.theme.spacing.lg};
    margin-left: 0;
    margin-right: 0;
  }
  
  /* Full width on mobile */
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100% !important;
    max-width: 100% !important;
    padding: ${props => props.noPadding ? '0' : props.mobilePadding || props.theme.spacing.xs};
  }
  
  /* Background variants */
  ${props => props.variant === 'surface' && `
    background-color: ${props.theme.colors.surface};
  `}
  
  ${props => props.variant === 'background' && `
    background-color: ${props.theme.colors.background};
  `}
  
  ${props => props.variant === 'gradient' && `
    background: linear-gradient(135deg, ${props.theme.colors.primary}10, ${props.theme.colors.secondary}10);
  `}
  
  /* Border styles */
  ${props => props.bordered && `
    border: 1px solid ${props.theme.colors.border};
  `}
  
  /* Glass morphism effect */
  ${props => props.glass && `
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `}
  
  /* Spacing between children */
  & > *:not(:last-child) {
    margin-bottom: ${props => props.spacing || props.theme.spacing.lg};
  }
  
  /* Optional grid layout */
  ${props => props.grid && `
    display: grid;
    grid-template-columns: repeat(${props.gridCols || 1}, 1fr);
    gap: ${props.gridGap || props.theme.spacing.lg};
    
    @media (max-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: repeat(${Math.min(props.gridCols || 1, 2)}, 1fr);
    }
    
    @media (max-width: ${props.theme.breakpoints.sm}) {
      grid-template-columns: 1fr;
    }
  `}
  
  /* Optional flex layout */
  ${props => props.flex && `
    display: flex;
    flex-direction: ${props.flexDirection || 'column'};
    justify-content: ${props.justifyContent || 'flex-start'};
    align-items: ${props.alignItems || 'stretch'};
    flex-wrap: ${props.flexWrap || 'nowrap'};
    gap: ${props.gap || props.theme.spacing.md};
  `}
`;

// Animation variants
const containerVariants = {
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

// Section container with optional header and footer
const Container = ({ 
  children,
  animate = true,
  centered = false,
  size,
  fluid,
  variant,
  shadow = false,
  bordered = false,
  glass = false,
  spacing,
  padding,
  margin,
  mobilePadding,
  grid = false,
  gridCols,
  gridGap,
  flex = false,
  flexDirection,
  justifyContent,
  alignItems,
  flexWrap,
  gap,
  ...props 
}) => {
  return (
    <StyledContainer
      variants={animate ? containerVariants : null}
      initial={animate ? "hidden" : undefined}
      animate={animate ? "visible" : undefined}
      centered={centered}
      size={size}
      fluid={fluid}
      variant={variant}
      shadow={shadow}
      bordered={bordered}
      glass={glass}
      spacing={spacing}
      padding={padding}
      margin={margin}
      mobilePadding={mobilePadding}
      grid={grid}
      gridCols={gridCols}
      gridGap={gridGap}
      flex={flex}
      flexDirection={flexDirection}
      justifyContent={justifyContent}
      alignItems={alignItems}
      flexWrap={flexWrap}
      gap={gap}
      {...props}
    >
      {children}
    </StyledContainer>
  );
};

// Additional specialized containers
const Card = (props) => <Container variant="surface" shadow bordered {...props} />;
const Section = (props) => <Container padding={`${props.theme?.spacing?.xl || '2rem'} 0`} fluid {...props} />;
const FlexContainer = (props) => <Container flex {...props} />;
const GridContainer = (props) => <Container grid {...props} />;

export { Container, Card, Section, FlexContainer, GridContainer };
export default Container; 