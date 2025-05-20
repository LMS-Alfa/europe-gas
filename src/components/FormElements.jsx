import { useState, forwardRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

// Form Container
const FormContainer = styled(motion.form)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.gap || props.theme.spacing.lg};
  width: 100%;
`;

// Form Group
const FormGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
  position: relative;
`;

// Form Row for horizontal layout
const FormRow = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.gap || props.theme.spacing.md};
  
  & > * {
    flex: ${props => props.equalWidth ? '1 1 0' : 'none'};
    min-width: ${props => props.minChildWidth || '200px'};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    
    & > * {
      width: 100%;
    }
  }
`;

// Label component
const Label = styled.label`
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

// Base input styles
const inputStyles = (props) => `
  width: 100%;
  padding: ${props.size === 'sm' ? props.theme.spacing.sm : props.size === 'lg' ? props.theme.spacing.lg : props.theme.spacing.md};
  font-size: ${props.size === 'sm' ? props.theme.typography.fontSize.sm : props.size === 'lg' ? props.theme.typography.fontSize.lg : props.theme.typography.fontSize.md};
  background-color: ${props.variant === 'filled' ? props.theme.colors.background : 'transparent'};
  border: 1px solid ${props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props.theme.borderRadius.md};
  color: ${props.theme.colors.text.primary};
  transition: all ${props.theme.transition.fast};
  outline: none;
  
  &:focus {
    border-color: ${props.error ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props.error ? `${props.theme.colors.error}20` : `${props.theme.colors.primary}20`};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${props.theme.colors.background};
  }
  
  &::placeholder {
    color: ${props.theme.colors.text.tertiary};
    opacity: 0.7;
  }
`;

// Text Input
const TextInput = styled(motion.input)`
  ${props => inputStyles(props)}
`;

// Textarea
const TextArea = styled(motion.textarea)`
  ${props => inputStyles(props)}
  resize: ${props => props.resize || 'vertical'};
  min-height: ${props => props.minHeight || '100px'};
`;

// Select Input
const Select = styled(motion.select)`
  ${props => inputStyles(props)}
  appearance: none;
  background-image: ${props => `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='${encodeURIComponent(props.theme.colors.text.secondary)}' viewBox='0 0 16 16'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>")`};
  background-repeat: no-repeat;
  background-position: right ${props => props.theme.spacing.md} center;
  padding-right: ${props => props.theme.spacing.xl};
`;

// Checkbox container
const CheckboxContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  cursor: pointer;
`;

// Hidden native checkbox
const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
`;

// Custom checkbox visual
const CustomCheckbox = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transition.fast};
  background-color: ${props => props.checked ? props.theme.colors.primary : 'transparent'};
  
  &:hover {
    border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
  }
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${props => props.error ? `${props.theme.colors.error}20` : `${props.theme.colors.primary}20`};
  }
  
  ${HiddenCheckbox}:disabled + & {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.background};
  }
`;

// Checkmark icon
const CheckIcon = styled(motion.div)`
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
`;

// Radio Button container
const RadioContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  cursor: pointer;
`;

// Hidden native radio
const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  opacity: 0;
  position: absolute;
  width: 0;
  height: 0;
`;

// Custom radio visual
const CustomRadio = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 1px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
  }
  
  ${HiddenRadio}:focus + & {
    box-shadow: 0 0 0 3px ${props => props.error ? `${props.theme.colors.error}20` : `${props.theme.colors.primary}20`};
  }
  
  ${HiddenRadio}:disabled + & {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: ${props => props.theme.colors.background};
  }
`;

// Radio dot
const RadioDot = styled(motion.div)`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.theme.colors.primary};
`;

// Error Message
const ErrorMessage = styled(motion.div)`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

// Helper Text
const HelperText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
`;

// Form Action Buttons Container
const FormActions = styled(motion.div)`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: ${props => props.align || 'flex-end'};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: ${props => props.stackOnMobile ? 'column' : 'row'};
    width: 100%;
    
    button {
      width: ${props => props.stackOnMobile ? '100%' : 'auto'};
    }
  }
`;

// Animation variants
const errorVariants = {
  hidden: { 
    opacity: 0,
    y: -10,
    height: 0
  },
  visible: { 
    opacity: 1,
    y: 0,
    height: 'auto',
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    height: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Input Component
const Input = forwardRef(({
  name,
  label,
  error,
  helper,
  size = 'md',
  variant = 'outlined',
  leftIcon,
  rightIcon,
  type = 'text',
  ...props
}, ref) => {
  return (
    <FormGroup>
      {label && <Label htmlFor={name}>{label}</Label>}
      
      <TextInput
        id={name}
        name={name}
        ref={ref}
        size={size}
        variant={variant}
        error={error}
        type={type}
        {...props}
      />
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

// Textarea Component
const Textarea = forwardRef(({
  name,
  label,
  error,
  helper,
  size = 'md',
  variant = 'outlined',
  resize = 'vertical',
  minHeight,
  ...props
}, ref) => {
  return (
    <FormGroup>
      {label && <Label htmlFor={name}>{label}</Label>}
      
      <TextArea
        id={name}
        name={name}
        ref={ref}
        size={size}
        variant={variant}
        error={error}
        resize={resize}
        minHeight={minHeight}
        {...props}
      />
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

// Select Component
const SelectInput = forwardRef(({
  name,
  label,
  error,
  helper,
  children,
  size = 'md',
  variant = 'outlined',
  ...props
}, ref) => {
  return (
    <FormGroup>
      {label && <Label htmlFor={name}>{label}</Label>}
      
      <Select
        id={name}
        name={name}
        ref={ref}
        size={size}
        variant={variant}
        error={error}
        {...props}
      >
        {children}
      </Select>
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

// Checkbox Component
const Checkbox = forwardRef(({
  name,
  label,
  error,
  helper,
  checked = false,
  onChange,
  ...props
}, ref) => {
  return (
    <FormGroup>
      <CheckboxContainer>
        <HiddenCheckbox
          id={name}
          name={name}
          ref={ref}
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <CustomCheckbox checked={checked} error={error}>
          {checked && (
            <CheckIcon
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              ✓
            </CheckIcon>
          )}
        </CustomCheckbox>
        {label && <Label htmlFor={name} style={{ margin: 0 }}>{label}</Label>}
      </CheckboxContainer>
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

// Radio Component
const Radio = forwardRef(({
  name,
  label,
  error,
  helper,
  checked = false,
  onChange,
  ...props
}, ref) => {
  return (
    <FormGroup>
      <RadioContainer>
        <HiddenRadio
          id={name}
          name={name}
          ref={ref}
          checked={checked}
          onChange={onChange}
          {...props}
        />
        <CustomRadio checked={checked} error={error}>
          {checked && (
            <RadioDot
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </CustomRadio>
        {label && <Label htmlFor={name} style={{ margin: 0 }}>{label}</Label>}
      </RadioContainer>
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

// Radio Group Component
const RadioGroup = forwardRef(({
  name,
  label,
  error,
  helper,
  options = [],
  value,
  onChange,
  ...props
}, ref) => {
  return (
    <FormGroup>
      {label && <Label>{label}</Label>}
      
      {options.map((option, index) => (
        <Radio
          key={index}
          name={name}
          label={option.label}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
          {...props}
        />
      ))}
      
      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <span>⚠</span> {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
      
      {helper && !error && <HelperText>{helper}</HelperText>}
    </FormGroup>
  );
});

export {
  FormContainer,
  FormGroup,
  FormRow,
  FormActions,
  Input,
  Textarea,
  SelectInput,
  Checkbox,
  Radio,
  RadioGroup,
  Label
}; 