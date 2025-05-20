import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Use attrs to prevent custom props from being forwarded to the DOM
const GridContainer = styled.div.attrs(props => {
  // Filter out custom props that shouldn't be passed to the DOM
  const { columns, gap, mobileGap, ...rest } = props;
  return rest;
})`
  display: grid;
  gap: ${props => props.gap || props.theme.spacing.lg};
  width: 100%;
  
  /* Default grid template */
  grid-template-columns: repeat(${props => props.columns || 12}, 1fr);
  
  /* Responsive columns based on breakpoints */
  @media (max-width: ${props => props.theme.breakpoints.xl}) {
    grid-template-columns: repeat(${props => Math.min(props.columns || 12, 12)}, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(${props => Math.min(props.columns || 12, 8)}, 1fr);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(${props => Math.min(props.columns || 12, 6)}, 1fr);
    gap: ${props => props.mobileGap || props.gap || props.theme.spacing.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.mobileGap || props.theme.spacing.sm};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.xs}) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

// Use attrs to prevent custom props from being forwarded to the DOM
const GridItem = styled(motion.div).attrs(props => {
  // Filter out custom props that shouldn't be passed to the DOM
  const { colSpan, rowSpan, minHeight, fullHeight, ...rest } = props;
  return rest;
})`
  /* Column span */
  grid-column: span ${props => props.colSpan || 3};
  
  /* Row span */
  grid-row: span ${props => props.rowSpan || 1};
  
  /* Responsive column spans */
  @media (max-width: ${props => props.theme.breakpoints.xl}) {
    grid-column: span ${props => Math.min(props.colSpan || 3, 12)};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-column: span ${props => Math.min(props.colSpan || 3, 8)};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-column: span ${props => Math.min(props.colSpan || 3, 6)};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-column: span 1;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.xs}) {
    grid-column: span 1;
  }
  
  /* Optional min-height for consistent card heights */
  min-height: ${props => props.minHeight || 'auto'};
  height: ${props => props.fullHeight ? '100%' : 'auto'};
`;

// Animation variants for staggered grid item animations
const gridItemVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: (i) => ({
    opacity: 1, 
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: "easeOut"
    }
  })
};

const GridLayout = ({ 
  children, 
  columns = 12, 
  gap,
  mobileGap,
  animate = true,
  staggered = true,
  ...props 
}) => {
  // Clone children to add motion variants
  const childrenWithVariants = animate && staggered ? 
    React.Children.map(children, (child, i) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          variants: gridItemVariants,
          custom: i,
          initial: "hidden",
          animate: "visible"
        });
      }
      return child;
    }) : children;

  return (
    <GridContainer 
      columns={columns} 
      gap={gap} 
      mobileGap={mobileGap}
      {...props}
    >
      {childrenWithVariants}
    </GridContainer>
  );
};

const GridCard = ({ 
  children, 
  colSpan = 3,
  rowSpan = 1,
  minHeight,
  fullHeight,
  ...props 
}) => {
  return (
    <GridItem 
      colSpan={colSpan} 
      rowSpan={rowSpan}
      minHeight={minHeight}
      fullHeight={fullHeight}
      {...props}
    >
      {children}
    </GridItem>
  );
};

export { GridLayout, GridCard }; 