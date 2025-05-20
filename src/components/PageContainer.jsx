import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Container } from './Container';

const PageWrapper = styled(motion.div)`
  min-height: calc(100vh - 120px); /* Adjust based on header/footer height */
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  flex: 1;
  width: 100%;
  position: relative;
  z-index: 1;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0;
  }
`;

const BackgroundGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: linear-gradient(180deg, 
    ${props => `${props.theme.colors.primary}08`} 0%, 
    ${props => `${props.theme.colors.background}00`} 100%
  );
  z-index: -1;
  pointer-events: none;
  
  /* Optional gradient style */
  ${props => props.gradient === 'secondary' && `
    background: linear-gradient(180deg, 
      ${props.theme.colors.secondary}08 0%, 
      ${props.theme.colors.background}00 100%
    );
  `}
  
  ${props => props.gradient === 'blend' && `
    background: linear-gradient(135deg, 
      ${props.theme.colors.primary}05 0%, 
      ${props.theme.colors.secondary}05 50%,
      ${props.theme.colors.background}00 100%
    );
  `}
`;

const pageVariants = {
  initial: { 
    opacity: 0 
  },
  animate: { 
    opacity: 1,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

const contentVariants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const StyledContainer = styled(Container)`
  width: 100% !important;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    padding: ${props => props.padding || '0.75rem'} !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 !important;
    margin: 0;
    width: 100% !important;
  }
`;

/**
 * PageContainer component for wrapping page content
 * Provides consistent padding, optional background, and animation
 */
const PageContainer = ({
  children,
  title,
  maxWidth,
  background,
  backgroundGradient,
  padding,
  spacing,
  noAnimation = false,
  contentWidth = 'xl', // sm, md, lg, xl, 2xl, fluid
  ...props
}) => {
  return (
    <PageWrapper
      variants={noAnimation ? {} : pageVariants}
      initial={noAnimation ? false : "initial"}
      animate={noAnimation ? false : "animate"}
      exit={noAnimation ? false : "exit"}
    >
      {backgroundGradient && (
        <BackgroundGradient gradient={backgroundGradient} />
      )}
      
      <ContentWrapper>
        <StyledContainer 
          size={contentWidth}
          fluid={contentWidth === 'fluid'}
          centered={contentWidth !== 'fluid'}
          padding={padding || '1rem'}
          spacing={spacing || '0.75rem'}
          variants={noAnimation ? {} : contentVariants}
          background={background}
          {...props}
        >
          {children}
        </StyledContainer>
      </ContentWrapper>
    </PageWrapper>
  );
};

export default PageContainer; 