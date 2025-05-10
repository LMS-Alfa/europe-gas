import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { getAllUserParts, getAllProfiles, getAllUserBonuses } from '../../utils/api';
import { downloadElementAsImage, exportReport } from '../../utils/exports';
import {
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line,
  ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import { FiDownload, FiFilter, FiRefreshCw, FiBarChart2, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ReportTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background};
  
  th {
    padding: ${props => props.theme.spacing.md};
    text-align: left;
    font-weight: ${props => props.theme.typography.fontWeight.medium};
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.background};
  }
  
  td {
    padding: ${props => props.theme.spacing.md};
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const FilterBar = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  flex: 1;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Button = styled.button`
  padding: ${props => `${props.theme.spacing.md} ${props.theme.spacing.lg}`};
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  cursor: pointer;
  transition: background-color ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const SummaryCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SummaryTitle = styled.h4`
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const SummaryValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

// New styled components for improved UI
const ChartControls = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.primary};
  }
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

// Mobile optimized ChartContainer
const ChartContainer = styled.div`
  height: 400px;
  width: 100%;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.md};
    height: 350px;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing.sm};
    height: 300px;
  }
`;

// Define consistent color scheme
const COLORS = {
  primary: '#1e88e5',
  secondary: '#26a69a',
  success: '#66bb6a',
  warning: '#ffa726',
  error: '#ef5350',
  purple: '#7e57c2',
  indigo: '#5c6bc0',
  pink: '#ec407a'
};

const CHART_COLORS = [
  COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, 
  COLORS.error, COLORS.purple, COLORS.indigo, COLORS.pink
];

const PIE_COLORS = [COLORS.warning, COLORS.success];

// Custom tooltip components
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div 
      style={{ 
        background: 'white', 
        padding: '8px 12px', 
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
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

// Animation configurations
const barChartAnimationProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5 }
};

// Update quarters to include 'All' option
const quarters = ['All', 'Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];
const statuses = ['All', 'Pending', 'Paid'];

const ChartPlaceholder = styled.div`
  width: 100%;
  height: 80%;
  background-color: ${props => `${props.theme.colors.primary}10`};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

// Payment status badge
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  gap: 0.25rem;
  background-color: ${props => 
    props.status === 'Paid' ? `${props.theme.colors.success}20` : 
    `${props.theme.colors.warning}20`};
  color: ${props => 
    props.status === 'Paid' ? props.theme.colors.success : 
    props.theme.colors.warning};
`;

// Date picker container for payment date
const DatePickerContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  gap: 0.5rem;
`;

const DateInput = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
`;

const BonusReports = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [reportData, setReportData] = useState([]);
  const [userBonuses, setUserBonuses] = useState([]);
  const [userParts, setUserParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all entered parts
        const partsData = await getAllUserParts();
        setUserParts(partsData || []);
        
        // Fetch all user bonuses
        const bonusData = await getAllUserBonuses();
        setUserBonuses(bonusData || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Process data when bonuses or parts change, or when filters are applied
  useEffect(() => {
    generateReportData();
  }, [userBonuses, userParts, selectedQuarter, selectedStatus]);
  
  const generateReportData = () => {
    if (userBonuses.length === 0 || userParts.length === 0) return;
    
    console.log('Processing bonus data with:', { 
      userBonusesCount: userBonuses.length, 
      userPartsCount: userParts.length 
    });
    
    // Group parts by user and quarter
    const userPartsByQuarter = {};
    
    userParts.forEach(part => {
      if (!part.user_id) return;
      
      // Get quarter from part date
      const date = new Date(part.created_at);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
      
      const key = `${part.user_id}_${quarter}`;
      
      if (!userPartsByQuarter[key]) {
        // Get user name from related profile data
        let userName = 'Unknown User';
        if (part.profiles) {
          userName = `${part.profiles.firstName || ''} ${part.profiles.lastName || ''}`.trim();
        }
        
        userPartsByQuarter[key] = {
          userId: part.user_id,
          userName,
          quarter,
          count: 0,
          parts: []
        };
      }
      
      userPartsByQuarter[key].count++;
      userPartsByQuarter[key].parts.push(part);
    });
    
    console.log('Generated user parts by quarter:', userPartsByQuarter);
    
    // Generate report data
    const report = Object.values(userPartsByQuarter).map(entry => {
      // Find user in bonuses data
      const userBonus = userBonuses.find(bonus => bonus.userId === entry.userId);
      
      return {
        id: `${entry.userId}_${entry.quarter}`,
        user: entry.userName,
        email: userBonus?.email || 'N/A',
        quarter: entry.quarter,
        partsEntered: entry.count,
        bonusAmount: `$${entry.count}`, // $1 per part
        status: 'Pending', // All bonuses are pending for now
        paid: false,
        paymentDate: null
      };
    });
    
    console.log('Generated report data:', report);
    
    // Apply filters
    let filteredData = report;
    
    if (selectedQuarter !== 'All') {
      filteredData = filteredData.filter(item => item.quarter === selectedQuarter);
    }
    
    if (selectedStatus !== 'All') {
      filteredData = filteredData.filter(item => 
        selectedStatus === 'Paid' ? item.paid : !item.paid
      );
    }
    
    console.log('Filtered report data:', filteredData);
    setReportData(filteredData);
  };
  
  const handleFilter = () => {
    generateReportData();
  };
  
  // Enhanced function to handle marking a bonus as paid
  const handleMarkAsPaid = (item) => {
    setSelectedPayment(item);
    setShowPaymentModal(true);
  };
  
  // Function to confirm payment with date
  const confirmPayment = () => {
    // In a real implementation, this would update a bonus_payments table
    // For now, just update the UI state
    const updatedReportData = reportData.map(report => {
      if (report.id === selectedPayment.id) {
        return { 
          ...report, 
          status: 'Paid',
          paid: true,
          paymentDate
        };
      }
      return report;
    });
    
    setReportData(updatedReportData);
    
    // Display a notification
    alert(`Marked bonus payment for ${selectedPayment.user} as paid: ${selectedPayment.bonusAmount} on ${paymentDate}`);
    
    // In a real implementation, we would call createBonusPayment here
    console.log('Would create bonus payment record for:', {
      ...selectedPayment,
      paymentDate
    });
    
    // Reset modal state
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };
  
  // Function to cancel payment
  const cancelPayment = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };
  
  const calculateTotals = () => {
    const totalUsers = new Set(reportData.map(item => item.user)).size;
    const totalParts = reportData.reduce((sum, item) => sum + item.partsEntered, 0);
    const totalBonus = reportData.reduce((sum, item) => sum + parseInt(item.bonusAmount.replace('$', '') || 0), 0);
    
    return {
      users: totalUsers,
      parts: totalParts,
      bonus: `$${totalBonus}`,
    };
  };
  
  const totals = calculateTotals();
  
  // Download chart using the utility
  const handleChartDownload = useCallback((chartId, fileName) => {
    downloadElementAsImage(chartId, fileName);
  }, []);
  
  // Handle exporting the report as CSV
  const handleExportReport = useCallback(() => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Format report data for CSV
    const formattedData = reportData.map(item => ({
      User: item.user,
      Email: item.email,
      Quarter: item.quarter,
      'Parts Entered': item.partsEntered,
      'Bonus Amount': item.bonusAmount,
      Status: item.status
    }));
    
    // Export using utility
    exportReport(
      formattedData, 
      'bonus', 
      `${selectedQuarter !== 'All' ? selectedQuarter : 'all_quarters'}_${selectedStatus.toLowerCase()}`
    );
  }, [reportData, selectedQuarter, selectedStatus]);
  
  // Memoized data preparation for better performance
  const barChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    // Group by user and calculate total bonuses per user
    const userTotals = {};
    
    reportData.forEach(item => {
      if (!userTotals[item.user]) {
        userTotals[item.user] = 0;
      }
      userTotals[item.user] += parseFloat(item.bonusAmount.replace('$', ''));
    });
    
    // Convert to array format for the chart
    return Object.keys(userTotals)
      .map(user => ({
        name: user,
        bonus: userTotals[user]
      }))
      .sort((a, b) => b.bonus - a.bonus)
      .slice(0, 8); // Show top 8 users
  }, [reportData]);
  
  const pieChartData = useMemo(() => {
    if (!reportData || reportData.length === 0) return [];
    
    let pendingTotal = 0;
    let paidTotal = 0;
    
    reportData.forEach(item => {
      const amount = parseFloat(item.bonusAmount.replace('$', ''));
      if (item.paid) {
        paidTotal += amount;
      } else {
        pendingTotal += amount;
      }
    });
    
    return [
      { name: 'Pending', value: pendingTotal },
      { name: 'Paid', value: paidTotal }
    ];
  }, [reportData]);
  
  const quarterlyTrendData = useMemo(() => {
    if (userParts.length === 0) return [];
    
    // Identify all quarters from parts data
    const quarterData = {};
    
    userParts.forEach(part => {
      if (!part.created_at) return;
      
      const date = new Date(part.created_at);
      const quarter = `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
      
      if (!quarterData[quarter]) {
        quarterData[quarter] = {
          quarter,
          partsCount: 0,
          bonusTotal: 0
        };
      }
      
      quarterData[quarter].partsCount++;
      quarterData[quarter].bonusTotal++; // $1 per part
    });
    
    // Convert to array and sort by date
    return Object.values(quarterData)
      .sort((a, b) => {
        // Extract year and quarter number for sorting
        const [, qNumA, yearA] = a.quarter.match(/Q(\d+) (\d+)/);
        const [, qNumB, yearB] = b.quarter.match(/Q(\d+) (\d+)/);
        
        // Compare years first, then quarters
        if (yearA !== yearB) return Number(yearA) - Number(yearB);
        return Number(qNumA) - Number(qNumB);
      });
  }, [userParts]);
  
  const scatterData = useMemo(() => {
    if (!userBonuses || userBonuses.length === 0) return [];
    
    // Create data points for each user
    return userBonuses.map(user => ({
      name: user.userName,
      x: user.totalParts, // x-axis: parts entered
      y: user.totalBonus, // y-axis: bonus amount
      z: user.totalParts / Math.max(1, userBonuses.length) * 10, // z-axis (bubble size): relative proportion
    }));
  }, [userBonuses]);
  
  return (
    <Container>
      <title>Bonus Reports</title>
      
      {/* Payment confirmation modal */}
      {showPaymentModal && selectedPayment && (
        <Card
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ 
            position: 'fixed', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            width: '400px',
            maxWidth: '90%'
          }}
        >
          <h3>Confirm Payment</h3>
          <p>
            You are about to mark the following bonus as paid:
          </p>
          <div style={{ margin: '1rem 0' }}>
            <strong>User:</strong> {selectedPayment.user}<br />
            <strong>Quarter:</strong> {selectedPayment.quarter}<br />
            <strong>Amount:</strong> {selectedPayment.bonusAmount}<br />
          </div>
          
          <DatePickerContainer>
            <label htmlFor="payment-date">Payment Date:</label>
            <DateInput
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </DatePickerContainer>
          
          <ButtonGroup>
            <Button onClick={cancelPayment} style={{ backgroundColor: '#bdbdbd' }}>
              Cancel
            </Button>
            <Button onClick={confirmPayment} style={{ backgroundColor: '#4caf50' }}>
              Confirm Payment
            </Button>
          </ButtonGroup>
        </Card>
      )}
      
      {/* Overlay for modal */}
      {showPaymentModal && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            zIndex: 999 
          }}
          onClick={cancelPayment}
        />
      )}
      
      <Section>
        <Title>Bonus Reports</Title>
        <Card>
          <FilterBar>
            <Select 
              value={selectedQuarter} 
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              {quarters.map(quarter => (
                <option key={quarter} value={quarter}>{quarter}</option>
              ))}
            </Select>
            
            <Select 
              value={selectedStatus} 
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
            
            <Button onClick={handleFilter}>
              <FiFilter size={16} style={{ marginRight: '6px' }} />
              Apply Filters
            </Button>
          </FilterBar>
        </Card>
      </Section>
      
      <Section>
        <SummaryGrid>
          <SummaryCard color={totals.users > 0 ? COLORS.primary : '#bdbdbd'}>
            <SummaryTitle>Total Users</SummaryTitle>
            <SummaryValue>{loading ? 'Loading...' : totals.users}</SummaryValue>
          </SummaryCard>
          
          <SummaryCard color={totals.parts > 0 ? COLORS.secondary : '#bdbdbd'}>
            <SummaryTitle>Total Parts Entered</SummaryTitle>
            <SummaryValue>{loading ? 'Loading...' : totals.parts}</SummaryValue>
          </SummaryCard>
          
          <SummaryCard color={parseFloat(totals.bonus.replace('$', '')) > 0 ? COLORS.success : '#bdbdbd'}>
            <SummaryTitle>Total Bonus Amount</SummaryTitle>
            <SummaryValue>{loading ? 'Loading...' : totals.bonus}</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </Section>
      
      <Section>
        <Card>
          <h3>Quarterly Bonus Trends</h3>
          <ChartControls>
            <IconButton
              onClick={() => handleChartDownload('quarterly-chart', 'quarterly_bonus_trends')}
              title="Download Chart"
            >
              <FiDownload size={18} />
            </IconButton>
          </ChartControls>
          <ChartContainer>
            {loading ? (
              <p>Loading chart data...</p>
            ) : quarterlyTrendData.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  id="quarterly-chart"
                  data={quarterlyTrendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="quarter" 
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    label={{ 
                      value: 'Bonus Amount ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12 }
                    }}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right" 
                    label={{ 
                      value: 'Part Count', 
                      angle: 90, 
                      position: 'insideRight',
                      style: { textAnchor: 'middle', fontSize: 12 }
                    }}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    content={<CustomTooltip 
                      formatter={(value, name) => {
                        if (name === 'bonusTotal') return `$${value}`;
                        return value;
                      }}
                    />} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="bonusTotal" 
                    name="Total Bonuses" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    activeDot={{ r: 8, fill: COLORS.primary }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="partsCount" 
                    name="Parts Entered" 
                    stroke={COLORS.success}
                    strokeWidth={2}
                    activeDot={{ r: 6, fill: COLORS.success }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                    animationBegin={300}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage>
                <FiBarChart2 size={48} />
                <p>Not enough quarterly data available for trend analysis</p>
              </NoDataMessage>
            )}
          </ChartContainer>
        </Card>
      </Section>
      
      <Section>
        <Card>
          <h3>Bonus Distribution By User</h3>
          <ChartControls>
            <IconButton
              onClick={() => handleChartDownload('bar-chart', 'bonus_distribution')}
              title="Download Chart"
            >
              <FiDownload size={18} />
            </IconButton>
          </ChartControls>
          <ChartContainer>
            {loading ? (
              <p>Loading chart data...</p>
            ) : barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  id="bar-chart"
                  data={barChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  barSize={30}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70}
                    interval={0}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <YAxis 
                    label={{ 
                      value: 'Bonus Amount ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 12 }
                    }}
                    tick={{ fontSize: 12 }}
                    tickLine={{ stroke: '#e0e0e0' }}
                    axisLine={{ stroke: '#e0e0e0' }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    content={<CustomTooltip 
                      formatter={(value) => `$${value}`}
                    />} 
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar 
                    dataKey="bonus" 
                    name="Bonus Amount" 
                    fill={COLORS.primary}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CHART_COLORS[index % CHART_COLORS.length]} 
                      />
                    ))}
                    <LabelList 
                      dataKey="bonus" 
                      position="top" 
                      formatter={(value) => `$${value}`}
                      style={{ fontSize: 12, fill: '#666' }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage>
                <FiBarChart2 size={48} />
                <p>No data available for selected filters</p>
              </NoDataMessage>
            )}
          </ChartContainer>
        </Card>
      </Section>
      
      <Section>
        <Card>
          <h3>Pending vs Paid Bonuses</h3>
          <ChartControls>
            <IconButton
              onClick={() => handleChartDownload('pie-chart', 'pending_vs_paid')}
              title="Download Chart"
            >
              <FiDownload size={18} />
            </IconButton>
          </ChartControls>
          <ChartContainer>
            {loading ? (
              <p>Loading chart data...</p>
            ) : reportData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart id="pie-chart">
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={<CustomTooltip 
                      formatter={(value) => `$${value}`}
                    />} 
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <NoDataMessage>
                <FiBarChart2 size={48} />
                <p>No data available for selected filters</p>
              </NoDataMessage>
            )}
          </ChartContainer>
        </Card>
      </Section>
      
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Bonus Report Details</h3>
        
        {loading ? (
          <p>Loading report data...</p>
        ) : reportData.length > 0 ? (
          <ReportTable>
            <TableHead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Quarter</th>
                <th>Parts Entered</th>
                <th>Bonus Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </TableHead>
            <TableBody>
              {reportData.map(item => (
                <tr key={item.id}>
                  <td>{item.user}</td>
                  <td>{item.email}</td>
                  <td>{item.quarter}</td>
                  <td>{item.partsEntered}</td>
                  <td>{item.bonusAmount}</td>
                  <td>
                    <StatusBadge status={item.paid ? 'Paid' : 'Pending'}>
                      {item.paid ? (
                        <><FiCheckCircle size={14} /> Paid</>
                      ) : (
                        <><FiClock size={14} /> Pending</>
                      )}
                    </StatusBadge>
                  </td>
                  <td>{item.paymentDate || '-'}</td>
                  <td>
                    <Button 
                      style={{ 
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: item.paid ? '#bdbdbd' : '#4caf50'
                      }}
                      disabled={item.paid}
                      onClick={() => handleMarkAsPaid(item)}
                    >
                      {item.paid ? 'Paid' : 'Mark as Paid'}
                    </Button>
                  </td>
                </tr>
              ))}
            </TableBody>
          </ReportTable>
        ) : (
          <p>No bonus data available for the selected filters.</p>
        )}
        
        <ButtonGroup>
          <Button 
            style={{ backgroundColor: '#5c6bc0' }}
            onClick={handleExportReport}
          >
            Export Report
          </Button>
        </ButtonGroup>
      </Card>
    </Container>
  );
};

export default BonusReports; 