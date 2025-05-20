import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiPhone, FiArrowRight, FiShield, FiCheck, FiXCircle } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}15, ${props => props.theme.colors.secondary}15);
  padding: ${props => props.theme.spacing.md};
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -100px;
    right: -100px;
    width: 400px;
    height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, ${props => props.theme.colors.primary}10, transparent 70%);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -100px;
    left: -100px;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, ${props => props.theme.colors.secondary}10, transparent 70%);
    z-index: 0;
  }
`;

const LoginContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.xl};
  box-shadow: ${props => props.theme.shadows.xl};
  overflow: hidden;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    height: 600px;
  }
`;

const LoginBanner = styled(motion.div)`
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.3;
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    width: 45%;
  }
`;

const LoginForm = styled(motion.div)`
  padding: ${props => props.theme.spacing.xl};
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    width: 55%;
  }
`;

const Logo = styled(motion.h1)`
  font-size: ${props => props.theme.typography.fontSize.xxl};
  color: white;
  margin-bottom: ${props => props.theme.spacing.lg};
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -${props => props.theme.spacing.xs};
    left: 0;
    width: 60px;
    height: 4px;
    background-color: white;
    border-radius: 2px;
  }
`;

const Tagline = styled.p`
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.9;
  line-height: 1.6;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const FormTitle = styled(motion.h2)`
  font-size: ${props => props.theme.typography.fontSize.xl};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormGroup = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const InputWrapper = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: ${props => props.theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.secondary};
    transition: all ${props => props.theme.transition.fast};
  }
  
  input:focus + svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.xxl};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: all ${props => props.theme.transition.fast};
  background-color: ${props => `${props.theme.colors.background}50`};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    background-color: ${props => props.theme.colors.surface};
  }
`;

const OTPInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.md} ${props => props.theme.spacing.xxl};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.md};
  letter-spacing: 5px;
  text-align: center;
  transition: all ${props => props.theme.transition.fast};
  background-color: ${props => `${props.theme.colors.background}50`};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
    background-color: ${props => props.theme.colors.surface};
  }
`;

const Button = styled(motion.button)`
  padding: ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  margin-top: ${props => props.theme.spacing.lg};
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: all 0.6s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

const ErrorMessage = styled(motion.div)`
  color: ${props => props.theme.colors.error};
  margin-top: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.sm};
  background-color: ${props => `${props.theme.colors.error}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  margin-top: ${props => props.theme.spacing.lg};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background-color: ${props => `${props.theme.colors.success}20`};
  color: ${props => props.theme.colors.success};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithPhone, error, currentUser } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect them
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Handle phone login
    const { success, user } = await loginWithPhone({ phone, password });
    
    if (success) {
      setSuccessMessage('Login successful! Redirecting...');
      
      // Direct login successful - redirect based on user role
      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    }
    
    setIsLoading(false);
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <LoginPage>
      <LoginContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LoginBanner
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Logo
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Europe Gas
          </Logo>
          <Tagline>
            Welcome to Europe Gas Analytics Platform. Sign in to manage spare parts inventory and track bonus payments for your team.
          </Tagline>
        </LoginBanner>
        
        <LoginForm
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <FormTitle
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Sign In
          </FormTitle>
          
          <Form onSubmit={handleSubmit}>
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FormGroup
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Label htmlFor="phone">
                  <FiPhone size={16} /> Phone Number
                </Label>
                <InputWrapper>
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <FiPhone size={18} />
                </InputWrapper>
              </FormGroup>
              
              <FormGroup
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="password">
                  <FiLock size={16} /> Password
                </Label>
                <InputWrapper>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <FiLock size={18} />
                </InputWrapper>
              </FormGroup>
            </motion.div>
            
            <Button
              type="submit"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'} <FiArrowRight />
            </Button>
            
            {error && (
              <ErrorMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiXCircle /> {error}
              </ErrorMessage>
            )}
            
            {successMessage && (
              <SuccessMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiCheck /> {successMessage}
              </SuccessMessage>
            )}
          </Form>
        </LoginForm>
      </LoginContainer>
    </LoginPage>
  );
};

export default Login; 