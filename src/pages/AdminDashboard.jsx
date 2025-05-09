import React, { useState } from 'react';
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
  FiSearch, FiWifi, FiSettings, FiTrash2
} from 'react-icons/fi';

const AdminDashboard = () => {
  // Mock admin stats
  const adminStats = [
    {
      icon: <FiTool size={24} />,
      label: 'Total Parts',
      value: '12,456',
      iconColor: 'primary'
    },
    {
      icon: <FiUsers size={24} />,
      label: 'Active Users',
      value: '37',
      iconColor: 'secondary'
    },
    {
      icon: <FiDollarSign size={24} />,
      label: 'Total Bonuses',
      value: '$12,456',
      gradientValue: true
    },
    {
      icon: <FiBarChart2 size={24} />,
      label: 'Pending Payouts',
      value: '$4,253',
      iconColor: 'error'
    }
  ];
  
  // Mock user data for table
  const usersData = [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', status: 'active', entries: 124, bonus: '$124' },
    { id: 2, name: 'Jane Doe', email: 'jane.doe@example.com', status: 'active', entries: 156, bonus: '$156' },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', status: 'inactive', entries: 67, bonus: '$67' },
    { id: 4, name: 'Lisa Wong', email: 'lisa.wong@example.com', status: 'active', entries: 210, bonus: '$210' },
    { id: 5, name: 'Michael Brown', email: 'michael.b@example.com', status: 'pending', entries: 34, bonus: '$34' }
  ];
  
  // User table columns with actions
  const userColumns = [
    { key: 'name', title: 'Name' },
    { key: 'email', title: 'Email' },
    { key: 'status', title: 'Status', type: 'status' },
    { key: 'entries', title: 'Entries' },
    { key: 'bonus', title: 'Bonus' },
    { 
      key: 'actions', 
      title: 'Actions', 
      type: 'actions',
      width: '120px',
      actions: [
        { 
          icon: <FiEdit size={16} />, 
          label: 'Edit',
          onClick: (row) => console.log('Edit user', row.id) 
        },
        { 
          icon: <FiTrash2 size={16} />, 
          label: 'Delete',
          onClick: (row) => console.log('Delete user', row.id) 
        }
      ]
    }
  ];
  
  // Mock part entries data
  const partsData = [
    { id: 1, partId: 'PN-12345', date: '2023-10-20', user: 'John Smith', status: 'completed' },
    { id: 2, partId: 'PN-12346', date: '2023-10-20', user: 'Jane Doe', status: 'completed' },
    { id: 3, partId: 'PN-12347', date: '2023-10-19', user: 'Lisa Wong', status: 'pending' },
    { id: 4, partId: 'PN-12348', date: '2023-10-19', user: 'John Smith', status: 'completed' },
    { id: 5, partId: 'PN-12349', date: '2023-10-18', user: 'Robert Johnson', status: 'failed' },
    { id: 6, partId: 'PN-12350', date: '2023-10-18', user: 'Michael Brown', status: 'completed' }
  ];
  
  // Parts columns
  const partsColumns = [
    { key: 'partId', title: 'Part ID' },
    { key: 'date', title: 'Date' },
    { key: 'user', title: 'User' },
    { key: 'status', title: 'Status', type: 'status' }
  ];
  
  return (
    <PageContainer
      contentWidth="xl"
      backgroundGradient="blend"
      spacing="1rem"
    >
      {/* Stats cards */}
      <GridLayout columns={12} gap="0.75rem" mobileGap="0.5rem">
        {adminStats.map((stat, index) => (
          <GridCard key={index} colSpan={3}>
            <StatCard {...stat} />
          </GridCard>
        ))}
      </GridLayout>
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
              <Button variant="gradient" size="sm">Add User</Button>
            }
          >
            <Container padding="0">
              <DataTable
                data={usersData}
                columns={userColumns}
                sortable={true}
                pagination={true}
                pageSize={5}
                emptyMessage="No users found"
              />
            </Container>
          </Panel>
        </Container>
        
      </Container>
      
      {/* Recent part entries */}
      <Panel
        title="Recent Part Entries"
        icon="🔧"
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
          onRowClick={(row) => console.log('Clicked row', row.id)}
        />
      </Panel>
    </PageContainer>
  );
};

export default AdminDashboard; 