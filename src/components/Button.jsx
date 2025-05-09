import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const ButtonBase = styled(motion.button)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => {
    switch (props.size) {
      case 'xs': return `${props.theme.spacing.xs} ${props.theme.spacing.sm}`;
      case 'sm': return `${props.theme.spacing.sm} ${props.theme.spacing.md}`;
      case 'lg': return `${props.theme.spacing.md} ${props.theme.spacing.lg}`;
      case 'xl': return `${props.theme.spacing.lg} ${props.theme.spacing.xl}`;
      default: return `${props.theme.spacing.sm} ${props.theme.spacing.lg}`;
    }
  }};
  border-radius: ${props => {
    switch (props.rounded) {
      case 'full': return props.theme.borderRadius.circular;
      case 'sm': return props.theme.borderRadius.sm;
      case 'lg': return props.theme.borderRadius.lg;
      case 'xl': return props.theme.borderRadius.xl;
      default: return props.theme.borderRadius.md;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'xs': return props.theme.typography.fontSize.xs;
      case 'sm': return props.theme.typography.fontSize.sm;
      case 'lg': return props.theme.typography.fontSize.lg;
      case 'xl': return props.theme.typography.fontSize.xl;
      default: return props.theme.typography.fontSize.md;
    }
  }};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  text-align: center;
  white-space: nowrap;
  min-width: ${props => props.fullWidth ? '100%' : props.iconOnly ? 'auto' : '80px'};
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  height: ${props => props.iconOnly ? (
    props.size === 'xs' ? '28px' : 
    props.size === 'sm' ? '36px' : 
    props.size === 'lg' ? '48px' : 
    props.size === 'xl' ? '56px' : '40px'
  ) : 'auto'};
  
  /* Icon-only button adjustments */
  padding: ${props => props.iconOnly ? (
    props.size === 'xs' ? '0.35rem' : 
    props.size === 'sm' ? '0.5rem' : 
    props.size === 'lg' ? '0.75rem' : 
    props.size === 'xl' ? '1rem' : '0.65rem'
  ) : props.padding};
  
  /* Disabled styles */
  opacity: ${props => props.disabled ? 0.6 : 1};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  /* Loading styles */
  position: relative;
  
  /* Variant styles applied last to override defaults */
  ${props => {
    // Primary variant
    if (props.variant === 'primary') {
      return `
        background-color: ${props.theme.colors.primary};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.primaryDark || props.theme.colors.primary};
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Secondary variant
    if (props.variant === 'secondary') {
      return `
        background-color: ${props.theme.colors.secondary};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.secondaryDark || props.theme.colors.secondary};
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Outline variant
    if (props.variant === 'outline') {
      return `
        background-color: transparent;
        color: ${props.theme.colors.primary};
        border: 1px solid ${props.theme.colors.primary};
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.primary}10;
          transform: translateY(-2px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Ghost variant
    if (props.variant === 'ghost') {
      return `
        background-color: transparent;
        color: ${props.theme.colors.primary};
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.primary}10;
        }
      `;
    }
    
    // Text variant
    if (props.variant === 'text') {
      return `
        background-color: transparent;
        color: ${props.theme.colors.text.primary};
        border: none;
        min-width: auto;
        padding-left: ${props.theme.spacing.sm};
        padding-right: ${props.theme.spacing.sm};
        
        &:hover:not(:disabled) {
          color: ${props.theme.colors.primary};
          text-decoration: underline;
        }
      `;
    }
    
    // Gradient variant
    if (props.variant === 'gradient') {
      return `
        background: linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary});
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Light variant
    if (props.variant === 'light') {
      return `
        background-color: ${props.theme.colors.background};
        color: ${props.theme.colors.text.primary};
        border: 1px solid ${props.theme.colors.border};
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.background}80;
          transform: translateY(-2px);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Error variant
    if (props.variant === 'error') {
      return `
        background-color: ${props.theme.colors.error};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.error}E0;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Success variant
    if (props.variant === 'success') {
      return `
        background-color: ${props.theme.colors.success};
        color: white;
        border: none;
        
        &:hover:not(:disabled) {
          background-color: ${props.theme.colors.success}E0;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        
        &:active:not(:disabled) {
          transform: translateY(0);
        }
      `;
    }
    
    // Default to primary if no variant specified
    return `
      background-color: ${props.theme.colors.primary};
      color: white;
      border: none;
      
      &:hover:not(:disabled) {
        background-color: ${props.theme.colors.primaryDark || props.theme.colors.primary};
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      
      &:active:not(:disabled) {
        transform: translateY(0);
      }
    `;
  }}
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => 
    props.size === 'xs' ? '0.85em' :
    props.size === 'sm' ? '0.9em' :
    props.size === 'lg' ? '1.1em' :
    props.size === 'xl' ? '1.2em' : '1em'
  };
`;

const LoadingSpinner = styled(motion.div)`
  width: ${props => 
    props.size === 'xs' ? '12px' :
    props.size === 'sm' ? '14px' :
    props.size === 'lg' ? '22px' :
    props.size === 'xl' ? '28px' : '18px'
  };
  height: ${props => 
    props.size === 'xs' ? '12px' :
    props.size === 'sm' ? '14px' :
    props.size === 'lg' ? '22px' :
    props.size === 'xl' ? '28px' : '18px'
  };
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  margin-right: ${props => props.hasChildren ? props.theme.spacing.sm : '0'};
`;

const spinTransition = {
  repeat: Infinity,
  ease: "linear",
  duration: 0.8
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded,
  leftIcon,
  rightIcon,
  onClick,
  fullWidth,
  disabled,
  loading,
  loadingText,
  iconOnly,
  ...props
}) => {
  const hasChildren = !!children;
  
  return (
    <ButtonBase
      variant={variant}
      size={size}
      rounded={rounded}
      onClick={onClick}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      iconOnly={iconOnly || (!hasChildren && (leftIcon || rightIcon))}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <LoadingSpinner 
          size={size}
          hasChildren={hasChildren}
          animate={{ rotate: 360 }}
          transition={spinTransition}
        />
      )}
      
      {!loading && leftIcon && (
        <IconWrapper size={size}>
          {leftIcon}
        </IconWrapper>
      )}
      
      {loading && loadingText ? loadingText : children}
      
      {!loading && rightIcon && (
        <IconWrapper size={size}>
          {rightIcon}
        </IconWrapper>
      )}
    </ButtonBase>
  );
};

// Secondary export for icon button
const IconButton = (props) => <Button iconOnly {...props} />;

export { Button, IconButton };
export default Button; 