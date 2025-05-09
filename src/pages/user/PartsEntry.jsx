import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.xs};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  transition: border-color ${props => props.theme.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled(motion.button)`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: background-color ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const Message = styled(motion.div)`
  padding: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  
  ${props => props.type === 'success' && `
    background-color: ${props.theme.colors.success}10;
    color: ${props.theme.colors.success};
  `}
  
  ${props => props.type === 'error' && `
    background-color: ${props.theme.colors.error}10;
    color: ${props.theme.colors.error};
  `}
`;

const RecentEntries = styled.div`
  margin-top: ${props => props.theme.spacing.xl};
  border-top: 1px solid ${props => props.theme.colors.border};
  padding-top: ${props => props.theme.spacing.lg};
`;

const EntryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const EntryId = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const EntryStatus = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  ${props => props.status === 'Valid' && `
    background-color: #e8f5e9;
    color: #2e7d32;
  `}
  
  ${props => props.status === 'Invalid' && `
    background-color: #ffebee;
    color: #c62828;
  `}
  
  ${props => props.status === 'Duplicate' && `
    background-color: #fff8e1;
    color: #f57f17;
  `}
`;

const Instructions = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
  
  ul {
    list-style-type: disc;
    padding-left: ${props => props.theme.spacing.lg};
    margin-top: ${props => props.theme.spacing.md};
  }
  
  li {
    margin-bottom: ${props => props.theme.spacing.xs};
  }
`;

const BonusHighlight = styled.div`
  background-color: ${props => `${props.theme.colors.primary}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.lg};
  text-align: center;
  
  span {
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.primary};
  }
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Mock valid part IDs for demonstration
const validPartIds = ['ABC123', 'DEF456', 'XYZ789', 'PQR321', 'LMN654'];

const PartsEntry = () => {
  const [partId, setPartId] = useState('');
  const [message, setMessage] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  
  const validatePartId = (id) => {
    // Check if part ID is valid (in our mock list)
    if (validPartIds.includes(id)) {
      // Check if it's a duplicate entry
      const isDuplicate = recentEntries.some(entry => entry.id === id);
      
      if (isDuplicate) {
        return 'Duplicate';
      }
      return 'Valid';
    }
    
    return 'Invalid';
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!partId.trim()) {
      setMessage({
        type: 'error',
        text: 'Please enter a part ID.'
      });
      return;
    }
    
    const status = validatePartId(partId);
    const newEntry = {
      id: partId,
      timestamp: new Date().toISOString(),
      status,
    };
    
    setRecentEntries(prev => [newEntry, ...prev]);
    
    if (status === 'Valid') {
      setMessage({
        type: 'success',
        text: `Part ID ${partId} accepted! $1 bonus added to your account.`
      });
    } else if (status === 'Duplicate') {
      setMessage({
        type: 'error',
        text: `Part ID ${partId} has already been submitted.`
      });
    } else {
      setMessage({
        type: 'error',
        text: `Part ID ${partId} is not valid.`
      });
    }
    
    setPartId('');
  };
  
  return (
    <Layout title="Enter Parts">
      <Section>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3>Enter Spare Part ID</h3>
          
          <BonusHighlight>
            Earn <span>$1 bonus</span> for each valid part ID entered!
          </BonusHighlight>
          
          <Instructions>
            <div>Instructions:</div>
            <ul>
              <li>Enter the spare part ID exactly as it appears on the part.</li>
              <li>Each valid part ID submitted earns a $1 bonus.</li>
              <li>Duplicate entries will not be accepted.</li>
              <li>Bonuses are calculated quarterly.</li>
            </ul>
          </Instructions>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="partId">Part ID</Label>
              <Input
                type="text"
                id="partId"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                placeholder="e.g., ABC123"
                autoComplete="off"
              />
            </FormGroup>
            
            <Button 
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Part ID
            </Button>
          </Form>
          
          {message && (
            <Message
              type={message.type}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {message.text}
            </Message>
          )}
          
          {recentEntries.length > 0 && (
            <RecentEntries>
              <h4>Recent Entries</h4>
              {recentEntries.slice(0, 5).map((entry, index) => (
                <EntryItem key={index}>
                  <EntryId>{entry.id}</EntryId>
                  <EntryStatus status={entry.status}>
                    {entry.status}
                  </EntryStatus>
                </EntryItem>
              ))}
            </RecentEntries>
          )}
        </Card>
      </Section>
      
      <Section>
        <Card>
          <h3>Tips for Finding Part IDs</h3>
          <p>
            Part IDs are typically located on the spare part packaging or printed directly on the part.
            Look for a alphanumeric code typically 6 characters long. If you're having trouble finding
            the part ID, contact your supervisor for assistance.
          </p>
        </Card>
      </Section>
    </Layout>
  );
};

export default PartsEntry; 