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
import { useTranslationWithForceUpdate } from '../hooks/useTranslationWithForceUpdate';

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

// Custom tooltip for charts with i18n
const CustomTooltip = ({ active, payload, label, formatter, chartTexts }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
      }}>
        <p style={{ 
          margin: '0 0 5px 0', 
          fontWeight: 'bold',
          borderBottom: '1px solid #eee',
          paddingBottom: '5px'
        }}>{label}</p>
        <p style={{ 
          margin: '0',
          color: '#666',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span style={{ 
            display: 'inline-block',
            width: '10px',
            height: '10px',
            marginRight: '5px',
            backgroundColor: payload[0].color || '#4a6cf7',
            borderRadius: '50%'
          }}></span>
          <span style={{ fontWeight: 'bold' }}>{chartTexts.bonusAmount}: </span> 
          <span style={{ marginLeft: '4px' }}>{formatter ? formatter(payload[0].value) : payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Chart wrapper component that forces re-render on language change
const ChartWithLanguage = ({ currentLanguage, chartTexts, bonusChartData, handleChartDownload, formatCurrency }) => {
  // Currency formatter that just returns the number without the currency symbol
  const formatNumberOnly = (value) => {
    return new Intl.NumberFormat(currentLanguage).format(value || 0);
  };

  // Currency formatter with dollar sign for displaying values
  const formatShortCurrency = (value) => {
    return `$${formatNumberOnly(value)}`;
  };

  // Define colors for each bar
  const CHART_COLORS = [
    "#4a6cf7", // Blue
    "#2ecc71", // Green
    "#f39c12", // Orange
    "#9b59b6", // Purple
    "#e84393", // Pink
    "#e74c3c", // Red
    "#5c6bc0", // Indigo
    "#27ae60"  // Dark Green
  ];

  return (
    <ChartContainer id="admin-bonus-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={bonusChartData}
          margin={{
            top: 20, right: 30, left: 30, bottom: 40
          }}
          barCategoryGap="20%"
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
            axisLine={{ stroke: '#e0e0e0' }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            tickFormatter={formatShortCurrency}
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip 
            content={<CustomTooltip formatter={formatCurrency} chartTexts={chartTexts} />}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            formatter={() => chartTexts.bonusAmount} 
          />
          <Bar 
            dataKey="bonus" 
            name={chartTexts.bonusAmount}
            radius={[4, 4, 0, 0]}
            barSize={40}
          >
            {
              bonusChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))
            }
            <LabelList 
              dataKey="bonus" 
              position="top" 
              formatter={formatShortCurrency} 
              style={{ fill: '#666', fontSize: 12, fontWeight: 500 }} 
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const AdminDashboard = () => {
  const { t, currentLanguage } = useTranslationWithForceUpdate();
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

  // Format numbers for display with proper locale
  const formatNumber = (num) => {
    return new Intl.NumberFormat(currentLanguage).format(num || 0);
  };

  // Format currency for display with proper locale
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: 'USD' }).format(amount || 0);
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
        dbInit: result
      }));
      return result;
    } catch (err) {
      console.error('Database initialization error:', err);
      setError(`${t('common.error')}: ${err.message}`);
      setDebugData(prevData => ({
        ...prevData,
        dbInitError: err.message
      }));
      return false;
    } finally {
      setDbInitializing(false);
    }
  };
  
  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch dashboard stats
      const stats = await getDashboardStats();
      console.log('Dashboard stats:', stats);
      
      // Get parts remaining count
      const remainingParts = await getPartsRemainingCount();
      console.log('Remaining parts:', remainingParts);
      
      // Combine the data
      setDashboardStats({
        ...stats,
        partsRemaining: remainingParts,
        error: null
      });
      
      // Get recent activity
      const activities = await getRecentActivity();
      setRecentActivity(activities);
      
      // Get users
      try {
        const allUsers = await getAllProfiles();
        const entriesAndBonusData = await getAllUsersEntriesAndBonus();

        // Format users for display
        const formattedUsers = allUsers?.map(user => {
          // Find user entries and bonus from the entries data
          const userEntryInfo = entriesAndBonusData?.[user.id];
          
          return {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || t('common.noData'),
            email: user.email || t('common.noData'),
            phone: user.phone || t('common.noData'),
            entries: userEntryInfo?.entriesCount || 0,
            bonus: formatCurrency(userEntryInfo?.bonusAmount || 0)
          };
        }) || [];
        
        setUsers(formattedUsers);
        
        // Update debug data
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
      setError(`${t('dashboard.fetchError')}: ${err.message}`);
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
  
  // Re-fetch when language changes
  useEffect(() => {
    if (!loading) {
      console.log("Language changed to:", currentLanguage, "- Refreshing dashboard data");
      fetchDashboardData();
    }
  }, [currentLanguage]);

  // Convert dashboard stats to stat card format
  const adminStats = [
    {
      icon: <FiTool size={24} />,
      label: t('dashboard.totalParts'),
      value: loading ? '...' : formatNumber(dashboardStats.totalParts),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? t('common.error') : undefined,
      iconColor: dashboardStats.error ? 'error' : 'primary'
    },
    {
      icon: <FiClipboard size={24} />,
      label: t('dashboard.partsRemaining'),
      value: loading ? '...' : formatNumber(dashboardStats.partsRemaining),
      iconColor: dashboardStats.error ? 'error' : 'warning'
    },
    {
      icon: <FiUsers size={24} />,
      label: t('dashboard.activeUsers'),
      value: loading ? '...' : formatNumber(dashboardStats.totalUsers),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? t('common.error') : undefined,
      iconColor: dashboardStats.error ? 'error' : 'secondary'
    },
    {
      icon: <FiDollarSign size={24} />,
      label: t('dashboard.totalBonuses'),
      value: loading ? '...' : formatCurrency(dashboardStats.totalBonuses),
      trend: !loading && dashboardStats.error ? -1 : undefined,
      trendLabel: !loading && dashboardStats.error ? t('common.error') : undefined,
      gradientValue: !dashboardStats.error
    }
  ];
  
  // Format part entries data
  const partsData = recentActivity
    ? recentActivity
        .filter(activity => activity.type === 'part_entry')
        .map((activity, index) => ({
          id: activity.id,
          partId: activity.title.split(' entered ')[1] || t('common.unknown'),
          date: new Date(activity.timestamp).toLocaleDateString(currentLanguage),
          user: activity.title.split(' entered ')[0] || t('common.unknown'),
          status: 'completed'
        }))
    : [];
  
  // User table columns with actions
  const userColumns = [
    { key: 'name', title: t('common.name') },
    { key: 'email', title: t('common.email') },
    { key: 'phone', title: t('auth.phone') },
    { key: 'entries', title: t('dashboard.partsEntered') },
    { key: 'bonus', title: t('bonusReports.bonusAmount') }
  ];
  
  // Parts columns
  const partsColumns = [
    { key: 'partId', title: t('enterPart.partSerialNumber') },
    { key: 'date', title: t('common.date') },
    { key: 'user', title: t('common.user') },
    { key: 'status', title: t('common.status'), type: 'status' }
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
        name: user.userName || t('common.unknown'),
        bonus: user.totalBonus
      }));
    
    console.log('Filtered bonus data for chart (excluding admins):', filteredData);
    return filteredData;
  }, [bonusData, currentLanguage, t]);
  
  // Memoize the translated text to ensure consistent language throughout chart
  const chartTexts = useMemo(() => ({
    bonusAmount: t('bonusReports.bonusAmount')
  }), [currentLanguage, t]);

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
            <strong>{t('common.initializing')}</strong>
            <div>{t('dashboard.databaseInitializingMessage')}</div>
          </div>
        </AlertBanner>
      )}
      
      {/* Database Initialized Success */}
      {dbInitialized && !dbInitializing && (
        <AlertBanner type="success">
          <span className="icon"><FiDatabase size={20} /></span>
          <div>
            <strong>{t('dashboard.databaseReady')}</strong>
            <div>{t('dashboard.databaseInitializedSuccessfully')}</div>
          </div>
        </AlertBanner>
      )}
      
      {/* Error Alert Banner */}
      {error && (
        <AlertBanner type="error">
          <span className="icon"><FiAlertTriangle size={20} /></span>
          <div>
            <strong>{t('common.error')}</strong>
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
          {t('dashboard.lastUpdated')}: {lastRefresh.toLocaleTimeString(currentLanguage)}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            onClick={fetchDashboardData} 
            variant="outline" 
            size="sm" 
            disabled={loading}
            icon={<FiRefreshCw size={16} />}
          >
            {loading ? t('common.refreshing') : t('common.refreshData')}
          </Button>
        </div>
      </Container>

      {/* Bonus Distribution Chart with improved styling */}
      <Panel
        key={`chart-panel-${currentLanguage}`}
        title={t('bonusReports.bonusDistributionByUser')}
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
              {t('common.download')}
            </Button>
            <Button 
              onClick={() => window.location.href = '/admin/reports'} 
              variant="outline" 
              size="sm"
              icon={<FiFileText size={16} />}
            >
              {t('bonusReports.detailedReports')}
            </Button>
          </div>
        }
      >
        {loading ? (
          <Container padding="2rem" style={{ textAlign: 'center' }}>
            {t('common.loading')}
          </Container>
        ) : bonusChartData.length > 0 ? (
          <div key={`full-chart-wrapper-${currentLanguage}`}>
            <ChartWithLanguage 
              currentLanguage={currentLanguage}
              chartTexts={chartTexts}
              bonusChartData={bonusChartData}
              handleChartDownload={handleChartDownload}
              formatCurrency={formatCurrency}
            />
          </div>
        ) : (
          <Container padding="2rem" style={{ textAlign: 'center' }}>
            {t('common.noData')}
          </Container>
        )}
      </Panel>

      {/* Recent Activity */}
      <DataTable
        title={t('dashboard.recentActivity')}
        icon={<FiClipboard size={20} />}
        data={partsData}
        columns={partsColumns}
        accent="gradient"
        variant="elevated"
        compact
        pagination={true}
        pageSize={5}
        loading={loading}
        emptyMessage={t('common.noData')}
      />

    </PageContainer>
  );
};

export default AdminDashboard; 