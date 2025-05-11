import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Container, Card } from '../components/Container';
import PageContainer from '../components/PageContainer';
import Panel from '../components/Panel';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { GridLayout, GridCard } from '../components/GridLayout';
import { FormContainer, Input, FormActions } from '../components/FormElements';
import { Button } from '../components/Button';
import { 
  FiTool, FiDollarSign, 
  FiPlus, FiClipboard,
  FiAlertCircle, FiCheckCircle,
  FiLoader
} from 'react-icons/fi';
import { 
  getUserParts, 
  enterPart, 
  getUserEntriesAndBonus,
  getUserBonus
} from '../utils/api';
import AuthContext from '../contexts/AuthContext';
import styled from 'styled-components';
import { useTranslationWithForceUpdate } from '../hooks/useTranslationWithForceUpdate';

// Create a global window variable to prevent multiple fetches
// This persists across component renders and remounts
if (typeof window !== 'undefined') {
  window.__DASHBOARD_STATE = window.__DASHBOARD_STATE || {
    hasFetched: false,
    isFetching: false,
    userId: null,
    disableFetching: false,
    fetchCount: 0
  };
}

// Disable all future fetches - extreme measure to break fetch cycles
function disableAllFetches() {
  if (typeof window !== 'undefined') {
    window.__DASHBOARD_STATE.disableFetching = true;
  }
}

// Full-screen loading spinner overlay
const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: ${props => props.theme.colors.background.card};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.xl};
  box-shadow: ${props => props.theme.shadows.lg};
  
  svg {
    animation: spin 1.5s linear infinite;
    color: ${props => props.theme.colors.primary.main};
    font-size: 2.5rem;
  }
  
  p {
    margin-top: ${props => props.theme.spacing.md};
    color: ${props => props.theme.colors.text.primary};
    font-weight: 500;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Alert banner component for errors/success messages
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

// User dashboard component
const UserDashboard = () => {
  const { t, currentLanguage } = useTranslationWithForceUpdate();
  const { currentUser } = useContext(AuthContext);
  const [partId, setPartId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  const [forceRefresh, setForceRefresh] = useState(0);
  const initialFetchDone = useRef(false);
  
  // Update component when language changes
  useEffect(() => {
    console.log(`Language in UserDashboard changed to: ${currentLanguage}`);
    
    // Always reset window state when language changes
    if (window.__DASHBOARD_STATE) {
      window.__DASHBOARD_STATE.hasFetched = false;
      window.__DASHBOARD_STATE.fetchCount = 0;
      console.log("Reset dashboard state due to language change");
    }
    
    // If we have a user ID, force a refresh regardless of previous state
    if (currentUser?.id) {
      console.log(`Language changed with active user (${currentUser.id}), triggering full refresh`);
      
      // Clear any existing entries and show loading
      setRecentEntries([]);
      setLoading(true);
      
      // Force complete refresh
      setTimeout(() => {
        initializeDashboard(true);
      }, 100);
    }
  }, [currentLanguage, currentUser?.id]);
  
  // Default stat cards
  const [userStats, setUserStats] = useState([
    {
      icon: <FiTool size={24} />,
      label: t('dashboard.partsEntered'),
      value: '0',
      iconColor: 'primary'
    },
    {
      icon: <FiDollarSign size={24} />,
      label: t('dashboard.currentBonus'),
      value: '$0.00',
      trend: 0,
      trendLabel: 'this week',
      gradientValue: true
    },
    {
      icon: <FiCheckCircle size={24} />,
      label: t('dashboard.paidBonus'),
      value: '$0.00',
      iconColor: 'success',
      gradientValue: false
    }
  ]);
  const [alert, setAlert] = useState(null);
  
  // Initialize the dashboard with data
  const initializeDashboard = async (force = false) => {
    // Critical conditions to prevent fetch cycles
    if (!currentUser?.id) {
      console.error("No current user ID available");
      setLoading(false);
      return;
    }
    
    console.log(`[${currentLanguage}] Initializing dashboard for user ${currentUser.id}, force=${force}`);
    setLoading(true);
    
    try {
      // Get all data in parallel - with safety fallbacks
      let parts = [];
      let entriesBonus = { entriesCount: 0, bonusAmount: 0 };
      let bonusData = { totalBonus: 0, pendingBonus: 0, paidBonus: 0 };
      
      try {
        const partsData = await getUserParts(currentUser.id);
        if (partsData && Array.isArray(partsData)) {
          parts = partsData;
          console.log(`Successfully fetched ${parts.length} parts`);
        } else {
          console.warn("getUserParts returned invalid data:", partsData);
        }
      } catch (error) {
        console.error("Error fetching parts:", error);
      }
      
      try {
        const entriesBonusData = await getUserEntriesAndBonus(currentUser.id);
        if (entriesBonusData) {
          entriesBonus = entriesBonusData;
          console.log("Successfully fetched entries and bonus data:", entriesBonus);
        } else {
          console.warn("getUserEntriesAndBonus returned invalid data:", entriesBonusData);
        }
      } catch (error) {
        console.error("Error fetching entries and bonus:", error);
      }
      
      try {
        const bonusDataResult = await getUserBonus(currentUser.id);
        if (bonusDataResult) {
          bonusData = bonusDataResult;
          console.log("Successfully fetched bonus data:", bonusData);
        } else {
          console.warn("getUserBonus returned invalid data:", bonusDataResult);
        }
      } catch (error) {
        console.error("Error fetching bonus data:", error);
      }
      
      // Format entries for table - with safety checks
      const formattedEntries = Array.isArray(parts) ? parts.map(entry => {
        // Make sure entry is valid
        if (!entry) return null;
        
        return {
          id: entry.id || Math.random().toString(),
          serialNumber: entry.parts?.serial_number || t('common.unknown'),
          date: entry.created_at ? 
            new Date(entry.created_at).toLocaleString(currentLanguage) : 
            t('common.unknown'),
          partName: entry.parts?.name || t('common.unknown'),
          bonus: formatCurrency(1.00)
        };
      }).filter(Boolean) : []; // Filter out any null entries
      
      console.log(`Formatted ${formattedEntries.length} entries for display`);
      setRecentEntries(formattedEntries);
      
      // Update stat cards - with safety checks
      setUserStats([
        {
          icon: <FiTool size={24} />,
          label: t('dashboard.partsEntered'),
          value: formatNumber(entriesBonus?.entriesCount || 0),
          iconColor: 'primary'
        },
        {
          icon: <FiDollarSign size={24} />,
          label: t('dashboard.currentBonus'),
          value: formatCurrency(bonusData?.pendingBonus || 0),
          gradientValue: true
        },
        {
          icon: <FiCheckCircle size={24} />,
          label: t('dashboard.paidBonus'),
          value: formatCurrency(bonusData?.paidBonus || 0),
          iconColor: 'success',
          gradientValue: false
        }
      ]);
      
      console.log("Dashboard initialized successfully");
      
      // Clear any previous errors
      setAlert(null);
      
      // Mark as fetched in the window state
      if (window.__DASHBOARD_STATE) {
        window.__DASHBOARD_STATE.hasFetched = true;
        window.__DASHBOARD_STATE.userId = currentUser.id;
      }
      
      initialFetchDone.current = true;
    } catch (error) {
      console.error('[CRITICAL] Error initializing dashboard:', error);
      setAlert({
        type: 'error',
        message: t('dashboard.fetchError')
      });
    } finally {
      // Always update these states
      if (window.__DASHBOARD_STATE) {
        window.__DASHBOARD_STATE.isFetching = false;
      }
      setLoading(false);
    }
  };
  
  // Single-execution effect for initial data load
  useEffect(() => {
    console.log("Initial data load effect triggered");
    
    // Always load on mount, with a slight delay to ensure all states are ready
    const timer = setTimeout(() => {
      console.log("Executing initial data load");
      initializeDashboard(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentUser?.id]);
  
  // Handle forced refresh from actions (manual refresh)
  useEffect(() => {
    if (forceRefresh > 0 && window.__DASHBOARD_STATE && !window.__DASHBOARD_STATE.disableFetching) {
      console.log('Force refresh triggered:', forceRefresh);
      
      // Reset fetch state for forced refresh
      window.__DASHBOARD_STATE.hasFetched = false;
      
      initializeDashboard(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRefresh]); // Only depend on forceRefresh
  
  // Handle part submission
  const handleSubmitPart = async (e) => {
    e.preventDefault();
    if (!partId || !currentUser || !currentUser.id) return;
    
    setIsSubmitting(true);
    setAlert(null);
    
    try {
      // Call the API to enter the part
      await enterPart(currentUser.id, partId);
      
      // Success
      setAlert({
        type: 'success',
        message: t('enterPart.successMessage', { partId: partId })
      });
      
      // Reset the form
      setPartId('');
      
      // Force refresh
      setForceRefresh(prev => prev + 1);
      
    } catch (error) {
      console.error('Error submitting part:', error);
      
      // Set appropriate error message
      if (error.message.includes('already been entered')) {
        setAlert({
          type: 'warning',
          message: 'This part has already been entered by someone else.'
        });
      } else if (error.message.includes('already entered this part')) {
        setAlert({
          type: 'warning',
          message: 'You have already entered this part before.'
        });
      } else if (error.message.includes('not found')) {
        setAlert({
          type: 'error',
          message: 'Part ID not found. Please check and try again.'
        });
      } else {
        setAlert({
          type: 'error',
          message: 'Failed to submit part. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format numbers for display with proper locale - with robust parsing
  const formatNumber = (num) => {
    // Ensure we're handling strings, numbers, and nullish values correctly
    if (num === null || num === undefined) return '0';
    
    // If it's already a string with non-numeric chars, try to extract the number
    if (typeof num === 'string') {
      // Extract all digits and decimals, ignoring other characters
      const numericValue = num.replace(/[^0-9.]/g, '');
      return new Intl.NumberFormat(currentLanguage).format(parseFloat(numericValue) || 0);
    }
    
    // Handle numeric value directly
    return new Intl.NumberFormat(currentLanguage).format(num);
  };

  // Format currency for display with proper locale - with robust parsing
  const formatCurrency = (amount) => {
    // Ensure we're handling strings, numbers, and nullish values correctly
    if (amount === null || amount === undefined) return new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: 'USD' }).format(0);
    
    // If it's already a formatted string, extract the numeric value
    if (typeof amount === 'string') {
      // Extract numeric value, ignoring currency symbols and other formatting
      const numericValue = amount.replace(/[^0-9.]/g, '');
      return new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: 'USD' }).format(parseFloat(numericValue) || 0);
    }
    
    // Handle numeric value directly
    return new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Update stats with formatting whenever language changes
  useEffect(() => {
    if (initialFetchDone.current) {
      console.log("Updating stats with new language formatting");
      
      // Get current data values from stats (without formatting)
      const partsValue = userStats[0].value;
      const currentBonusValue = userStats[1].value;
      const paidBonusValue = userStats[2].value;
      
      // Parse current values to apply new formatting
      const numPartsEntered = typeof partsValue === 'string' ? parseInt(partsValue.replace(/[^0-9]/g, '')) || 0 : partsValue || 0;
      const currentBonusAmount = typeof currentBonusValue === 'string' ? parseFloat(currentBonusValue.replace(/[^0-9.]/g, '')) || 0 : currentBonusValue || 0; 
      const paidBonusAmount = typeof paidBonusValue === 'string' ? parseFloat(paidBonusValue.replace(/[^0-9.]/g, '')) || 0 : paidBonusValue || 0;
      
      setUserStats(prevStats => [
        { ...prevStats[0], label: t('dashboard.partsEntered'), value: formatNumber(numPartsEntered) },
        { ...prevStats[1], label: t('dashboard.currentBonus'), value: formatCurrency(currentBonusAmount) },
        { ...prevStats[2], label: t('dashboard.paidBonus'), value: formatCurrency(paidBonusAmount) }
      ]);
    }
  }, [currentLanguage, t]);
  
  // Refresh entries formatting when language changes
  useEffect(() => {
    if (recentEntries.length > 0) {
      setRecentEntries(entries => 
        entries.map(entry => ({
          ...entry,
          date: entry.date ? new Date(entry.date.replace(/[^0-9/:\s,-]/g, '')).toLocaleString(currentLanguage) : t('common.unknown'),
          bonus: formatCurrency(1.00)
        }))
      );
    }
  }, [currentLanguage, t]);
  
  // Table columns with memoization
  const entriesColumns = useMemo(() => [
    { key: 'serialNumber', title: t('enterPart.partSerialNumber') },
    { key: 'date', title: t('common.date') },
    { key: 'partName', title: t('enterPart.title') },
    { key: 'bonus', title: t('bonusReports.bonusAmount') }
  ], [t]);

  return (
    <PageContainer
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="0.75rem"
      padding="0.5rem"
    >
      {/* Global loading spinner */}
      {loading ? (
        <LoadingOverlay>
          <SpinnerWrapper>
            <FiLoader size={40} />
            <p>{t('common.loading')}</p>
          </SpinnerWrapper>
        </LoadingOverlay>
      ) : (
        <>
          {/* Alert banner */}
          {alert && (
            <AlertBanner type={alert.type}>
              <span className="icon"><FiAlertCircle size={20} /></span>
              <div>{alert.message}</div>
            </AlertBanner>
          )}
          
          {/* Stats section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>
              {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString(currentLanguage)}
            </div>
            <Button 
              onClick={() => {
                window.__DASHBOARD_STATE.hasFetched = false;
                setForceRefresh(prev => prev + 1);
              }} 
              variant="outline" 
              size="sm" 
              icon={<FiLoader size={16} />}
            >
              {t('common.refreshData')}
            </Button>
          </div>
          
          <GridLayout columns={12} gap="0.75rem" mobileGap="0.25rem">
            {userStats.map((stat, index) => (
              <GridCard key={index} colSpan={4}>
                <StatCard {...stat} />
              </GridCard>
            ))}
          </GridLayout>

          <Panel
            title={t('enterPart.title')}
            icon={<FiPlus size={20} />}
            variant="elevated"
            accent="primary"
            gradientHeader
            compact
          >
            <FormContainer onSubmit={handleSubmitPart}>
              <Input
                label={t('enterPart.partSerialNumber')}
                name="partId"
                placeholder={t('enterPart.serialNumberPlaceholder')}
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                helper={t('enterPart.helper')}
              />
              
              <FormActions>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  fullWidth
                  loading={isSubmitting}
                  loadingText={t('common.loading')}
                  disabled={!partId}
                >
                  {t('common.submit')}
                </Button>
              </FormActions>
            </FormContainer>
          </Panel>

          {/* Main content grid */}
          <Container columns={3} padding="0" gap="0.75rem">
            {/* Part entry form */}
            <Container padding="0" colSpan={3}>
              <DataTable
                key={`recent-entries-${currentLanguage}`}
                title={t('dashboard.recentActivity')}
                icon={<FiClipboard size={20} />}
                data={recentEntries}
                columns={entriesColumns}
                accent="gradient"
                variant="elevated"
                compact
                pagination={true}
                pageSize={5}
                loading={false}
                emptyMessage={t('common.noData')}
              />
            </Container>
          </Container>
        </>
      )}
    </PageContainer>
  );
};

export default UserDashboard; 