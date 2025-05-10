import React from 'react';
import { Container, FlexContainer, GridContainer } from './Container';
import PageContainer from './PageContainer';
import Panel from './Panel';
import StatCard from './StatCard';
import DataTable from './DataTable';
import { GridLayout, GridCard } from './GridLayout';
import { FormContainer, Input, FormActions } from './FormElements';
import { Button } from './Button';
import { 
  FiFileText, FiDollarSign, FiTool, FiUsers, 
  FiTrendingUp, FiClipboard, FiPlus 
} from 'react-icons/fi';

/**
 * Dashboard template demonstrating proper component usage with containers
 * This can be used as a reference for building pages with the design system
 */
const DashboardTemplate = ({ 
  title = "Dashboard",
  stats = [],
  tableData = [],
  tableColumns = [],
  quickActionPanel = true
}) => {
  return (
    <PageContainer
      title={title}
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="1.5rem"
    >
      {/* Welcome section */}
      <Panel 
        variant="glass" 
        accent="gradient"
      >
        <FlexContainer
          flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          padding="0"
        >
          <div>
            <h1 style={{ marginTop: 0 }}>{title}</h1>
            <p>Welcome back! Here's what's happening with your spare parts today.</p>
          </div>
          <Button 
            variant="gradient" 
            leftIcon={<FiFileText size={16} />}
          >
            Download Report
          </Button>
        </FlexContainer>
      </Panel>

      {/* Stats section */}
      <GridLayout columns={12} gap="1rem" mobileGap="0.5rem">
        {stats.length > 0 ? (
          stats.map((stat, index) => (
            <GridCard key={index} colSpan={3}>
              <StatCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                trend={stat.trend}
                trendLabel={stat.trendLabel}
                gradientValue={stat.gradient}
                iconColor={stat.iconColor}
              />
            </GridCard>
          ))
        ) : (
          // Default stats if none provided
          <>
            <GridCard colSpan={3}>
              <StatCard 
                icon={<FiDollarSign size={24} />}
                label="Total Bonuses"
                value="$4,250"
                trend={8.2}
                trendLabel="vs last month"
                gradientValue
              />
            </GridCard>
            <GridCard colSpan={3}>
              <StatCard 
                icon={<FiTool size={24} />}
                label="Parts Entered"
                value="1,423"
                trend={-2.3}
                trendLabel="vs last month"
              />
            </GridCard>
            <GridCard colSpan={3}>
              <StatCard 
                icon={<FiUsers size={24} />}
                label="Active Users"
                value="37"
                trend={12.5}
                trendLabel="vs last month"
                iconColor="secondary"
              />
            </GridCard>
            <GridCard colSpan={3}>
              <StatCard 
                icon={<FiTrendingUp size={24} />}
                label="Completion Rate"
                value="92%"
                trend={3.1}
                trendLabel="vs last month"
                iconColor="success"
              />
            </GridCard>
          </>
        )}
      </GridLayout>

      {/* Main content section */}
      <Container 
        grid 
        gridCols={quickActionPanel ? 3 : 1}
        padding="0"
      >
        {/* Data table section - spans 2 columns */}
        <Container 
          gridCols={2} 
          padding="0" 
          style={{ gridColumn: '1 / 3' }}
        >
          <DataTable
            title="Recent Part Entries"
            icon={<FiClipboard size={20} />}
            data={tableData.length > 0 ? tableData : [
              { id: 1, partId: 'PN-12345', status: 'completed', date: '2023-10-15', user: 'John Smith' },
              { id: 2, partId: 'PN-12346', status: 'pending', date: '2023-10-16', user: 'Jane Doe' },
              { id: 3, partId: 'PN-12347', status: 'completed', date: '2023-10-17', user: 'John Smith' },
              { id: 4, partId: 'PN-12348', status: 'failed', date: '2023-10-18', user: 'Bob Johnson' }
            ]}
            columns={tableColumns.length > 0 ? tableColumns : [
              { key: 'partId', title: 'Part ID' },
              { key: 'status', title: 'Status', type: 'status' },
              { key: 'date', title: 'Date' },
              { key: 'user', title: 'Entered By' }
            ]}
            accent="gradient"
            variant="elevated"
          />
        </Container>

        {/* Quick action panel - if enabled */}
        {quickActionPanel && (
          <Container padding="0">
            <Panel 
              title="Quick Part Entry" 
              icon={<FiPlus size={20} />}
              accent="primary"
              variant="elevated"
              gradientHeader
            >
              <FormContainer>
                <Input 
                  label="Part ID"
                  placeholder="Enter part ID"
                  helper="Enter the part ID to record it in the system"
                />
                <FormActions>
                  <Button variant="primary" fullWidth>Submit</Button>
                </FormActions>
              </FormContainer>
            </Panel>
          </Container>
        )}
      </Container>
    </PageContainer>
  );
};

export default DashboardTemplate; 