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

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.text.primary};
    position: relative;
    display: inline-block;
    
    &:after {
      content: '';
      position: absolute;
      bottom: -${props => props.theme.spacing.xs};
      left: 0;
      width: 40px;
      height: 3px;
      background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
    }
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

// Mock data for demo purposes
const mockData = {
  totalParts: 523,
  partsEnteredToday: 28,
  totalUsers: 12,
  totalBonuses: '$345',
  recentActivity: [
    { id: 1, title: 'User John Doe entered 5 parts', time: '10 minutes ago' },
    { id: 2, title: 'Admin uploaded 50 new parts', time: '1 hour ago' },
    { id: 3, title: 'User Jane Smith entered 3 parts', time: '2 hours ago' },
    { id: 4, title: 'Quarterly bonuses calculated', time: '1 day ago' },
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
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  return (
    <Layout title="Admin Dashboard">
      <WelcomeMessage
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Good {getTimeOfDay()}, <span>{currentUser?.name || 'Admin'}</span>! Here's the system overview.
      </WelcomeMessage>
      
      <DashboardGrid>
        <Card
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
          <CardContent>
            <h2>Inventory</h2>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatValue>{mockData.totalParts}</StatValue>
              <StatLabel>Total Parts</StatLabel>
            </Statistic>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <StatValue>{mockData.partsEnteredToday}</StatValue>
              <StatLabel>Parts Entered Today</StatLabel>
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
            <h2>Users</h2>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatValue>{mockData.totalUsers}</StatValue>
              <StatLabel>Total Users</StatLabel>
            </Statistic>
            <CardDescription>
              Monitor user activity and manage user accounts.
            </CardDescription>
          </CardContent>
        </Card>
        
        <Card
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          transition={{ delay: 0.2 }}
        >
          <CardContent>
            <h2>Bonuses</h2>
            <Statistic
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <StatValue>{mockData.totalBonuses}</StatValue>
              <StatLabel>Total Bonuses This Quarter</StatLabel>
            </Statistic>
            <CardDescription>
              Track bonuses and prepare quarterly reports.
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
                  <ActivityTitle>{activity.title}</ActivityTitle>
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
              <h2>Upload Parts</h2>
              <CardDescription>
                Upload new spare parts inventory via CSV file. Add part IDs, descriptions, and quantities.
              </CardDescription>
              <ActionButton 
                to="/admin/parts"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>🔧</span> Upload Parts
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
              <h2>Manage Users</h2>
              <CardDescription>
                Add, edit, or remove user accounts. Adjust permissions and reset passwords.
              </CardDescription>
              <ActionButton 
                to="/admin/users"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>👥</span> Manage Users
              </ActionButton>
            </CardContent>
          </Card>
          
          <Card
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            transition={{ delay: 0.5 }}
          >
            <CardContent>
              <h2>Generate Reports</h2>
              <CardDescription>
                Create and download bonus reports. View statistics and prepare quarterly bonus payments.
              </CardDescription>
              <ActionButton 
                to="/admin/reports"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>📝</span> Generate Reports
              </ActionButton>
            </CardContent>
          </Card>
        </DashboardGrid>
      </Section>
    </Layout>
  );
};

export default Dashboard; 