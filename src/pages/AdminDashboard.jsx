import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Card } from '../components/Container';
import PageContainer from '../components/PageContainer';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { GridLayout, GridCard } from '../components/GridLayout';
import { FormContainer, Input, SelectInput, FormRow, FormActions } from '../components/FormElements';
import { Button, IconButton } from '../components/Button';
import { 
  FiTool, FiUsers, FiDollarSign, FiBarChart2, 
  FiUpload, FiUserPlus, FiCreditCard, FiFileText,
  FiEdit, FiRefreshCw, FiXCircle, FiUserCheck,
  FiSearch, FiWifi, FiSettings, FiTrash2,
  FiAlertCircle, FiAlertTriangle, FiInfo,
  FiDatabase, FiDownload, FiClipboard
} from 'react-icons/fi';
import { getDashboardStats, getRecentActivity, getAllProfiles, createDatabaseTables, getAllUserBonuses, getAllUsersEntriesAndBonus, getPartsRemainingCount } from '../utils/api';
import { downloadElementAsImage } from '../utils/exports';
import styled from 'styled-components';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LabelList
} from 'recharts';

// Styled component for debug information
const DebugInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-family: monospace;
  font-size: 0.8rem;
  max-height: 200px;
  overflow: auto;
  
  h4 {
    margin-top: 0;
    margin-bottom: 0.5rem;
    color: ${props => props.theme.colors.text.primary};
  }
  
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
`;

// Alert banner component for errors
const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  background-color: ${props => 
    props.type === 'error' ? `${props.theme.colors.error}20` :
    props.type === 'warning' ? `${props.theme.colors.warning}20` :
    props.type === 'info' ? `${props.theme.colors.info}20` :
    props.type === 'success' ? `${props.theme.colors.success}20` :
    `${props.theme.colors.info}20`};
  border-left: 4px solid ${props => 
    props.type === 'error' ? props.theme.colors.error :
    props.type === 'warning' ? props.theme.colors.warning :
    props.type === 'info' ? props.theme.colors.info :
    props.type === 'success' ? props.theme.colors.success :
    props.theme.colors.info};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text.primary};
  
  .icon {
    color: ${props => 
      props.type === 'error' ? props.theme.colors.error :
      props.type === 'warning' ? props.theme.colors.warning :
      props.type === 'info' ? props.theme.colors.info :
      props.type === 'success' ? props.theme.colors.success :
      props.theme.colors.info};
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: 1rem;
  
  /* Make chart elements responsive to theme */
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line {
    stroke: ${props => props.theme.colors.border};
  }
  
  .recharts-cartesian-axis-line {
    stroke: ${props => props.theme.colors.border};
  }
  
  .recharts-cartesian-axis-tick-line {
    stroke: ${props => props.theme.colors.border};
  }
  
  .recharts-cartesian-axis-tick-value {
    fill: ${props => props.theme.colors.text.primary};
  }
  
  .recharts-label {
    fill: ${props => props.theme.colors.text.primary};
  }
  
  .recharts-text {
    fill: ${props => props.theme.colors.text.primary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    height: 280px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    height: 250px;
  }
`;

const ChartControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.colors.text.secondary};
  gap: 1rem;
  
  svg {
    opacity: 0.5;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

// Define consistent color scheme with better contrast for dark mode
const COLORS = {
  primary: '#3498db',   // Brighter blue
  secondary: '#2ecc71', // Brighter green
  success: '#27ae60',   // Adjusted green
  warning: '#f39c12',   // Brighter orange
  error: '#e74c3c',     // Brighter red
  purple: '#9b59b6',    // Brighter purple
  indigo: '#5c6bc0',    // Kept as is
  pink: '#e84393'       // Brighter pink
};

const CHART_COLORS = [
  COLORS.secondary, COLORS.primary, COLORS.warning, 
  COLORS.purple, COLORS.pink, COLORS.error, COLORS.indigo, COLORS.success
];

// Custom tooltip component with improved dark mode styling
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div 
      style={{ 
        background: 'var(--tooltip-bg, rgba(97, 97, 97, 0.9))', 
        padding: '10px 14px', 
        border: '1px solid var(--tooltip-border, #777)',
        borderRadius: '4px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        color: 'var(--tooltip-text, #fff)'
      }}
    >
      <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{label}</p>
      {payload.map((entry, index) => {
        const formattedValue = formatter ? 
          formatter(entry.value, entry.name) : 
          entry.value;
          
        return (
          <p key={index} style={{ margin: '0', color: entry.color }}>
            {`${entry.name}: ${formattedValue}`}
          </p>
        );
      })}
    </div>
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dbInitializing, setDbInitializing] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalParts: 0,
    totalUsers: 0,
    totalBonuses: 0,
    partsEnteredToday: 0,
    partsRemaining: 0,
    error: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [error, setError] = useState(null);
  const [debugData, setDebugData] = useState({});
  const [bonusData, setBonusData] = useState([]);

  // Format numbers for display
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0);
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };
  
  // Function to initialize database tables
  const initializeDatabase = async () => {
    setDbInitializing(true);
    try {
      console.log('Initializing database tables...');
      const result = await createDatabaseTables();
      console.log('Database initialization result:', result);
      setDbInitialized(result);
      setDebugData(prevData => ({
        ...prevData,
        databaseInitialized: result
      }));
      return result;
    } catch (err) {
      console.error('Error initializing database:', err);
      setError(`Failed to initialize database: ${err.message}`);
      setDebugData(prevData => ({
        ...prevData,
        databaseInitError: err.message
      }));
      return false;
    } finally {
      setDbInitializing(false);
    }
  };

  // Function to fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    console.log('Starting dashboard data fetch...');
    
    try {
      // Get dashboard stats
      console.log('Fetching dashboard stats...');
      const stats = await getDashboardStats();
      
      // Get count of remaining parts (not entered yet)
      const remainingPartsCount = await getPartsRemainingCount();
      
      console.log('Dashboard stats received:', stats);
      console.log('Parts remaining count:', remainingPartsCount);
      
      setDashboardStats({
        ...stats,
        partsRemaining: remainingPartsCount
      });
      
      // Store debug data
      setDebugData(prevData => ({
        ...prevData,
        dashboardStats: {
          ...stats,
          partsRemaining: remainingPartsCount
        }
      }));
      
      // Check for errors
      if (stats.error) {
        setError(`Database error: ${stats.error}`);
        console.error('Stats error:', stats.error);
      }
      
      // Get recent activity
      console.log('Fetching recent activity...');
      try {
        const activity = await getRecentActivity(10);
        console.log('Recent activity received:', activity);
        setRecentActivity(activity || []);
        setDebugData(prevData => ({
          ...prevData,
          recentActivity: { count: activity?.length || 0, data: activity }
        }));
      } catch (activityErr) {
        console.error('Error fetching activity:', activityErr);
        setDebugData(prevData => ({
          ...prevData,
          activityError: activityErr.message
        }));
      }
      
      // Get all users and their entries/bonus data
      console.log('Fetching users and entry/bonus data...');
      try {
        // Fetch user profiles and entries/bonus data in parallel for efficiency
        const [allUsers, entriesAndBonusData] = await Promise.all([
          getAllProfiles(),
          getAllUsersEntriesAndBonus()
        ]);
        
        console.log('User profiles received:', allUsers);
        console.log('Entries and bonus data received:', entriesAndBonusData);
        
        // Transform user data to include entries and bonus information
        const formattedUsers = allUsers ? allUsers.map(user => {
          // Get entries and bonus data for this user
          const userId = user.id;
          const entriesBonus = entriesAndBonusData[userId] || { entriesCount: 0, bonusAmount: '$0.00' };
          
          return {
            id: userId,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            email: user.email,
            phone: user.phone,
            entries: entriesBonus.entriesCount,
            bonus: entriesBonus.bonusAmount
          };
        }) : [];
        
        setUsers(formattedUsers);
        setDebugData(prevData => ({
          ...prevData,
          users: { count: allUsers?.length || 0, sample: allUsers?.slice(0, 2) },
          entriesAndBonus: entriesAndBonusData
        }));
      } catch (usersErr) {
        console.error('Error fetching users:', usersErr);
        setDebugData(prevData => ({
          ...prevData,
          usersError: usersErr.message
        }));
      }
      
      // Fetch bonus data
      const bonuses = await getAllUserBonuses();
      setBonusData(bonuses || []);
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(`Failed to load dashboard data: ${err.message}`);
      setDebugData(prevData => ({
        ...prevData,
        globalError: err.message,
        stack: err.stack
      }));
    } finally {
      setLoading(false);
    }
  };

  // Initialize database and fetch data on component mount
  useEffect(() => {
    const setup = async () => {
      const dbResult = await initializeDatabase();
      await fetchDashboardData();
    };
    
    setup();
  }, []);

  // Convert dashboard stats to stat card format
  const adminStats = [
    {
      icon: <FiTool size={24} />,
      label: 'Total Parts',
      value: loading ? '...' : formatNumber(dashboardStats.totalParts),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? 'Error' : undefined,
      iconColor: dashboardStats.error ? 'error' : 'primary'
    },
    {
      icon: <FiClipboard size={24} />,
      label: 'Parts Remaining',
      value: loading ? '...' : formatNumber(dashboardStats.partsRemaining),
      iconColor: dashboardStats.error ? 'error' : 'warning'
    },
    {
      icon: <FiUsers size={24} />,
      label: 'Active Users',
      value: loading ? '...' : formatNumber(dashboardStats.totalUsers),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? 'Error' : undefined,
      iconColor: dashboardStats.error ? 'error' : 'secondary'
    },
    {
      icon: <FiDollarSign size={24} />,
      label: 'Total Bonuses',
      value: loading ? '...' : formatCurrency(dashboardStats.totalBonuses),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? 'Error' : undefined,
      gradientValue: !dashboardStats.error
    }
  ];
  
  // Format part entries data
  const partsData = recentActivity
    ? recentActivity
        .filter(activity => activity.type === 'part_entry')
        .map((activity, index) => ({
          id: activity.id,
          partId: activity.title.split(' entered ')[1] || 'Unknown Part',
          date: new Date(activity.timestamp).toLocaleDateString(),
          user: activity.title.split(' entered ')[0] || 'Unknown User',
          status: 'completed'
        }))
    : [];
  
  // User table columns with actions
  const userColumns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: 'Phone' },
    { key: 'entries', title: 'Entries' },
    { key: 'bonus', title: 'Bonus' }
  ];
  
  // Parts columns
  const partsColumns = [
    { key: 'partId', title: 'Part ID' },
    { key: 'date', title: 'Date' },
    { key: 'user', title: 'User' },
    { key: 'status', title: 'Status', type: 'status' }
  ];
  
  // Prepare bonus chart data with memoization for better performance
  const bonusChartData = useMemo(() => {
    if (!bonusData || bonusData.length === 0) {
      console.log('No bonus data available for chart');
      return [];
    }
    
    console.log('Raw bonus data for chart:', bonusData);
    
    // Filter out admin users and sort by total bonus amount
    const filteredData = bonusData
      .filter(user => {
        const isAdmin = user.role === 'admin';
        if (isAdmin) {
          console.log(`Excluding admin user from chart: ${user.userName}`);
        }
        return !isAdmin;
      })
      .sort((a, b) => b.totalBonus - a.totalBonus)
      .slice(0, 5)
      .map(user => ({
        name: user.userName || 'Unknown User',
        bonus: user.totalBonus
      }));
    
    console.log('Filtered bonus data for chart (excluding admins):', filteredData);
    return filteredData;
  }, [bonusData]);
  
  // Download chart using the utility
  const handleChartDownload = useCallback((chartId, fileName) => {
    downloadElementAsImage(chartId, fileName);
  }, []);

  return (
    <PageContainer
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="1rem"
    >
      {/* Database Initialization Alert */}
      {dbInitializing && (
        <AlertBanner type="info">
          <span className="icon"><FiDatabase size={20} /></span>
          <div>
            <strong>Database Initialization</strong>
            <div>Setting up database tables... This may take a moment.</div>
          </div>
        </AlertBanner>
      )}
      
      {/* Database Initialized Success */}
      {dbInitialized && !dbInitializing && (
        <AlertBanner type="success">
          <span className="icon"><FiDatabase size={20} /></span>
          <div>
            <strong>Database Ready</strong>
            <div>Database tables have been initialized successfully.</div>
          </div>
        </AlertBanner>
      )}
      
      {/* Error Alert Banner */}
      {error && (
        <AlertBanner type="error">
          <span className="icon"><FiAlertTriangle size={20} /></span>
          <div>
            <strong>Database Error</strong>
            <div>{error}</div>
          </div>
        </AlertBanner>
      )}
      
      {/* Stats cards */}
      <GridLayout columns={12} gap="0.75rem" mobileGap="0.5rem">
        {adminStats.map((stat, index) => (
          <GridCard key={index} colSpan={3}>
            <StatCard {...stat} />
          </GridCard>
        ))}
      </GridLayout>

      {/* Refresh Button and Debug Controls */}
      <Container padding="0.5rem 0" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: '#888' }}>
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={fetchDashboardData} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            icon={<FiRefreshCw size={16} />}
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
      </Container>

      {/* Bonus Distribution Chart with improved styling */}
      <Panel
        title="User Bonus Distribution"
        icon={<FiBarChart2 size={20} />}
        variant="elevated"
        accent="gradient"
        compact
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button 
              onClick={() => handleChartDownload('admin-bonus-chart', 'user_bonus_distribution')}
              variant="primary" 
              size="sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <FiDownload size={16} />
              Download
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/reports'} 
              variant="outline" 
              size="sm"
              icon={<FiFileText size={16} />}
            >
              Detailed Reports
            </Button>
          </div>
        }
      >
        {loading ? (
          <Container padding="2rem" style={{ textAlign: 'center' }}>
            Loading bonus data...
          </Container>
        ) : bonusChartData.length > 0 ? (
          <ChartContainer id="admin-bonus-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bonusChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                barSize={36}
                barGap={3}
              >
                {/* Theme-aware grid lines */}
                <CartesianGrid strokeDasharray="3 3" />
                {/* Theme-aware axis text */}
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  label={{ 
                    value: 'Bonus Amount ($)', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 12 }
                  }}
                  tick={{ fontSize: 12 }}
                  tickCount={5}
                  domain={[0, 'dataMax']}
                  allowDecimals={false}
                />
                {/* Lighter cursor highlight for dark mode */}
                <Tooltip 
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={<CustomTooltip formatter={(value) => `$${value}`} />}
                />
                {/* Theme-aware legend */}
                <Legend 
                  verticalAlign="top" 
                  height={36}
                />
                <Bar 
                  dataKey="bonus" 
                  name="Bonus Amount" 
                  animationDuration={1000}
                  animationEasing="ease-in-out"
                >
                  {bonusChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CHART_COLORS[index % CHART_COLORS.length]} 
                    />
                  ))}
                  {/* Theme-aware label colors */}
                  <LabelList 
                    dataKey="bonus" 
                    position="top" 
                    formatter={(value) => `$${value}`}
                    style={{ fontSize: 12, fontWeight: 'bold' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <NoDataMessage>
            <FiBarChart2 size={48} />
            <p>No bonus data available</p>
          </NoDataMessage>
        )}
      </Panel>

      {/* Main content grid */}
      <Container grid gridCols={2} padding="0" gap="1rem">
        {/* User management panel */}
        <Container padding="0" style={{ gridColumn: 'span 2' }}>
          <Panel
            title="User Management"
            icon={<FiUserCheck size={20} />}
            variant="elevated"
            gradientHeader
            compact
            actions={
              <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<FiUsers size={16} />}
                  onClick={() => window.location.href = '/admin/users'}
                >
                  View All Users
                </Button>
              </div>
            }
          >
            <Container padding="0">
              <DataTable
                data={users.slice(0, 5)}
                columns={userColumns}
                sortable={true}
                pagination={false}
                loading={loading}
                emptyMessage={loading ? "Loading users..." : "No users found"}
              />
            </Container>
          </Panel>
        </Container>
        
      </Container>
      
      {/* Recent part entries */}
      <Panel
        title="Recent Part Entries"
        icon={<FiTool size={20} />}
        variant="elevated"
        accent="gradient"
        compact
        actions={
          <div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        }
      >
        <DataTable
          data={partsData}
          columns={partsColumns}
          sortable={true}
          pagination={false}
          loading={loading}
          emptyMessage={loading ? "Loading entries..." : "No recent part entries"}
          onRowClick={(row) => console.log('Clicked row', row.id)}
        />
      </Panel>
    </PageContainer>
  );
};

export default AdminDashboard; 