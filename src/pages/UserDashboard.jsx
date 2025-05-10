import React, { useState, useEffect, useContext } from 'react';
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
  FiAlertCircle
} from 'react-icons/fi';
import { 
  getUserParts, 
  enterPart, 
  getUserEntriesAndBonus 
} from '../utils/api';
import AuthContext from '../contexts/AuthContext';
import styled from 'styled-components';

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

const UserDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [partId, setPartId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentEntries, setRecentEntries] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [alert, setAlert] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch user data and entries
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !currentUser.id) return;
      
      setLoading(true);
      try {
        // Get user's entered parts
        const parts = await getUserParts(currentUser.id);
        
        // Format parts data for table
        const formattedParts = parts.map(entry => ({
          id: entry.id,
          serialNumber: entry.parts?.serial_number || 'Unknown',
          date: new Date(entry.created_at).toLocaleString(),
          partName: entry.parts?.name || 'Unknown Part',
          bonus: '$1.00' // Each part is worth $1
        }));
        
        setRecentEntries(formattedParts);
        
        // Get user's entries count and bonus amount
        const userEntriesBonus = await getUserEntriesAndBonus(currentUser.id);
        
        // Set user stats
        setUserStats([
          {
            icon: <FiTool size={24} />,
            label: 'Parts Entered',
            value: userEntriesBonus.entriesCount.toString(),
            trend: parts.length > 0 ? 
              parts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length :
              0,
            trendLabel: 'this week',
            iconColor: 'primary'
          },
          {
            icon: <FiDollarSign size={24} />,
            label: 'Current Bonus',
            value: userEntriesBonus.bonusAmount,
            trend: parts.length > 0 ? 
              parts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length :
              0,
            trendLabel: 'this week',
            gradientValue: true
          }
        ]);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load your data. Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser, refreshTrigger]);
  
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
        message: `Part ${partId} entered successfully! $1.00 added to your bonus.`
      });
      
      // Reset the form
      setPartId('');
      
      // Refresh the dashboard data
      setRefreshTrigger(prev => prev + 1);
      
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
  
  // Table columns
  const entriesColumns = [
    { key: 'serialNumber', title: 'Serial Number' },
    { key: 'date', title: 'Date & Time' },
    { key: 'partName', title: 'Part Name' },
    { key: 'bonus', title: 'Bonus' }
  ];

  return (
    <PageContainer
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="0.75rem"
      padding="0.5rem"
    >
      {/* Alert banner */}
      {alert && (
        <AlertBanner type={alert.type}>
          <span className="icon"><FiAlertCircle size={20} /></span>
          <div>{alert.message}</div>
        </AlertBanner>
      )}
      
      {/* Stats section */}
      <GridLayout columns={12} gap="0.75rem" mobileGap="0.25rem">
        {userStats.map((stat, index) => (
          <GridCard key={index} colSpan={3}>
            <StatCard {...stat} />
          </GridCard>
        ))}
          <GridCard colSpan={6} padding="0">
          <Panel
            title="Enter Part"
            icon={<FiPlus size={20} />}
            variant="elevated"
            accent="primary"
            gradientHeader
            compact
          >
            <FormContainer onSubmit={handleSubmitPart}>
              <Input
                label="Part Serial Number"
                name="partId"
                placeholder="e.g. : 0 000 000 000 000"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                helper="Enter the part Serial Number to earn a $1 bonus"
              />
              
              <FormActions>
                <Button 
                  type="submit" 
                  variant="gradient" 
                  fullWidth
                  loading={isSubmitting}
                  loadingText="Submitting..."
                  disabled={!partId}
                >
                  Submit
                </Button>
              </FormActions>
            </FormContainer>
          </Panel>
        </GridCard>
      </GridLayout>

      {/* Main content grid */}
      <Container columns={3} padding="0" gap="0.75rem">
        {/* Part entry form */}
        <Container padding="0" colSpan={3}>
          <DataTable
            title="Recent Entries"
            icon={<FiClipboard size={20} />}
            data={recentEntries}
            columns={entriesColumns}
            accent="gradient"
            variant="elevated"
            compact
            pagination={true}
            pageSize={5}
            loading={loading}
            emptyMessage={loading ? "Loading your entries..." : "No entries found"}
          />
          
      
        </Container>
      </Container>
    </PageContainer>
  );
};

export default UserDashboard; 