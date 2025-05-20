import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiUser, FiMail, FiLock, FiUserCheck, FiX, FiMoreVertical, FiPhone, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import PageContainer from '../../components/PageContainer';
import { Container } from '../../components/Container';
import DataTable from '../../components/DataTable';
import { Button } from '../../components/Button';
import { getAllProfiles, getAllUserParts, getAllUsersEntriesAndBonus } from '../../utils/api';
import { createNewUser, updateUser, deleteUser } from '../../utils/userManagement';

const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 1rem;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0.5rem;
  }
`;

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.borderRadius.sm};
  }
`;

const UserTable = styled.div`
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
  }
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background};
  
  th {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    border-bottom: 1px solid ${props => props.theme.colors.border};
    white-space: nowrap;
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      padding: ${props => props.theme.spacing.sm};
    }
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.background};
  }
  
  td {
    padding: ${props => props.theme.spacing.md};
    border-bottom: 1px solid ${props => props.theme.colors.border};
    
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      padding: ${props => props.theme.spacing.sm};
    }
  }

  tr:hover {
    background-color: ${props => `${props.theme.colors.primary}05`};
  }
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.lg};
  position: relative;
  flex: 1;
  
  input {
    flex: 1;
    padding: ${props => props.theme.spacing.md};
    padding-left: ${props => props.theme.spacing.xl};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.typography.fontSize.md};
    box-shadow: ${props => props.theme.shadows.sm};
    transition: all ${props => props.theme.transition.fast};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
    }
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing.sm};
      padding-left: 2.5rem;
      font-size: ${props => props.theme.typography.fontSize.sm};
    }
  }
  
  svg {
    position: absolute;
    left: ${props => props.theme.spacing.md};
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.secondary};
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      left: ${props => props.theme.spacing.sm};
    }
  }
`;

const ActionsCell = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.xs};
  }
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.color || props.theme.colors.primary};
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => `${props.color || props.theme.colors.primary}10`};
    transform: translateY(-2px);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.xs};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    padding-left: calc(${props => props.theme.spacing.xl} + 12px);
    border: 2px solid ${props => props.error ? props.theme.colors.error : props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.typography.fontSize.md};
    background-color: ${props => props.theme.colors.surface};
    transition: all ${props => props.theme.transition.fast};
    
    &:focus {
      outline: none;
      border-color: ${props => props.error ? props.theme.colors.error : props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => props.error 
        ? `${props.theme.colors.error}20` 
        : `${props.theme.colors.primary}20`};
    }
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing.sm};
      padding-left: calc(2.5rem + 6px);
      font-size: ${props => props.theme.typography.fontSize.sm};
    }
  }
  
  svg {
    position: absolute;
    left: calc(${props => props.theme.spacing.md} + 2px);
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.error 
      ? props.theme.colors.error 
      : props.theme.colors.text.secondary};
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      left: calc(${props => props.theme.spacing.sm} + 4px);
    }
  }
`;

const Select = styled.div`
  position: relative;
  
  select {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    padding-left: calc(${props => props.theme.spacing.xl} + 12px);
    border: 2px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.typography.fontSize.md};
    background-color: ${props => props.theme.colors.surface};
    appearance: none;
    transition: all ${props => props.theme.transition.fast};
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
    }
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      padding: ${props => props.theme.spacing.sm};
      padding-left: calc(2.5rem + 6px);
      font-size: ${props => props.theme.typography.fontSize.sm};
    }
  }
  
  svg {
    position: absolute;
    left: calc(${props => props.theme.spacing.md} + 2px);
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.secondary};
    
    @media (max-width: ${props => props.theme.breakpoints.sm}) {
      left: calc(${props => props.theme.spacing.sm} + 4px);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column-reverse;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StyledButton = styled.button`
  padding: ${props => `${props.theme.spacing.md} ${props.theme.spacing.xl}`};
  background-color: ${props => {
    if (props.variant === 'secondary') return props.theme.colors.background;
    if (props.variant === 'error') return props.theme.colors.error;
    return props.theme.colors.primary;
  }};
  color: ${props => props.variant === 'secondary' 
    ? props.theme.colors.text.primary 
    : 'white'};
  border: ${props => props.variant === 'secondary' 
    ? `2px solid ${props.theme.colors.border}` 
    : 'none'};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  box-shadow: ${props => props.variant === 'secondary' 
    ? 'none' 
    : props.theme.shadows.md};
  
  &:hover {
    background-color: ${props => {
      if (props.variant === 'secondary') return props.theme.colors.border;
      if (props.variant === 'error') return `${props.theme.colors.error}E0`;
      return props.theme.colors.primaryDark;
    }};
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'secondary' 
      ? 'none' 
      : props.theme.shadows.lg};
  }

  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
  }
`;

const AddButton = styled(StyledButton)`
  position: relative;
  margin-left: ${props => props.theme.spacing.md};
  white-space: nowrap;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    margin-left: 0;
    margin-top: ${props => props.theme.spacing.sm};
    width: 100%;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 10vh;
  z-index: 1000;
  backdrop-filter: blur(8px);
  padding-left: ${props => props.theme.spacing.lg};
  padding-right: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding-left: ${props => props.theme.spacing.md};
    padding-right: ${props => props.theme.spacing.md};
    padding-bottom: ${props => props.theme.spacing.md};
    padding-top: 8vh;
    overflow-y: auto;
  }
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  padding-top: calc(${props => props.theme.spacing.xl} + 0.5rem);
  width: 90%;
  max-width: 450px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  border: 1px solid ${props => `${props.theme.colors.primary}15`};
  margin-top: 0;
  margin-bottom: 2rem;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
    border-radius: ${props => props.theme.borderRadius.md};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.primary}30;
    border-radius: ${props => props.theme.borderRadius.md};
  }
  
  h2 {
    margin-bottom: calc(${props => props.theme.spacing.lg} + 0.75rem);
    padding-bottom: 1rem;
    border-bottom: 1px solid ${props => props.theme.colors.border};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.text.primary};
    font-size: ${props => props.theme.typography.fontSize.xl};
    font-weight: 600;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.lg};
    padding-top: calc(${props => props.theme.spacing.lg} + 0.5rem);
    width: 95%;
    border-radius: ${props => props.theme.borderRadius.md};
    margin: 0;
    margin-bottom: 2rem;
    max-height: none;
    
    h2 {
      font-size: ${props => props.theme.typography.fontSize.lg};
      margin-bottom: calc(${props => props.theme.spacing.md} + 0.5rem);
      padding-bottom: 0.75rem;
    }
  }
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const RoleIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  background-color: ${props => {
    if (props.role === 'admin') return `${props.theme.colors.primary}15`;
    if (props.role === 'active') return `${props.theme.colors.success}15`;
    if (props.role === 'inactive') return `${props.theme.colors.error}15`;
    return `${props.theme.colors.success}15`;
  }};
  color: ${props => {
    if (props.role === 'admin') return props.theme.colors.primary;
    if (props.role === 'active') return props.theme.colors.success;
    if (props.role === 'inactive') return props.theme.colors.error;
    return props.theme.colors.success;
  }};
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.xs}`};
    font-size: ${props => props.theme.typography.fontSize.xs};
  }
`;

const NoResults = styled.div`
  padding: ${props => props.theme.spacing.xl};
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${props => props.theme.spacing.md};
  right: ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  color: ${props => props.theme.colors.text.secondary};
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing.xs};
  border-radius: 50%;
  transition: all ${props => props.theme.transition.fast};
  width: 36px;
  height: 36px;
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    transform: rotate(90deg);
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    top: ${props => props.theme.spacing.sm};
    right: ${props => props.theme.spacing.sm};
  }
`;

const MobileActions = styled.div`
  position: relative;
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: block;
  }
`;

const MobileMenu = styled(motion.div)`
  position: absolute;
  right: 0;
  top: 100%;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: ${props => props.theme.shadows.md};
  z-index: 10;
  overflow: hidden;
  min-width: 120px;
`;

const MobileMenuItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.color || props.theme.colors.text.primary};
  gap: ${props => props.theme.spacing.sm};
  text-align: left;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
`;

const SearchAndActions = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const ErrorMessage = styled.div`
  background-color: ${props => `${props.theme.colors.error}15`};
  color: ${props => props.theme.colors.error};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const AdminContainer = styled(Container)`
  width: 100% !important;
  max-width: 100% !important;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
  }
`;

const SuccessMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  background-color: ${props => `${props.theme.colors.success}15`};
  color: ${props => props.theme.colors.success};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.md};
  gap: ${props => props.theme.spacing.sm};
`;

const FieldError = styled.div`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.typography.fontSize.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.xs};
`;

const Spinner = styled.span`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Fetch profiles on component mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profiles and entries/bonus data in parallel for efficiency
        const [profilesData, entriesAndBonusData] = await Promise.all([
          getAllProfiles(),
          getAllUsersEntriesAndBonus()
        ]);
        
        // Use a Map to ensure we have no duplicates (using ID as the key)
        const userMap = new Map();
        
        // Transform profiles data to match the expected format
        profilesData.forEach(profile => {
          // Ensure we have a numeric ID - generate a timestamp if none exists
          const userId = profile.id ? Number(profile.id) : Date.now();
          
          // Get entries and bonus data for this user
          const entriesBonus = entriesAndBonusData[userId] || { entriesCount: 0, bonusAmount: '$0.00' };
          
          // Add to map with ID as key to prevent duplicates
          userMap.set(userId, {
            id: userId,
            name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown User',
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            role: profile.role || 'user',
            partsEntered: entriesBonus.entriesCount,
            bonusAmount: entriesBonus.bonusAmount
          });
        });
        
        // Convert map values to array
        const formattedUsers = Array.from(userMap.values());
        
        console.log(`Loaded ${formattedUsers.length} users with entries and bonus data`);
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (err) {
        console.error('Error fetching profiles and entries data:', err);
        setError('Failed to load user data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfiles();
  }, []);
  
  const handleSearch = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm))
    );
    
    setFilteredUsers(filtered);
  };
  
  // Update search when term changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm]);
  
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
    });
    setIsModalOpen(true);
  };
  
  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'user',
    });
    setIsModalOpen(true);
    setMobileMenuId(null);
  };
  
  const handleDeleteUser = (userId) => {
    // Find the user object for better confirmation message
    const user = users.find(u => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
    setMobileMenuId(null);
  };
  
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      console.log(`Preparing to delete user with ID: ${userToDelete.id}`);
      
      // Delete user from the database
      const result = await deleteUser(userToDelete.id);
      
      console.log('Delete operation result:', result);
      
      // Update the local state by removing the deleted user
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      setUsers(updatedUsers);
      
      // Also update filtered users
      setFilteredUsers(prevFiltered => prevFiltered.filter(user => user.id !== userToDelete.id));
      
      // Show success message
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close modal
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Failed to delete user. Please try again.');
      
      // Keep modal open so user can see the error
      setIsLoading(false);
    } finally {
      if (!error) {
        setIsLoading(false);
      }
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };
  
  // Validate form data
  const validateForm = () => {
    const errors = {};
    
    // Convert all values to strings to safely use trim()
    const firstName = String(formData.firstName || '');
    const lastName = String(formData.lastName || '');
    const email = String(formData.email || '');
    const phone = String(formData.phone || '');
    const password = String(formData.password || '');
    
    if (!firstName.trim()) {
      errors.firstName = "First name is required";
    } else if (firstName.trim().length < 2) {
      errors.firstName = "First name should be at least 2 characters";
    }
    
    if (!lastName.trim()) {
      errors.lastName = "Last name is required";
    } else if (lastName.trim().length < 2) {
      errors.lastName = "Last name should be at least 2 characters";
    }
    
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }
    
    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(phone)) {
      errors.phone = "Phone number is invalid. Include country code (e.g., +1)";
    }
    
    if (!currentUser && !password.trim()) {
      errors.password = "Password is required for new users";
    } else if (!currentUser && password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear the error for this field when edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      if (currentUser) {
        // Update existing user
        await updateUser(currentUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
        
        // Update the user list with the updated user
        const updatedUsers = users.map(user => {
          if (user.id === currentUser.id) {
            return {
              ...user,
              firstName: formData.firstName,
              lastName: formData.lastName,
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              role: formData.role
            };
          }
          return user;
        });
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        setSuccessMessage("User updated successfully!");
      } else {
        // Create new user with the createNewUser function - now directly adding to profiles table
        const result = await createNewUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role
        });
        
        if (result && result.profile) {
          // Create a proper user object from the result
          const newUser = {
            id: result.profile.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            role: formData.role,
            partsEntered: 0, // New users have 0 parts entered
            bonusAmount: '$0' // $0 bonus for new users
          };
          
          // Check if user with this ID already exists, if so, update it instead
          const existingUserIndex = users.findIndex(user => user.id === newUser.id);
          
          let updatedUsers;
          if (existingUserIndex >= 0) {
            // Update existing user
            updatedUsers = [...users];
            updatedUsers[existingUserIndex] = newUser;
          } else {
            // Add new user
            updatedUsers = [...users, newUser];
          }
          
          setUsers(updatedUsers);
          
          // Update filtered users only if they match search criteria
          const matchesSearch = !searchTerm || 
            newUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            newUser.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (newUser.phone && newUser.phone.includes(searchTerm));
            
          if (matchesSearch) {
            const updatedFilteredUsers = existingUserIndex >= 0
              ? filteredUsers.map(user => user.id === newUser.id ? newUser : user)
              : [...filteredUsers, newUser];
            
            setFilteredUsers(updatedFilteredUsers);
          }
          
          setSuccessMessage("User created successfully!");
        }
      }
      
      // Close the modal after a delay to show success message
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1500);
      
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Failed to save user data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const toggleMobileMenu = (userId) => {
    setMobileMenuId(mobileMenuId === userId ? null : userId);
  };
  
  // Define columns for DataTable
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { 
      key: 'role', 
      title: 'Role',
      render: (value) => (
        <RoleIndicator role={value}>
          {value === 'admin' ? 'Admin' : 'User'}
        </RoleIndicator>
      )
    },
    { key: 'partsEntered', title: 'Entries' },
    { key: 'bonusAmount', title: 'Bonus' },
    { 
      key: 'actions', 
      title: 'Actions', 
      type: 'actions',
      actions: [
        { 
          icon: <FiEdit2 size={16} />, 
          label: 'Edit',
          onClick: (row) => handleEditUser(row) 
        },
        { 
          icon: <FiTrash2 size={16} />, 
          label: 'Delete',
          onClick: (row) => handleDeleteUser(row.id) 
        }
      ]
    }
  ];
  
  // Add extra check to ensure filtered users are always a subset of users
  useEffect(() => {
    // Get set of valid user IDs
    const validUserIds = new Set(users.map(user => user.id));
    
    // Check if we need to clean up filteredUsers
    const hasInvalidUsers = filteredUsers.some(user => !validUserIds.has(user.id));
    
    if (hasInvalidUsers) {
      console.log('Cleaning up filtered users list to remove invalid entries');
      setFilteredUsers(prevFiltered => prevFiltered.filter(user => validUserIds.has(user.id)));
    }
  }, [users, filteredUsers]);
  
  return (
    <PageContainer
      contentWidth="fluid"
      backgroundGradient="blend"
      spacing="0"
      padding="0"
      noAnimation={true}
    >
      <AdminContainer padding="0" margin="0" fullWidth fluid>
        {error && (
          <ErrorMessage>
            <FiX size={18} />
            {error}
          </ErrorMessage>
        )}
        
        {successMessage && !isModalOpen && (
          <SuccessMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCheckCircle size={18} />
            {successMessage}
          </SuccessMessage>
        )}
        
        <DataTable
          title="User Management"
          icon={<FiUserCheck size={20} />}
          data={filteredUsers}
          columns={columns}
          sortable={true}
          pagination={true}
          pageSize={10}
          variant="elevated"
          compact
          isLoading={isLoading}
          searchTerm={searchTerm}
          onSearchChange={(value) => setSearchTerm(value)}
          actions={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiUserPlus size={16} />}
              onClick={handleAddUser}
            >
              Add User
            </Button>
          }
          emptyMessage={isLoading ? "Loading users..." : "No users found"}
        />
      </AdminContainer>
      
      {isModalOpen && (
        <Modal>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2>
              {currentUser ? (
                <>
                  <FiEdit2 size={22} />
                  Edit User
                </>
              ) : (
                <>
                  <FiUserPlus size={22} />
                  Add New User
                </>
              )}
            </h2>
            
            <CloseButton onClick={() => setIsModalOpen(false)}>
              <FiX size={22} />
            </CloseButton>
            
            {successMessage && (
              <SuccessMessage
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FiCheckCircle size={18} />
                {successMessage}
              </SuccessMessage>
            )}
            
            <form onSubmit={handleSubmitForm}>
              <FormGroup>
                <Label htmlFor="firstName">First Name</Label>
                <Input error={formErrors.firstName}>
                  <FiUser size={18} />
                  <input 
                    type="text" 
                    id="firstName" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleInputChange}
                    placeholder="First name"
                    disabled={isSubmitting}
                  />
                </Input>
                {formErrors.firstName && (
                  <FieldError>
                    <FiAlertCircle size={14} />
                    {formErrors.firstName}
                  </FieldError>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="lastName">Last Name</Label>
                <Input error={formErrors.lastName}>
                  <FiUser size={18} />
                  <input 
                    type="text" 
                    id="lastName" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleInputChange}
                    placeholder="Last name"
                    disabled={isSubmitting}
                  />
                </Input>
                {formErrors.lastName && (
                  <FieldError>
                    <FiAlertCircle size={14} />
                    {formErrors.lastName}
                  </FieldError>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input error={formErrors.email}>
                  <FiMail size={18} />
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    placeholder="Email address"
                    disabled={isSubmitting}
                  />
                </Input>
                {formErrors.email && (
                  <FieldError>
                    <FiAlertCircle size={14} />
                    {formErrors.email}
                  </FieldError>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input error={formErrors.phone}>
                  <FiPhone size={18} />
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    placeholder="998xxxxxxx"
                    disabled={isSubmitting}
                  />
                </Input>
                {formErrors.phone && (
                  <FieldError>
                    <FiAlertCircle size={14} />
                    {formErrors.phone}
                  </FieldError>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">
                  {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input error={formErrors.password}>
                  <FiLock size={18} />
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange}
                    required={!currentUser}
                    placeholder={currentUser ? "Leave blank to keep current" : "Password"}
                    disabled={isSubmitting}
                  />
                </Input>
                {formErrors.password && (
                  <FieldError>
                    <FiAlertCircle size={14} />
                    {formErrors.password}
                  </FieldError>
                )}
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="role">Role</Label>
                <Select>
                  <FiUserCheck size={18} />
                  <select 
                    id="role" 
                    name="role" 
                    value={formData.role} 
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </Select>
              </FormGroup>
              
              <ButtonGroup>
                <StyledButton 
                  type="button" 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  <FiX size={18} />
                  Cancel
                </StyledButton>
                <StyledButton 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : currentUser ? (
                    <>
                      <FiEdit2 size={18} />
                      Update User
                    </>
                  ) : (
                    <>
                      <FiUserPlus size={18} />
                      Add User
                    </>
                  )}
                </StyledButton>
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteModal && userToDelete && (
        <Modal>
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ 
              maxWidth: '450px',
              padding: '28px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '24px',
              color: 'var(--color-error)',
              gap: '14px' 
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-error)10'
              }}>
                <FiTrash2 size={20} />
              </div>
              <h2 style={{ margin: 0, fontWeight: 600, fontSize: '20px' }}>Delete User</h2>
            </div>
            
            <CloseButton onClick={cancelDelete} style={{ top: '24px', right: '24px' }}>
              <FiX size={20} />
            </CloseButton>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ 
                fontSize: '16px', 
                margin: '0 0 20px 0',
                fontWeight: 400,
                color: 'var(--color-text-primary)',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '16px',
                backgroundColor: 'var(--color-background)',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary)10',
                  marginRight: '16px'
                }}>
                  <FiUser size={18} style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>{userToDelete.name}</div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{userToDelete.email}</div>
                </div>
              </div>
              
              <div style={{ 
                margin: '0',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                display: 'flex',
                padding: '12px',
                backgroundColor: 'var(--color-error)05',
                borderRadius: '8px',
                border: '1px solid var(--color-error)20',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <FiAlertCircle size={18} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: 'var(--color-error)' }}>Warning</p>
                  <p style={{ margin: '0', lineHeight: '1.5' }}>All user data including entered parts and bonus history will be permanently deleted.</p>
                </div>
              </div>
            </div>
            
            <ButtonGroup style={{ 
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '16px'
            }}>
              <StyledButton 
                type="button" 
                variant="secondary" 
                onClick={cancelDelete}
                disabled={isLoading}
                style={{ 
                  minWidth: '100px',
                  height: '44px',
                  fontSize: '15px'
                }}
              >
                Cancel
              </StyledButton>

              <StyledButton
                type="button"
                variant="error"
                onClick={confirmDelete}
                disabled={isLoading}
                style={{ 
                  minWidth: '100px',
                  height: '44px',
                  fontSize: '15px'
                }}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    Delete User
                  </>
                )}
              </StyledButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default UserManagement; 