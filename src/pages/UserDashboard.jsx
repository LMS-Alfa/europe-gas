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
  FiLoader, FiCamera, FiBarChart2
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
import ImageCapture from '../components/ImageCapture';
import BarcodeScanner from 'react-qr-barcode-scanner';
import toast, { Toaster } from 'react-hot-toast';

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
  const [scannerActive, setScannerActive] = useState(false);
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
      
      // Mark as fetched in the window state
      if (window.__DASHBOARD_STATE) {
        window.__DASHBOARD_STATE.hasFetched = true;
        window.__DASHBOARD_STATE.userId = currentUser.id;
      }
      
      initialFetchDone.current = true;
    } catch (error) {
      console.error('[CRITICAL] Error initializing dashboard:', error);
      toast.error(t('dashboard.fetchError', 'Failed to load dashboard data.'));
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
    if (!partId || !currentUser || !currentUser.id) {
      toast.warn(t('enterPart.scanBarcode', 'Please scan the part barcode.'));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Pass null for the selfie parameter since it's no longer required
      await enterPart(currentUser.id, partId, null);
      
      toast.success(t('enterPart.successMessage', { partId: partId }));
      
      setPartId('');
      setForceRefresh(prev => prev + 1);
      
    } catch (error) {
      console.error('Error submitting part:', error);
      let errorMessage = t('enterPart.submitError', 'Failed to submit part. Please try again.');
      if (error.message) {
        if (error.message.includes('already been entered')) {
          errorMessage = t('enterPart.errorAlreadyEntered', 'This part has already been entered by someone else.');
        } else if (error.message.includes('already entered this part')) {
          errorMessage = t('enterPart.errorUserAlreadyEntered', 'You have already entered this part before.');
        } else if (error.message.includes('not found')) {
          errorMessage = t('enterPart.errorNotFound', 'Part ID not found. Please check and try again.');
        } else if (error.message.includes('Failed to upload selfie')) {
          errorMessage = t('enterPart.errorSelfieUpload', 'Failed to upload selfie. Please try again.');
        } else {
          // Keep a more generic error for unknown issues, or use error.message directly if safe
          errorMessage = error.message; // Or a generic translated message
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Format numbers for display with proper locale - with robust parsing
  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) {
      return '0'; // Default or error value
    }
    
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

  // Removed image capture functionality

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
          {/* Stats section */}
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            containerStyle={{
              zIndex: 99999, // Increased z-index to ensure it's above everything
              top: 70, // Add top margin to position below the header
            }}
            toastOptions={{
              style: {
                background: 'var(--bg-card, #f8f8f8)',
                color: 'var(--text-primary, #333)',
                border: '1px solid var(--border-color, #ccc)',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontSize: '0.95rem',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: 'white',
                },
              },
              duration: 4000,
            }}
          />
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
            style={{ padding: 0 }}
          >
            <FormContainer onSubmit={handleSubmitPart} style={{ padding: 0 }}>
              <div style={{ marginTop: '1rem', padding: '0' }}>
                {!scannerActive ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {partId ? (
                      <div>
                        <div style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '0.5rem',
                          color: 'var(--text-primary, #333)' /* Uses theme variable with fallback */
                        }}>
                          {t('enterPart.partSerialNumber')}:
                        </div>
                        <div style={{ 
                          padding: '0.75rem', 
                          borderRadius: '0.5rem', 
                          border: '1px solid var(--border-color, #ccc)',
                          background: 'var(--bg-card, #f8f8f8)', /* Uses theme variable with fallback */
                          fontSize: '1.1rem',
                          color: 'var(--text-primary, #333)' /* Uses theme variable with fallback */
                        }}>
                          {partId}
                        </div>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          fontSize: '0.875rem', 
                          color: 'var(--text-secondary, #666)' /* Uses theme variable with fallback */
                        }}>
                          {t('enterPart.scannedBarcode')}
                        </div>
                      </div>
                    ) : null}
                    <Button 
                      onClick={() => setScannerActive(true)}
                      variant="outline"
                      icon={<FiBarChart2 size={16} />}
                      fullWidth
                    >
                      {partId ? t('enterPart.rescanBarcode', 'Rescan Barcode') : t('enterPart.scanBarcode', 'Scan Barcode')}
                    </Button>
                  </div>
                ) : (
                  <div>
                    <div style={{ 
                      position: 'relative',
                      border: '1px solid rgba(204, 204, 204, 0.3)', /* Semi-transparent border that works in both light/dark modes */
                      borderRadius: '0.5rem',
                      overflow: 'hidden',
                      width: '100%', /* Full width on mobile */
                      maxWidth: '100%', /* Ensure it takes full available width */
                      margin: '0 auto',
                      background: '#000' /* Black background to hide any gaps */
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '220px', /* Increased height for better aspect ratio */
                        overflow: 'hidden',
                        lineHeight: 0 /* Removes extra space */
                      }}>
                        <BarcodeScanner
                          width={window.innerWidth > 768 ? 600 : window.innerWidth - 40}
                          height={250}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 'auto',
                            minWidth: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block' /* Prevents extra space */
                          }}
                          onUpdate={(err, result) => {
                            if (result) {
                              setPartId(result.text);
                              setScannerActive(false);
                              toast.success(t('enterPart.barcodeDetected', 'Barcode detected!'));
                            }
                          }}
                          onError={(err) => {
                            console.error(err);
                            toast.error(t('enterPart.scannerError', 'Error accessing camera for barcode scanning.'));
                          }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          zIndex: 10
                        }}>
                          <Button
                            onClick={() => setScannerActive(false)}
                            variant="primary"
                            size="sm"
                            style={{ 
                              padding: '0.4rem 0.8rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              background: '#4a90e2',
                              color: 'white',
                              border: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                          >
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      textAlign: 'center', 
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary, #666)', /* Uses theme variable with fallback */
                      width: '100%',
                      margin: '0 auto',
                      padding: '0 1rem'
                    }}>
                      {t('enterPart.scanInstructions', 'Position the barcode horizontally within the frame to scan')}
                    </div>
                  </div>
                )}
              </div>
              
              <FormActions>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  fullWidth
                  loading={isSubmitting}
                  loadingText={t('common.loading')}
                  disabled={!partId || isSubmitting}
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