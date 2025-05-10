import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiPackage, FiDollarSign, FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthContext from '../../contexts/AuthContext';
import { getUserParts, getUserBonus, enterPart } from '../../utils/api';

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${props => `${props.theme.colors.primary}20`};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  font-size: 24px;
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const QuickEntryForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const FormTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.lg};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const FormGroup = styled.div`
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
  
  ${props => props.type === 'success' && `
    background-color: #e8f5e9;
    color: #2e7d32;
  `}
  
  ${props => props.type === 'error' && `
    background-color: #ffebee;
    color: #c62828;
  `}
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

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  color: ${props => props.theme.colors.primary};
  font-size: ${props => props.theme.typography.fontSize.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-left: auto;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalParts: 0,
    totalBonus: '$0.00',
    lastEntry: 'Never',
    quarterlyBonus: '$0.00'
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partId, setPartId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Helper function to clean part ID (remove all spaces)
  const cleanPartId = (input) => {
    return input.toString().replace(/\s+/g, '');
  };
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.id) return;
      
      setLoading(true);
      try {
        // Fetch user's parts
        const userParts = await getUserParts(currentUser.id);
        
        // Get total bonus
        const bonusData = await getUserBonus(currentUser.id);
        
        // Format the last entry date
        let lastEntry = 'Never';
        if (userParts.length > 0) {
          const lastEntryDate = new Date(userParts[0].created_at);
          lastEntry = lastEntryDate.toLocaleDateString();
        }
        
        // Calculate quarterly bonus (for current quarter)
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        const currentYear = now.getFullYear();
        
        const currentQuarterParts = userParts.filter(part => {
          const date = new Date(part.created_at);
          const partQuarter = Math.floor(date.getMonth() / 3) + 1;
          const partYear = date.getFullYear();
          
          return partQuarter === currentQuarter && partYear === currentYear;
        });
        
        const quarterlyBonus = currentQuarterParts.length;
        
        // Set stats
        setStats({
          totalParts: userParts.length,
          totalBonus: bonusData?.totalBonus ? `$${bonusData.totalBonus.toFixed(2)}` : '$0.00',
          lastEntry,
          quarterlyBonus: `$${quarterlyBonus.toFixed(2)}`
        });
        
        // Format recent entries
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
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);
  
  const handleQuickEntry = async (e) => {
    e.preventDefault();
    
    // Clean the part ID (remove all spaces) before checking and submitting
    const cleanedId = cleanPartId(partId);
    
    // Check for empty input after cleaning
    if (!cleanedId) {
      setMessage({
        type: 'error',
        text: 'Please enter a valid part ID. Empty values or spaces are not allowed.'
      });
      return;
    }
    
    setSubmitting(true);
    setMessage(null);
    
    try {
      // Use the cleaned partId
      const result = await enterPart(currentUser.id, cleanedId);
      
      // Refresh data
      const userParts = await getUserParts(currentUser.id);
      const bonusData = await getUserBonus(currentUser.id);
      
      // Update last entry date
      let lastEntry = 'Never';
      if (userParts.length > 0) {
        const lastEntryDate = new Date(userParts[0].created_at);
        lastEntry = lastEntryDate.toLocaleDateString();
      }
      
      // Calculate quarterly bonus
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
      const currentYear = now.getFullYear();
      
      const currentQuarterParts = userParts.filter(part => {
        const date = new Date(part.created_at);
        const partQuarter = Math.floor(date.getMonth() / 3) + 1;
        const partYear = date.getFullYear();
        
        return partQuarter === currentQuarter && partYear === currentYear;
      });
      
      const quarterlyBonus = currentQuarterParts.length;
      
      // Update stats
      setStats({
        totalParts: userParts.length,
        totalBonus: bonusData?.totalBonus ? `$${bonusData.totalBonus.toFixed(2)}` : '$0.00',
        lastEntry,
        quarterlyBonus: `$${quarterlyBonus.toFixed(2)}`
      });
      
      // Update recent entries
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
      
      // Clear input and show success message
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
      setSubmitting(false);
    }
  };
  
  const navigateToHistory = () => {
    window.location.href = '/user/history';
  };
  
  return (
    <Layout>
      <h2>Dashboard</h2>
      
      {loading ? (
        <Card>
          <NoDataMessage>Loading your dashboard data...</NoDataMessage>
        </Card>
      ) : (
        <>
          <StatsGrid>
            <StatCard>
              <StatIcon>
                <FiPackage />
              </StatIcon>
              <StatValue>{stats.totalParts}</StatValue>
              <StatLabel>Total Parts Entered</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiDollarSign />
              </StatIcon>
              <StatValue>{stats.totalBonus}</StatValue>
              <StatLabel>Total Bonus Earned</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiCalendar />
              </StatIcon>
              <StatValue>{stats.quarterlyBonus}</StatValue>
              <StatLabel>This Quarter</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatIcon>
                <FiClock />
              </StatIcon>
              <StatValue>{stats.lastEntry}</StatValue>
              <StatLabel>Last Entry</StatLabel>
            </StatCard>
          </StatsGrid>
          
          <Section>
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FormTitle>Quick Part Entry</FormTitle>
              <QuickEntryForm onSubmit={handleQuickEntry}>
                <FormGroup>
                  <Input
                    type="text"
                    value={partId}
                    onChange={(e) => setPartId(e.target.value)}
                    placeholder="Enter part serial number (e.g. 2000005021404)"
                    disabled={submitting}
                  />
                  <Button type="submit" disabled={submitting || !cleanPartId(partId)}>
                    {submitting ? 'Submitting...' : 'Submit'}
                    {!submitting && <FiArrowRight />}
                  </Button>
                </FormGroup>
              </QuickEntryForm>
              
              <small style={{ display: 'block', marginTop: '8px', color: '#666' }}>
                Spaces in part numbers are allowed for readability but will be removed when processing.
              </small>
              
              {message && (
                <Message type={message.type}>
                  {message.text}
                </Message>
              )}
            </Card>
          </Section>
          
          <Section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <SectionTitle>Recent Entries</SectionTitle>
              <ViewAllLink onClick={navigateToHistory}>
                View All <FiArrowRight style={{ marginLeft: '4px' }} />
              </ViewAllLink>
            </div>
            
            <Card
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {recentEntries.length > 0 ? (
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
                <NoDataMessage>
                  You haven't entered any parts yet. Use the form above to enter your first part.
                </NoDataMessage>
              )}
            </Card>
          </Section>
        </>
      )}
    </Layout>
  );
};

export default Dashboard; 