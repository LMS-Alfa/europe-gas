import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiSearch, FiEdit2, FiTrash2, FiUserPlus, FiUser, FiMail, FiLock, FiUserCheck, FiX, FiMoreVertical, FiPhone } from 'react-icons/fi';
import PageContainer from '../../components/PageContainer';
import { Container } from '../../components/Container';
import DataTable from '../../components/DataTable';
import { Button } from '../../components/Button';

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
  margin-bottom: ${props => props.theme.spacing.md};
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const Input = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    padding-left: ${props => props.theme.spacing.xl};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: ${props => props.theme.typography.fontSize.md};
    background-color: ${props => props.theme.colors.surface};
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

const Select = styled.div`
  position: relative;
  
  select {
    width: 100%;
    padding: ${props => props.theme.spacing.md};
    padding-left: ${props => props.theme.spacing.xl};
    border: 1px solid ${props => props.theme.colors.border};
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

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column-reverse;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const StyledButton = styled.button`
  padding: ${props => `${props.theme.spacing.sm} ${props.theme.spacing.lg}`};
  background-color: ${props => props.variant === 'secondary' ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.variant === 'secondary' ? props.theme.colors.text.primary : 'white'};
  border: ${props => props.variant === 'secondary' ? `1px solid ${props.theme.colors.border}` : 'none'};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  box-shadow: ${props => props.variant === 'secondary' ? 'none' : props.theme.shadows.sm};
  
  &:hover {
    background-color: ${props => props.variant === 'secondary' ? 
      props.theme.colors.background : props.theme.colors.secondary};
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'secondary' ? 'none' : props.theme.shadows.md};
  }

  &:active {
    transform: translateY(0);
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  backdrop-filter: blur(3px);
  padding: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm};
  }
`;

const ModalContent = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.lg};
  position: relative;
  
  h2 {
    margin-bottom: ${props => props.theme.spacing.lg};
    display: flex;
    align-items: center;
    gap: ${props => props.theme.spacing.sm};
    color: ${props => props.theme.colors.text.primary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.lg};
    width: 100%;
    border-radius: ${props => props.theme.borderRadius.sm};
    
    h2 {
      font-size: ${props => props.theme.typography.fontSize.lg};
      margin-bottom: ${props => props.theme.spacing.md};
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
  background-color: ${props => props.role === 'admin' ? 
    `${props.theme.colors.primary}15` : `${props.theme.colors.success}15`};
  color: ${props => props.role === 'admin' ? 
    props.theme.colors.primary : props.theme.colors.success};
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
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
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
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

// Mock data for demonstration
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@europegas.com', phone: '+1 (555) 123-4567', role: 'user', partsEntered: 25, bonusAmount: '$25' },
  { id: 2, name: 'Jane Smith', email: 'jane@europegas.com', phone: '+1 (555) 987-6543', role: 'user', partsEntered: 42, bonusAmount: '$42' },
  { id: 3, name: 'Admin User', email: 'admin@europegas.com', phone: '+1 (555) 246-8901', role: 'admin', partsEntered: 0, bonusAmount: '$0' },
  { id: 4, name: 'Mike Johnson', email: 'mike@europegas.com', phone: '+1 (555) 135-7924', role: 'user', partsEntered: 15, bonusAmount: '$15' },
  { id: 5, name: 'Sarah Williams', email: 'sarah@europegas.com', phone: '+1 (555) 369-2580', role: 'user', partsEntered: 31, bonusAmount: '$31' },
];

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

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mobileMenuId, setMobileMenuId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
  });
  const [filteredUsers, setFilteredUsers] = useState(users);
  
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
  
  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: '',
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
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
    });
    setIsModalOpen(true);
    setMobileMenuId(null);
  };
  
  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
    }
    setMobileMenuId(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmitForm = (e) => {
    e.preventDefault();
    
    if (currentUser) {
      // Edit existing user
      const updatedUsers = users.map(user => {
        if (user.id === currentUser.id) {
          return {
            ...user,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            role: formData.role
          };
        }
        return user;
      });
      setUsers(updatedUsers);
    } else {
      // Add new user
      const newUser = {
        id: users.length + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        partsEntered: 0,
        bonusAmount: '$0'
      };
      setUsers([...users, newUser]);
    }
    
    setIsModalOpen(false);
  };
  
  const toggleMobileMenu = (userId) => {
    setMobileMenuId(mobileMenuId === userId ? null : userId);
  };
  
  // Define columns for DataTable
  const columns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { key: 'role', title: 'Role', render: (value) => (
      <RoleIndicator role={value}>
        {value === 'admin' ? 'Admin' : 'User'}
      </RoleIndicator>
    )},
    { key: 'partsEntered', title: 'Parts Entered' },
    { key: 'bonusAmount', title: 'Bonus Amount' },
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
  
  return (
    <PageContainer
      contentWidth="fluid"
      backgroundGradient="blend"
      spacing="0"
      padding="0"
      noAnimation={true}
    >
      <AdminContainer padding="0" margin="0" fullWidth fluid>
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
          actions={
            <Button
              variant="primary"
              size="sm"
              leftIcon={<FiUserPlus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Add User
            </Button>
          }
          emptyMessage="No users found"
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
            
            <form onSubmit={handleSubmitForm}>
              <FormGroup>
                <Label htmlFor="name">Name</Label>
                <Input>
                  <FiUser size={18} />
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    required
                    placeholder="Full name"
                  />
                </Input>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="email">Email</Label>
                <Input>
                  <FiMail size={18} />
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange}
                    required
                    placeholder="Email address"
                  />
                </Input>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="phone">Phone Number</Label>
                <Input>
                  <FiPhone size={18} />
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange}
                    required
                    placeholder="Phone number"
                  />
                </Input>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="password">
                  {currentUser ? 'Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input>
                  <FiLock size={18} />
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange}
                    required={!currentUser}
                    placeholder={currentUser ? "Leave blank to keep current" : "Password"}
                  />
                </Input>
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
                >
                  <FiX size={18} />
                  Cancel
                </StyledButton>
                <StyledButton type="submit">
                  {currentUser ? (
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
    </PageContainer>
  );
};

export default UserManagement; 