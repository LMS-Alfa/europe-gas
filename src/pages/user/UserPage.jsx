import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing.lg};
  }
`;

const StatsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transition.medium};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  }
  
  h2 {
    font-size: ${props => props.theme.typography.fontSize.lg};
    margin-bottom: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const CardContent = styled.div`
  padding-left: ${props => props.theme.spacing.md};
`;

const Statistic = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-right: ${props => props.theme.spacing.sm};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: ${props => `${props.theme.colors.primary}20`};
  border-radius: ${props => props.theme.borderRadius.circular};
  margin-top: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled(motion.div)`
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: ${props => props.theme.borderRadius.circular};
`;

const CardDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const WelcomeMessage = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.primary};
  
  span {
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
  }
`;

const EntrySection = styled.section`
  margin-top: ${props => props.theme.spacing.xl};
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
    box-shadow: 0 0 0 3px ${props => `${props.theme.colors.primary}20`};
  }
`;

const Button = styled(motion.button)`
  padding: ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
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

const HistorySection = styled.section`
  margin-top: ${props => props.theme.spacing.xl};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ActivityItem = styled(motion.div)`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ActivityTitle = styled.div`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const ActivityTime = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
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
  
  span {
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.primary};
  }
`;

// Mock data for demonstration
const mockData = {
  totalPartsEntered: 42,
  partsEnteredThisQuarter: 15,
  earnedBonus: '$42',
  quarterlyTarget: 50,
  recentActivity: [
    { id: 1, partId: 'ABC123', time: '10 minutes ago', status: 'Valid' },
    { id: 2, partId: 'XYZ789', time: '1 hour ago', status: 'Valid' },
    { id: 3, partId: 'DEF456', time: '2 hours ago', status: 'Invalid' },
    { id: 4, partId: 'GHI789', time: '1 day ago', status: 'Valid' },
  ]
};

// Valid part IDs for demonstration
const validPartIds = ['ABC123', 'DEF456', 'XYZ789', 'PQR321', 'LMN654'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const listItemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: i => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3
    }
  })
};

const UserPage = () => {
  const { currentUser } = useAuth();
  const [partId, setPartId] = useState('');
  const [message, setMessage] = useState(null);
  const [recentEntries, setRecentEntries] = useState(mockData.recentActivity);
  
  const progressPercentage = Math.min(
    Math.round((mockData.partsEnteredThisQuarter / mockData.quarterlyTarget) * 100),
    100
  );
  
  const progressControls = useAnimation();
  
  useEffect(() => {
    // Animate progress bar when component mounts
    progressControls.start({ width: `${progressPercentage}%`, transition: { duration: 1, ease: "easeOut" } });
  }, [progressPercentage, progressControls]);
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };
  
  const validatePartId = (id) => {
    // Check if part ID is valid (in our mock list)
    if (validPartIds.includes(id)) {
      // Check if it's a duplicate entry
      const isDuplicate = recentEntries.some(entry => entry.partId === id);
      
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
      id: Date.now(),
      partId,
      time: 'Just now',
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
    <Layout title="Europe Gas Parts">
      <Container>
        <WelcomeMessage
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Good {getTimeOfDay()}, <span>{currentUser?.name || 'User'}</span>! 
        </WelcomeMessage>
        
        <StatsSection>
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <CardContent>
              <h2>Your Stats</h2>
              <Statistic>
                <StatValue>{mockData.totalPartsEntered}</StatValue>
                <StatLabel>Total Parts Entered</StatLabel>
              </Statistic>
              <Statistic>
                <StatValue>{mockData.earnedBonus}</StatValue>
                <StatLabel>Total Earned Bonus</StatLabel>
              </Statistic>
            </CardContent>
          </Card>
          
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <CardContent>
              <h2>Quarterly Progress</h2>
              <Statistic>
                <StatValue>{mockData.partsEnteredThisQuarter}</StatValue>
                <StatLabel>Parts Entered This Quarter</StatLabel>
              </Statistic>
              <Statistic>
                <StatValue>{progressPercentage}%</StatValue>
                <StatLabel>Progress to Target ({mockData.quarterlyTarget} parts)</StatLabel>
              </Statistic>
              <ProgressBar>
                <ProgressFill animate={progressControls} />
              </ProgressBar>
              <CardDescription>
                {progressPercentage < 100 
                  ? `You need ${mockData.quarterlyTarget - mockData.partsEnteredThisQuarter} more parts to reach your quarterly target.` 
                  : 'Congratulations! You\'ve reached your quarterly target.'}
              </CardDescription>
            </CardContent>
          </Card>
        </StatsSection>
        
        <EntrySection>
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <CardContent>
              <h2>Enter Spare Part ID</h2>
              
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
                  <span>🔧</span> Submit Part ID
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
            </CardContent>
          </Card>
        </EntrySection>
        
        <HistorySection>
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <CardContent>
              <h2>Recent Entries</h2>
              
              {recentEntries.length > 0 ? (
                <ActivityList>
                  {recentEntries.map((activity, i) => (
                    <ActivityItem 
                      key={activity.id}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <ActivityTitle>Part ID: {activity.partId}</ActivityTitle>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: activity.status === 'Valid' ? '#e8f5e9' : activity.status === 'Duplicate' ? '#fff8e1' : '#ffebee',
                            color: activity.status === 'Valid' ? '#2e7d32' : activity.status === 'Duplicate' ? '#f57f17' : '#c62828',
                            fontSize: '0.75rem',
                          }}
                        >
                          {activity.status}
                        </span>
                      </div>
                      <ActivityTime>{activity.time}</ActivityTime>
                    </ActivityItem>
                  ))}
                </ActivityList>
              ) : (
                <EmptyState>No entries yet. Start submitting part IDs to see them here.</EmptyState>
              )}
            </CardContent>
          </Card>
        </HistorySection>
      </Container>
    </Layout>
  );
};

export default UserPage; 