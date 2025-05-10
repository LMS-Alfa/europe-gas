import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, useAnimation } from 'framer-motion';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStats, getRecentActivity } from '../../utils/api';
import { FiLoader, FiTool, FiUsers, FiDollarSign, FiRefreshCw } from 'react-icons/fi';

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

const StatCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

const StatCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.sm};
  transition: all ${props => props.theme.transition.medium};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  &:hover {
    box-shadow: ${props => props.theme.shadows.md};
    transform: translateY(-5px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  width: 100%;
`;

const IconWrapper = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${props => props.theme.spacing.md};
  
  &.parts {
    background-color: rgba(74, 144, 226, 0.1);
    color: #4A90E2;
  }
  
  &.users {
    background-color: rgba(80, 200, 120, 0.1);
    color: #50C878;
  }
  
  &.bonuses {
    background-color: rgba(90, 111, 220, 0.1);
    color: #5A6FDC;
  }
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${props => props.theme.colors.text.secondary};
  font-weight: 500;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  
  &.parts {
    color: #4A90E2;
  }
  
  &.users {
    color: #50C878;
  }
  
  &.bonuses {
    color: #5A6FDC;
  }
`;

const Statistic = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const OldStatValue = styled.span`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  margin-right: ${props => props.theme.spacing.sm};
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const OldStatLabel = styled.span`
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

// Add a RefreshButton component
const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}10;
  }
  
  svg {
    margin-right: ${props => props.theme.spacing.sm};
  }
  
  &.refreshing svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardStats, setDashboardStats] = useState({
    totalParts: 0,
    partsEnteredToday: 0,
    totalUsers: 0,
    totalBonuses: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch dashboard statistics
      const stats = await getDashboardStats();
      console.log('Fetched stats:', stats);
      setDashboardStats(stats);
      
      // Fetch recent activity
      const activity = await getRecentActivity(5);
      setRecentActivity(activity);
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      
      // Clear any previous errors
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (!refreshing) {
      fetchDashboardData();
    }
  };
  
  // Format last updated time
  const getLastUpdatedText = () => {
    if (!lastUpdated) return '';
    return `Last updated: ${lastUpdated.toLocaleTimeString()}`;
  };
  
  // Format number with commas
  const formatNumber = (num) => {
    if (num === undefined || num === null) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Format currency with dollar sign and commas
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00";
    return `$${parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };
  
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <LoadingContainer>
          <FiLoader size={40} className="spinner" />
          <LoadingText>Loading dashboard data...</LoadingText>
        </LoadingContainer>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout title="Admin Dashboard">
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </ErrorContainer>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <WelcomeMessage
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Good {getTimeOfDay()}, <span>{currentUser?.firstName || currentUser?.name || 'Admin'}</span>! Here's the system overview.
      </WelcomeMessage>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#888' }}>{getLastUpdatedText()}</div>
        <RefreshButton 
          onClick={handleRefresh} 
          className={refreshing ? 'refreshing' : ''}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={refreshing}
        >
          <FiRefreshCw size={16} /> {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </RefreshButton>
      </div>
      
      <StatCardGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <IconWrapper className="parts">
            <FiTool size={24} />
          </IconWrapper>
          <StatLabel>TOTAL PARTS</StatLabel>
          <StatValue className="parts">{formatNumber(dashboardStats.totalParts)}</StatValue>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <IconWrapper className="users">
            <FiUsers size={24} />
          </IconWrapper>
          <StatLabel>ACTIVE USERS</StatLabel>
          <StatValue className="users">{formatNumber(dashboardStats.totalUsers)}</StatValue>
        </StatCard>
        
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <IconWrapper className="bonuses">
            <FiDollarSign size={24} />
          </IconWrapper>
          <StatLabel>TOTAL BONUSES</StatLabel>
          <StatValue className="bonuses">{formatCurrency(dashboardStats.totalBonuses)}</StatValue>
        </StatCard>
      </StatCardGrid>
      
      <Section>
        <h3>Recent Activity</h3>
        <Card
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardContent>
            <RecentActivity>
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, i) => (
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
                ))
              ) : (
                <EmptyState>No recent activity</EmptyState>
              )}
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: ${props => props.theme.colors.text.secondary};
  
  .spinner {
    animation: spin 1.5s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  background-color: ${props => `${props.theme.colors.error}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  margin: ${props => props.theme.spacing.xl} 0;
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  margin-bottom: ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const Button = styled.button`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

export default Dashboard; 