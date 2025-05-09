import React, { useState } from 'react';
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
} from 'react-icons/fi';

const UserDashboard = () => {
  const [partId, setPartId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Mock function to handle part submission
  const handleSubmitPart = (e) => {
    e.preventDefault();
    if (!partId) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setPartId('');
      // You would typically update your data here
    }, 1000);
  };
  
  // Mock user stats
  const userStats = [
    {
      icon: <FiTool size={24} />,
      label: 'Parts Entered',
      value: '47',
      trend: 12.5,
      trendLabel: 'this week',
      iconColor: 'primary'
    },
    {
      icon: <FiDollarSign size={24} />,
      label: 'Current Bonus',
      value: '$47',
      trend: 12.5,
      trendLabel: 'this week',
      gradientValue: true
    }
  ];
  
  // Mock table data
  const recentEntries = [
    { id: 1, partId: 'PN-12345', date: '2023-10-20 14:23', status: 'completed', bonus: '$1.00' },
    { id: 2, partId: 'PN-12346', date: '2023-10-19 09:45', status: 'completed', bonus: '$1.00' },
    { id: 3, partId: 'PN-12347', date: '2023-10-18 16:12', status: 'completed', bonus: '$1.00' },
    { id: 4, partId: 'PN-12348', date: '2023-10-18 10:36', status: 'completed', bonus: '$1.00' },
    { id: 5, partId: 'PN-12349', date: '2023-10-17 11:52', status: 'completed', bonus: '$1.00' }
  ];
  
  // Table columns
  const entriesColumns = [
    { key: 'partId', title: 'Part ID' },
    { key: 'date', title: 'Date & Time' },
    { key: 'status', title: 'Status', type: 'status' },
    { key: 'bonus', title: 'Bonus' }
  ];

  return (
    <PageContainer
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="0.75rem"
      padding="0.5rem"
    >
      {/* Stats section */}
      <GridLayout columns={12} gap="0.75rem" mobileGap="0.25rem">
        {userStats.map((stat, index) => (
          <GridCard key={index} colSpan={3}>
            <StatCard {...stat} />
          </GridCard>
        ))}
          <GridCard colSpan={6} padding="0">
          <Panel
            title="Enter Spare Part"
            icon={<FiPlus size={20} />}
            variant="elevated"
            accent="primary"
            gradientHeader
            compact
          >
            <FormContainer onSubmit={handleSubmitPart}>
              <Input
                label="Part ID"
                name="partId"
                placeholder="e.g., PN-12345"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                helper="Enter the spare part ID to earn a $1 bonus"
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
          />
          
      
        </Container>
      </Container>
    </PageContainer>
  );
};

export default UserDashboard; 