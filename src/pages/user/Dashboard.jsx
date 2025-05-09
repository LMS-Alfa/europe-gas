import { useEffect } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  
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

const Statistic = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const StatValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-right: ${props => props.theme.spacing.sm};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatLabel = styled.span`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const RecentActivity = styled.div`
  margin-top: ${props => props.theme.spacing.lg};
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

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.text.primary};
    position: relative;
    display: inline-block;
  }
`;

const ActionButton = styled(motion(Link))`
  padding: ${props => `${props.theme.spacing.md} ${props.theme.spacing.lg}`};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  margin-top: ${props => props.theme.spacing.md};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  text-decoration: none;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transition.medium};
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const CardContent = styled.div`
  padding-left: ${props => props.theme.spacing.md};
`;

const CardDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const WelcomeMessage = styled(motion.div)`
  margin-bottom: ${props => props.theme.spacing.xl};
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.primary};
  
  span {
    color: ${props => props.theme.colors.primary};
    font-weight: ${props => props.theme.typography.fontWeight.medium};
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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  hover: { 
    y: -10,
    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
    transition: { duration: 0.3 }
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

const Dashboard = () => {
  const { currentUser } = useAuth();
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
  
  return (
    <Layout title="User Dashboard">
      <WelcomeMessage
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Good {getTimeOfDay()}, <span>{currentUser?.name || 'User'}</span>! Here's your current status.
      </WelcomeMessage>
      
      <DashboardGrid>
        <Card
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <CardContent>
            <h2>Your Stats</h2>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatValue>{mockData.totalPartsEntered}</StatValue>
              <StatLabel>Total Parts Entered</StatLabel>
            </Statistic>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatValue>{mockData.earnedBonus}</StatValue>
              <StatLabel>Total Earned Bonus</StatLabel>
            </Statistic>
          </CardContent>
        </Card>
        
        <Card
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.1 }}
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
      </DashboardGrid>
      
      <Section>
        <h3>Recent Activity</h3>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardContent>
            <RecentActivity>
              {mockData.recentActivity.map((activity, i) => (
                <ActivityItem 
                  key={activity.id}
                  custom={i}
                  variants={listItemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: 5 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <ActivityTitle>Part ID: {activity.partId}</ActivityTitle>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: activity.status === 'Valid' ? '#e8f5e9' : '#ffebee',
                        color: activity.status === 'Valid' ? '#2e7d32' : '#c62828',
                        fontSize: '0.75rem',
                      }}
                    >
                      {activity.status}
                    </span>
                  </div>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityItem>
              ))}
            </RecentActivity>
          </CardContent>
        </Card>
      </Section>
      
      <Section>
        <h3>Quick Actions</h3>
        <DashboardGrid>
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.3 }}
          >
            <CardContent>
              <h2>Enter New Parts</h2>
              <CardDescription>
                Enter spare part IDs to earn bonuses. Each valid part ID you enter adds $1 to your quarterly bonus.
              </CardDescription>
              <ActionButton 
                to="/parts"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🔧</span> Go to Parts Entry
              </ActionButton>
            </CardContent>
          </Card>
          
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.4 }}
          >
            <CardContent>
              <h2>View History</h2>
              <CardDescription>
                Review your complete part entry history, check validity status, and monitor your bonus earnings over time.
              </CardDescription>
              <ActionButton 
                to="/history"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>📋</span> View History
              </ActionButton>
            </CardContent>
          </Card>
        </DashboardGrid>
      </Section>
    </Layout>
  );
};

export default Dashboard; 