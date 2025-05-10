import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiClipboard } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthContext from '../../contexts/AuthContext';
import { enterPart, getUserParts } from '../../utils/api';

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const InputContainer = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const InputGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: ${props => `${props.theme.spacing.md} ${props.theme.spacing.lg}`};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  transition: background-color ${props => props.theme.transition.fast};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.theme.colors.secondary};
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Message = styled.div`
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  ${props => props.type === 'success' && `
    background-color: #e8f5e9;
    color: #2e7d32;
  `}
  
  ${props => props.type === 'error' && `
    background-color: #ffebee;
    color: #c62828;
  `}
`;

const RecentEntriesContainer = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
`;

const RecentEntryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background};
  
  th {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.background};
  }
  
  td {
    padding: ${props => props.theme.spacing.md};
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const NoEntriesMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const PartsEntry = () => {
  const { currentUser } = useContext(AuthContext);
  const [partId, setPartId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  
  // Helper function to format part ID
  const formatPartId = (input) => {
    // Keep spaces but normalize them (e.g., multiple spaces to single space)
    return input.replace(/\s+/g, ' ');
  };
  
  // Fetch recent entries
  useEffect(() => {
    const fetchRecentEntries = async () => {
      if (!currentUser || !currentUser.id) return;
      
      setLoadingEntries(true);
      try {
        const userParts = await getUserParts(currentUser.id);
        
        const formattedEntries = userParts.slice(0, 5).map(entry => {
          const date = new Date(entry.created_at);
          
          // Get the part's serial number
          let serialNumber = 'Unknown';
          if (entry.parts) {
            if (typeof entry.parts === 'object') {
              serialNumber = entry.parts.serial_number || 
                           entry.parts.serialNumber || 
                           entry.parts.serialnumber || 
                           entry.part_id || 
                           'Unknown';
            }
          }
          
          return {
            id: entry.id,
            serialNumber,
            partName: entry.parts?.name || 'Unknown Part',
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
          };
        });
        
        setRecentEntries(formattedEntries);
      } catch (error) {
        console.error('Error fetching recent entries:', error);
      } finally {
        setLoadingEntries(false);
      }
    };
    
    fetchRecentEntries();
  }, [currentUser]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check for empty input after trimming
    const trimmedId = partId.trim();
    if (!trimmedId) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid part ID. Empty values are not allowed.'
      });
      return;
    }
    
    // Format the input before submitting
    const formattedId = formatPartId(trimmedId);
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Use formatted ID for submission
      const result = await enterPart(currentUser.id, formattedId);
      
      // Success - update the recent entries
      const userParts = await getUserParts(currentUser.id);
      
      const formattedEntries = userParts.slice(0, 5).map(entry => {
        const date = new Date(entry.created_at);
        
        // Get the part's serial number with improved error handling
        let serialNumber = 'Unknown';
        if (entry.parts) {
          if (typeof entry.parts === 'object') {
            serialNumber = entry.parts.serial_number || 
                         entry.parts.serialNumber || 
                         entry.parts.serialnumber || 
                         entry.part_id || 
                         'Unknown';
          }
        }
        
        return {
          id: entry.id,
          serialNumber,
          partName: entry.parts?.name || 'Unknown Part',
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString()
        };
      });
      
      setRecentEntries(formattedEntries);
      
      // Clear the input and show success message
      setPartId('');
      setMessage({
        type: 'success',
        text: 'Part successfully entered! You earned a $1.00 bonus.'
      });
    } catch (error) {
      console.error('Error entering part:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to enter part. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <h2>Enter Part</h2>
      
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <InfoText>
          Enter a valid part ID to earn a $1.00 bonus. Each part can only be entered once.
          <br />
          <small>Spaces in part numbers are allowed (e.g., "2 000 005 021 404").</small>
        </InfoText>
        
        <form onSubmit={handleSubmit}>
          <InputContainer>
            <FormLabel htmlFor="partId">Serial Number</FormLabel>
            <InputGroup>
              <Input
                id="partId"
                type="text"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                placeholder="Enter part serial number (e.g. 2 000 005 021 404)"
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !partId.trim()}>
                {loading ? 'Submitting...' : 'Submit'}
                {!loading && <FiArrowRight />}
              </Button>
            </InputGroup>
          </InputContainer>
        </form>
        
        {message && (
          <Message type={message.type}>
            {message.type === 'success' ? <FiCheckCircle size={20} /> : <FiAlertCircle size={20} />}
            {message.text}
          </Message>
        )}
      </Card>
      
      <RecentEntriesContainer>
        <SectionTitle>Recent Entries</SectionTitle>
        
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {loadingEntries ? (
            <LoadingMessage>Loading recent entries...</LoadingMessage>
          ) : recentEntries.length > 0 ? (
            <RecentEntryTable>
              <TableHead>
                <tr>
                  <th>Serial Number</th>
                  <th>Part Name</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </TableHead>
              <TableBody>
                {recentEntries.map(entry => (
                  <tr key={entry.id}>
                    <td>{entry.serialNumber}</td>
                    <td>{entry.partName}</td>
                    <td>{entry.date}</td>
                    <td>{entry.time}</td>
                  </tr>
                ))}
              </TableBody>
            </RecentEntryTable>
          ) : (
            <NoEntriesMessage>
              You haven't entered any parts yet. Enter your first part above!
            </NoEntriesMessage>
          )}
        </Card>
      </RecentEntriesContainer>
    </Layout>
  );
};

export default PartsEntry; 