import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUserPlus, FiRefreshCw, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { seedTestUsers, listAllUsers } from '../../utils/userManagement';
import { motion } from 'framer-motion';

const Container = styled.div`
  padding: ${props => props.theme.spacing.xl};
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  box-shadow: ${props => props.theme.shadows.lg};
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
  flex-wrap: wrap;
`;

const Button = styled(motion.button)`
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    background: ${props => props.theme.colors.primaryDark};
  }
  
  &:disabled {
    background: ${props => props.theme.colors.border};
    cursor: not-allowed;
  }
`;

const Message = styled(motion.div)`
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  background-color: ${props => props.isError 
    ? `${props.theme.colors.error}15`
    : `${props.theme.colors.success}15`
  };
  
  color: ${props => props.isError 
    ? props.theme.colors.error
    : props.theme.colors.success
  };
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${props => props.theme.spacing.lg};
  
  th, td {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
  
  th {
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    color: ${props => props.theme.colors.text.secondary};
    background-color: ${props => `${props.theme.colors.background}50`};
  }
  
  tr:hover td {
    background-color: ${props => `${props.theme.colors.background}50`};
  }
`;

const UserRole = styled.span`
  display: inline-block;
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  border-radius: ${props => props.theme.borderRadius.pill};
  font-size: ${props => props.theme.typography.fontSize.xs};
  text-transform: uppercase;
  
  background-color: ${props => props.isAdmin 
    ? `${props.theme.colors.primary}20` 
    : `${props.theme.colors.secondary}20`
  };
  
  color: ${props => props.isAdmin 
    ? props.theme.colors.primary 
    : props.theme.colors.secondary
  };
`;

const AuthTestPanel = () => {
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await listAllUsers();
      setUsers(data || []);
    } catch (error) {
      setMessage(error.message || 'Error fetching users');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSeedUsers = async () => {
    try {
      setIsLoading(true);
      const result = await seedTestUsers();
      
      if (result.success) {
        setMessage(result.message || 'Test users created successfully');
        setIsError(false);
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(result.error?.message || 'Failed to create test users');
      }
    } catch (error) {
      setMessage(error.message);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Container>
      <Title>
        <FiUsers size={24} /> Authentication Test Panel
      </Title>
      
      {message && (
        <Message 
          isError={isError}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {isError ? <FiXCircle /> : <FiCheckCircle />} {message}
        </Message>
      )}
      
      <ButtonGroup>
        <Button 
          onClick={handleSeedUsers} 
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiUserPlus /> Seed Test Users
        </Button>
        
        <Button 
          onClick={fetchUsers} 
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiRefreshCw /> Refresh User List
        </Button>
      </ButtonGroup>
      
      <Title>
        <FiUsers size={20} /> User List ({users.length})
      </Title>
      
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Role</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>
                <UserRole isAdmin={user.role === 'admin'}>
                  {user.role}
                </UserRole>
              </td>
              <td>{user.enteredParts || 0}</td>
            </tr>
          ))}
          
          {users.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                No users found. Click "Seed Test Users" to create some test accounts.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default AuthTestPanel; 