import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  getAllUserParts, 
  getAllProfiles, 
  getAllUserBonusesByQuarter, 
  getBonusesByQuarter,
  updateBonusPayment,
  getQuarterlyBonusTrends,
  getQuarterFromDate
} from '../../utils/api';
import { downloadElementAsImage, exportReport } from '../../utils/exports';
import {
  BarChart, Bar as RechartsBar, PieChart, Pie, Cell, Tooltip, Legend, 
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, LineChart, Line as RechartsLine,
  ScatterChart, Scatter, ZAxis, LabelList
} from 'recharts';
import { FiDownload, FiFilter, FiRefreshCw, FiBarChart2, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import supabase from '../../utils/supabaseClient';

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ArcElement,
  ChartTooltip,
  ChartLegend
);

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem;
  }
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
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.primary + '10'};
  
  th {
    padding: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    text-align: left;
    color: ${props => props.theme.colors.text.primary};
    border-bottom: 2px solid ${props => props.theme.colors.primary + '40'};
    position: sticky;
    top: 0;
    backdrop-filter: blur(4px);
    
    &:first-child {
      padding-left: ${props => props.theme.spacing.lg};
    }
    
    &:last-child {
      text-align: right;
      padding-right: ${props => props.theme.spacing.lg};
    }
  }
`;



const FilterBar = styled.div`
  display: flex;
  margin-bottom: ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.md};
  background-color: ${props => `${props.theme.colors.background}80`};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  
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
  background-color: ${props => props.theme.colors.surface};
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => `${props.theme.colors.primary}30`};
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
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => `${props.theme.spacing.sm} ${props.theme.spacing.md}`};
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const SummaryCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-left: 4px solid ${props => props.color || props.theme.colors.primary};
  margin-bottom: ${props => props.theme.spacing.lg};
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  }
`;

const SummaryTitle = styled.h4`
  margin-bottom: ${props => props.theme.spacing.xs};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const SummaryValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
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

// Section component for organizing content
const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

// ButtonGroup for organizing action buttons
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${props => props.theme.spacing.md};
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
    
    & > button {
      width: 100%;
    }
  }
`;

// Status badge for payment status
const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: 0.875rem;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: white;
  background-color: ${props => 
    props.status === 'Paid' ? props.theme.colors.success : 
    props.theme.colors.warning};
`;

// Enhance the Badge component with better styling
const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.65rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  &.paid {
    background-color: ${props => props.theme.colors.success};
  }
  
  &.pending {
    background-color: ${props => props.theme.colors.warning};
  }
  
  &.partial {
    background-color: ${props => props.theme.colors.info};
  }
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

// Update quarters to include 'All' option dynamically
const getRecentQuarters = (data = []) => {
  const allQuarters = new Set();
  allQuarters.add('All');
  
  // Add current quarter and the previous 3 quarters as fallback
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  
  // Add current and previous 3 quarters
  for (let i = 0; i < 4; i++) {
    let quarter = currentQuarter - i;
    let year = currentYear;
    
    if (quarter <= 0) {
      quarter += 4;
      year -= 1;
    }
    
    allQuarters.add(`Q${quarter} ${year}`);
  }
  
  // Add any additional quarters from the data
  if (Array.isArray(data) && data.length > 0) {
    data.forEach(item => {
      if (item.quarter && item.year) {
        allQuarters.add(`Q${item.quarter} ${item.year}`);
      }
    });
  }
  
  // Convert to array and sort by year and quarter (most recent first)
  return Array.from(allQuarters)
    .sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      
      const [aQ, aY] = a.split(' ');
      const [bQ, bY] = b.split(' ');
      
      const aYear = parseInt(aY);
      const bYear = parseInt(bY);
      
      if (aYear !== bYear) {
        return bYear - aYear; // Most recent year first
      }
      
      const aQuarter = parseInt(aQ.replace('Q', ''));
      const bQuarter = parseInt(bQ.replace('Q', ''));
      
      return bQuarter - aQuarter; // Most recent quarter first
    });
};

// Fix linter error by ensuring we don't inadvertently use 'with'
const MobileDetailCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.surface};
  
  h4 {
    margin-top: 0;
    margin-bottom: ${props => props.theme.spacing.sm};
    font-size: 1rem;
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px dashed ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.xs} 0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
`;

const DetailValue = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.regular};
  text-align: right;
`;

// Define styled components for responsive views
const DesktopView = styled.div`
  overflow-x: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const MobileView = styled.div`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: block;
  }
`;

const BonusAmount = styled.span`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.isPaid ? props.theme.colors.success : props.theme.colors.text.primary};
  
  ${props => props.isNewParts && `
    font-weight: ${props.theme.typography.fontWeight.bold};
    color: ${props.theme.colors.warning};
  `}
`;

// Improved Button with better hover effects
const ActionButton = styled(Button)`
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

// Enhanced TableBody with the new TableRow component
const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.background};
  }
`;

const TableRow = styled.tr`
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}08`} !important;
  }
  
  &.new-unpaid-parts {
    background-color: ${props => props.theme.colors.warning + '15'};
    border-left: 4px solid ${props => props.theme.colors.warning};
  }
  
  td {
    padding: ${props => props.theme.spacing.md};
    border-bottom: 1px solid ${props => props.theme.colors.border};
    vertical-align: middle;
  }
`;

// Improve the modal styling
const PaymentModal = styled(Card)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 450px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);
  border-radius: ${props => props.theme.borderRadius.lg};
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.primary};
  font-size: 1.5rem;
`;

const ModalInfo = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => `${props.theme.colors.background}90`};
  border-radius: ${props => props.theme.borderRadius.md};
  margin: ${props => props.theme.spacing.md} 0;
`;

const ModalInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${props => props.theme.spacing.xs} 0;
  
  &:not(:last-child) {
    border-bottom: 1px dashed ${props => props.theme.colors.border};
  }
`;

const ModalLabel = styled.strong`
  color: ${props => props.theme.colors.text.secondary};
`;

const ModalValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const PageContainer = styled.div`
  padding: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  margin-bottom: ${props => props.theme.spacing.lg};
  color: ${props => props.theme.colors.text.primary};
  font-size: 1.8rem;
  
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-bottom: ${props => props.theme.spacing.xl};
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: ${props => props.theme.borderRadius.md};
  overflow: hidden;
`;

const TableHeader = styled.thead`
  background-color: ${props => props.theme.colors.primary + '10'};
  
  th {
    padding: ${props => props.theme.spacing.md};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    text-align: left;
    color: ${props => props.theme.colors.text.primary};
    border-bottom: 2px solid ${props => props.theme.colors.primary + '40'};
    position: sticky;
    top: 0;
    backdrop-filter: blur(4px);
    
    &:first-child {
      padding-left: ${props => props.theme.spacing.lg};
    }
    
    &:last-child {
      text-align: right;
      padding-right: ${props => props.theme.spacing.lg};
    }
  }
`;

// Add safer data processing for charts 
const processQuarterlyTrendsData = (bonuses = []) => {
  try {
    // Create a map grouped by quarter
    const quarterMap = {};
    
    if (!Array.isArray(bonuses) || bonuses.length === 0) {
      return {
        quarterLabels: [],
        paidData: [],
        pendingData: []
      };
    }
    
    bonuses.forEach(bonus => {
      const quarterLabel = bonus.quarterLabel || `Q${bonus.quarter || '?'} ${bonus.year || '?'}`;
      
      if (!quarterMap[quarterLabel]) {
        quarterMap[quarterLabel] = { 
          paid: 0, 
          pending: 0 
        };
      }
      
      // Parse bonus amount to a number
      let amount = 0;
      if (typeof bonus.bonusAmount === 'string') {
        // Remove $ and commas
        amount = parseFloat(bonus.bonusAmount.replace(/[$,]/g, '')) || 0;
      } else if (typeof bonus.bonusAmount === 'number') {
        amount = bonus.bonusAmount;
      }
      
      if (bonus.status === 'paid') {
        quarterMap[quarterLabel].paid += amount;
      } else {
        quarterMap[quarterLabel].pending += amount;
      }
    });
    
    // Sort quarters chronologically
    const sortedQuarters = Object.keys(quarterMap).sort((a, b) => {
      // Extract quarter number and year
      const [qA, yearA] = a.split(' ');
      const [qB, yearB] = b.split(' ');
      
      // Compare years first
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      // Then compare quarter numbers
      return parseInt(qA.substring(1)) - parseInt(qB.substring(1));
    });
    
    // Prepare data for chart
    const chartData = sortedQuarters.map(quarter => ({
      quarter,
      paid: parseFloat(quarterMap[quarter].paid.toFixed(2)),
      pending: parseFloat(quarterMap[quarter].pending.toFixed(2))
    }));
    
    return {
      quarterLabels: sortedQuarters,
      chartData,
      paidData: chartData.map(item => item.paid),
      pendingData: chartData.map(item => item.pending)
    };
  } catch (error) {
    console.error("Error processing quarterly trends data:", error);
    return {
      quarterLabels: [],
      chartData: [],
      paidData: [],
      pendingData: []
    };
  }
};

const BonusReports = () => {
  const [userBonuses, setUserBonuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quarterlyTrendData, setQuarterlyTrendData] = useState([]);
  const [selectedQuarter, setSelectedQuarter] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [totals, setTotals] = useState({
    users: 0,
    parts: 0,
    bonus: '$0.00',
    newParts: 0,
    newBonus: '$0.00'
  });
  const [filteredBonuses, setFilteredBonuses] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [availableQuarters, setAvailableQuarters] = useState(['All']);
  const [availableStatuses, setAvailableStatuses] = useState(['All', 'Paid', 'Pending', 'New Unpaid Parts']);
  const [chartData, setChartData] = useState({
    quaterlyData: {
      labels: [],
      datasets: []
    },
    userData: {
      labels: [],
      datasets: []
    },
    statusData: {
      labels: [],
      datasets: []
    }
  });

  // Memoized report data for the details table
  const reportData = useMemo(() => {
    console.log("Generating report data from:", filteredBonuses);
    
    if (!filteredBonuses || !Array.isArray(filteredBonuses) || filteredBonuses.length === 0) {
      return [];
    }
    
    const data = filteredBonuses.map(bonus => {
      console.log("Processing bonus item details:", bonus);
      
      // Handle potentially missing user data
      const userName = bonus.userName || 'Unknown User';
      const userId = bonus.userId || 'unknown';
      const email = bonus.email || 'N/A';
      
      // Ensure quarter information is available
      const quarterLabel = bonus.quarterLabel || `Q${bonus.quarter || '?'} ${bonus.year || '?'}`;
      const quarterNum = bonus.quarter || 0;
      const year = bonus.year || new Date().getFullYear();
      
      // Ensure partCount is a number
      const partCount = typeof bonus.partCount === 'number' ? bonus.partCount : 0;
      
      // Ensure bonusAmount is consistently a formatted string
      let bonusAmount = '$0.00';
      if (typeof bonus.bonusAmount === 'number') {
        bonusAmount = `$${bonus.bonusAmount.toFixed(2)}`;
      } else if (typeof bonus.bonusAmount === 'string') {
        // If already a string but doesn't have $ prefix, add it
        bonusAmount = bonus.bonusAmount.startsWith('$') 
          ? bonus.bonusAmount 
          : `$${bonus.bonusAmount}`;
      }
      
      // Ensure payment status has a valid value
      const paymentStatus = bonus.paymentStatus || 'pending';
      
      // Format payment date if available
      const paymentDate = bonus.paymentDate 
        ? new Date(bonus.paymentDate).toLocaleDateString() 
        : '-';
      
      // Create a unique ID that includes the payment status to ensure paid and unpaid entries get unique IDs
      const uniqueId = `${userId}_${quarterNum}_${year}_${paymentStatus}`;
      
      return {
        id: uniqueId,
        user: userName,
        userName: userName, // Add this explicitly for consistency
        userId: userId,
        email: email,
        quarter: quarterLabel,
        quarterNum: quarterNum,
        year: year,
        partsEntered: partCount,
        bonusAmount: bonusAmount,
        status: paymentStatus,
        paymentStatus: paymentStatus, // Add this explicitly for consistency
        paymentDate: paymentDate
      };
    });
    
    console.log("Generated report data:", data);
    return data;
  }, [filteredBonuses]);

  // Update available quarters when userBonuses changes
  useEffect(() => {
    if (userBonuses && userBonuses.length > 0) {
      const quarters = new Set(['All']);
      
      userBonuses.forEach(bonus => {
        if (bonus.quarterLabel) {
          quarters.add(bonus.quarterLabel);
        }
      });
      
      // Convert to array and sort (most recent first)
      const sortedQuarters = Array.from(quarters)
        .sort((a, b) => {
          if (a === 'All') return -1;
          if (b === 'All') return 1;
          
          // Extract year and quarter
          const [aQ, aY] = a.split(' ');
          const [bQ, bY] = b.split(' ');
          
          if (aY !== bY) return parseInt(bY) - parseInt(aY);
          return parseInt(bQ.replace('Q', '')) - parseInt(aQ.replace('Q', ''));
        });
      
      setAvailableQuarters(sortedQuarters);
    }
  }, [userBonuses]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all bonus data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get all user bonuses by quarter
      const quarterlyBonuses = await getAllUserBonusesByQuarter();
      console.log('Fetched quarterly bonuses:', quarterlyBonuses);
      
      // Add fallback data if no quarters found
      if (!quarterlyBonuses || quarterlyBonuses.length === 0) {
        console.warn('No quarterly bonuses found, check if the enteredparts table has data');
        
        // Try to get basic user data anyway for the UI
        const { data: users } = await supabase
          .from('profiles')
          .select('id, firstName, lastName, email, role');
          
        if (users && users.length > 0) {
          console.log(`Found ${users.length} users to display as fallback`);
          
          // Create empty quarters for users at least
          const currentDate = new Date();
          const currentQuarter = getQuarterFromDate(currentDate);
          const currentYear = currentDate.getFullYear();
          
          const fallbackBonuses = users.map(user => ({
            userId: user.id,
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
            email: user.email || 'N/A',
            quarter: currentQuarter,
            year: currentYear,
            quarterLabel: `Q${currentQuarter} ${currentYear}`,
            partCount: 0,
            bonusAmount: 0,
            paymentStatus: 'pending',
            paymentDate: null,
          parts: []
          }));
          
          console.log('Created fallback data:', fallbackBonuses);
          setUserBonuses(fallbackBonuses);
          
          // Apply existing filters if any
          if (selectedQuarter !== 'All' || selectedStatus !== 'All') {
            applyFilters(fallbackBonuses);
          } else {
            setFilteredBonuses(fallbackBonuses);
            calculateTotals(fallbackBonuses);
          }
        }
      } else {
        // Log the structure of the first bonus object to understand its format
        if (quarterlyBonuses.length > 0) {
          console.log('Sample bonus object structure:', JSON.stringify(quarterlyBonuses[0], null, 2));
        }
        
        setUserBonuses(quarterlyBonuses);
        
        // Apply existing filters if any
        if (selectedQuarter !== 'All' || selectedStatus !== 'All') {
          applyFilters(quarterlyBonuses);
        } else {
          setFilteredBonuses(quarterlyBonuses);
          calculateTotals(quarterlyBonuses);
        }
      }
      
      // Get quarterly trend data
      const trendData = await getQuarterlyBonusTrends();
      console.log('Fetched quarterly trend data:', trendData);
      setQuarterlyTrendData(trendData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
      // Show error notification to user
      alert('Error loading bonus data. Check console for details.');
    }
  };
  
  // Apply filters function
  const applyFilters = (data) => {
    let filtered = [...data];
    console.log('Applying filters to', filtered.length, 'records');
    
    // Filter by quarter
    if (selectedQuarter !== 'All') {
      const [qLabel, year] = selectedQuarter.split(' ');
      const quarter = parseInt(qLabel.replace('Q', ''));
      console.log(`Filtering for quarter ${quarter} and year ${year}`);
      
      filtered = filtered.filter(bonus => {
        // Match using either quarterLabel or quarter+year
        if (bonus.quarterLabel === selectedQuarter) return true;
        
        const quarterMatch = bonus.quarter === quarter;
        const yearMatch = bonus.year && bonus.year.toString() === year;
        return quarterMatch && yearMatch;
      });
    }
    
    // Filter by status
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'New Unpaid Parts') {
        // Create a map of user quarters that have paid parts
        const paidQuarters = new Map();
        data.forEach(bonus => {
          if (bonus.paymentStatus === 'paid') {
            const key = `${bonus.userId}_${bonus.quarter}_${bonus.year}`;
            paidQuarters.set(key, true);
          }
        });
        
        // Filter for pending parts that have paid parts in the same quarter
        filtered = filtered.filter(bonus => {
          if (bonus.paymentStatus !== 'pending') return false;
          const key = `${bonus.userId}_${bonus.quarter}_${bonus.year}`;
          return paidQuarters.has(key);
        });
      } else {
        const status = selectedStatus.toLowerCase();
        filtered = filtered.filter(bonus => {
          const statusMatch = 
            bonus.paymentStatus?.toLowerCase() === status || 
            (status === 'paid' && bonus.paymentStatus === 'Paid') ||
            (status === 'pending' && bonus.paymentStatus === 'Pending');
          return statusMatch;
        });
      }
    }
    
    console.log(`After all filtering: ${filtered.length} records remain`);
    setFilteredBonuses(filtered);
    calculateTotals(filtered);
  };
  
  // Handle filter changes
  const handleFilter = () => {
    applyFilters(userBonuses);
  };
  
  // Handle marking a bonus as paid
  const handleMarkAsPaid = (item) => {
    console.log('Marking as paid:', item);
    setSelectedPayment({
      id: item.id,
      user: item.user,
      userId: item.userId,
      quarter: item.quarter,
      quarterNum: item.quarterNum,
      year: item.year,
      bonusAmount: item.bonusAmount
    });
    setShowPaymentModal(true);
  };
  
  // Confirm payment
  const confirmPayment = async () => {
    try {
      if (!selectedPayment) return;
      
      // Extract bonus amount as a number
      const amount = typeof selectedPayment.bonusAmount === 'string'
        ? parseFloat(selectedPayment.bonusAmount.replace(/[$,]/g, ''))
        : (typeof selectedPayment.bonusAmount === 'number' ? selectedPayment.bonusAmount : 0);
      
      console.log('Updating payment for:', selectedPayment);
      
      // Update payment status
      await updateBonusPayment({
        userId: selectedPayment.userId,
        quarter: selectedPayment.quarterNum,
        year: parseInt(selectedPayment.year),
        amount,
        status: 'paid',
      paymentDate
    });
    
      // Close modal
    setShowPaymentModal(false);
    setSelectedPayment(null);
      
      // Refresh all data to update charts
      await fetchData();
      
      // Re-apply current filters
      handleFilter();
      
    } catch (error) {
      console.error('Error updating payment:', error);
      alert(`Failed to update payment: ${error.message}`);
    }
  };
  
  // Cancel payment modal
  const cancelPayment = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
  };
  
  // Calculate totals from filtered bonuses
  const calculateTotals = (bonuses) => {
    if (!bonuses || !Array.isArray(bonuses)) {
      setTotals({
        users: 0,
        parts: 0,
        bonus: '$0.00',
        newParts: 0,
        newBonus: '$0.00'
      });
      return;
    }
    
    // Count unique users
    const uniqueUsers = new Set();
    bonuses.forEach(bonus => uniqueUsers.add(bonus.userId));
    
    // Sum parts
    const totalParts = bonuses.reduce((sum, bonus) => sum + (bonus.partCount || 0), 0);
    
    // Handle both string and number types for bonusAmount
    let totalBonus = 0;
    bonuses.forEach(bonus => {
      if (typeof bonus.bonusAmount === 'string') {
        // Remove $ and commas before parsing
        const cleanAmount = bonus.bonusAmount.replace(/[$,]/g, '');
        const amount = parseFloat(cleanAmount || '0');
        totalBonus += isNaN(amount) ? 0 : amount;
      } else if (typeof bonus.bonusAmount === 'number') {
        totalBonus += bonus.bonusAmount;
      }
    });
    
    // Count new unpaid parts (parts that are pending for users who have paid parts in the same quarter)
    const paidQuarters = new Map();
    bonuses.forEach(bonus => {
      if (bonus.paymentStatus === 'paid') {
        const key = `${bonus.userId}_${bonus.quarter}_${bonus.year}`;
        paidQuarters.set(key, true);
      }
    });
    
    let newParts = 0;
    let newBonus = 0;
    
    bonuses.forEach(bonus => {
      if (bonus.paymentStatus === 'pending') {
        const key = `${bonus.userId}_${bonus.quarter}_${bonus.year}`;
        if (paidQuarters.has(key)) {
          newParts += bonus.partCount || 0;
          
          // Add to new bonus amount
          if (typeof bonus.bonusAmount === 'string') {
            const cleanAmount = bonus.bonusAmount.replace(/[$,]/g, '');
            const amount = parseFloat(cleanAmount || '0');
            newBonus += isNaN(amount) ? 0 : amount;
          } else if (typeof bonus.bonusAmount === 'number') {
            newBonus += bonus.bonusAmount;
          }
        }
      }
    });
    
    setTotals({
      users: uniqueUsers.size,
      parts: totalParts,
      bonus: `$${totalBonus.toFixed(2)}`,
      newParts,
      newBonus: `$${newBonus.toFixed(2)}`
    });
  };
  
  // Download chart using the utility
  const handleChartDownload = useCallback((chartId, fileName) => {
    console.log(`Attempting to download chart with ID: ${chartId}`);
    
    // Small delay to ensure chart rendering is complete
    setTimeout(() => {
    downloadElementAsImage(chartId, fileName);
    }, 100);
  }, []);
  
  // Memoized data preparation for better performance
  const barChartData = useMemo(() => {
    if (!filteredBonuses || filteredBonuses.length === 0) return [];
    
    console.log('Generating bar chart data from:', filteredBonuses);
    
    // Group by user and calculate total bonuses per user
    const userTotals = {};
    
    filteredBonuses.forEach(item => {
      // Use userName property instead of user
      const userName = item.userName || 'Unknown User';
      
      if (!userTotals[userName]) {
        userTotals[userName] = 0;
      }
      
      // Handle both string and number types for bonusAmount
      const amount = typeof item.bonusAmount === 'string' 
        ? parseFloat(item.bonusAmount.replace(/[$,]/g, '')) 
        : (typeof item.bonusAmount === 'number' ? item.bonusAmount : 0);
      
      userTotals[userName] += amount;
    });
    
    console.log('User totals for bar chart:', userTotals);
    
    // Convert to array format for the chart
    const chartData = Object.keys(userTotals)
      .map(user => ({
        name: user,
        bonus: userTotals[user]
      }))
      .sort((a, b) => b.bonus - a.bonus)
      .slice(0, 8); // Show top 8 users
    
    console.log('Final bar chart data:', chartData);
    return chartData;
  }, [filteredBonuses]);
  
  const pieChartData = useMemo(() => {
    if (!filteredBonuses || filteredBonuses.length === 0) return [];
    
    console.log('Generating pie chart data from:', filteredBonuses);
    
    let pendingTotal = 0;
    let paidTotal = 0;
    
    filteredBonuses.forEach(item => {
      // Handle both string and number types for bonusAmount
      const amount = typeof item.bonusAmount === 'string' 
        ? parseFloat(item.bonusAmount.replace(/[$,]/g, '')) 
        : (typeof item.bonusAmount === 'number' ? item.bonusAmount : 0);
      
      // Check for paid status with case insensitivity
      const isPaid = item.paymentStatus === 'paid' || 
                     item.paymentStatus === 'Paid' || 
                     (item.status && (item.status === 'paid' || item.status === 'Paid'));
      
      if (isPaid) {
        paidTotal += amount;
      } else {
        pendingTotal += amount;
      }
    });
    
    const chartData = [
      { name: 'Pending', value: pendingTotal },
      { name: 'Paid', value: paidTotal }
    ];
    
    console.log('Final pie chart data:', chartData);
    return chartData;
  }, [filteredBonuses]);
  
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
  
  // Handle exporting the report as Excel
  const handleExportReport = useCallback(() => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }
    
    // Format report data for Excel with proper column structure
    const formattedData = reportData.map(item => ({
      User: item.user || 'Unknown User',
      Email: item.email || 'N/A',
      Quarter: item.quarter || 'N/A',
      'Parts Entered': item.partsEntered || 0,
      'Bonus Amount': item.bonusAmount || '$0.00',
      Status: (item.status === 'paid' || item.status === 'Paid') ? 'Paid' : 'Pending',
      'Payment Date': item.paymentDate || '-'
    }));
    
    // Export using utility
    exportReport(
      formattedData, 
      'bonus', 
      `${selectedQuarter !== 'All' ? selectedQuarter : 'all_quarters'}_${selectedStatus.toLowerCase()}`
    );
  }, [reportData, selectedQuarter, selectedStatus]);
  
  // Update the renderBonusEntries function to use the new TableRow component
  const renderBonusEntries = () => {
    try {
      if (!reportData || reportData.length === 0) {
        return (
          <tr>
            <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
              No bonus data found for the selected filters.
            </td>
          </tr>
        );
      }
      
      return reportData.map((item, index) => {
        // Determine if this is an unpaid entry that might be a continuation of parts from a quarter that already has paid parts
        const isPending = item.status === 'pending';
        const hasPaidRow = reportData.some(
          other => other.userId === item.userId && 
                   other.quarterNum === item.quarterNum && 
                   other.year === item.year && 
                   other.status === 'paid'
        );
        
        // Add a special style for unpaid entries in quarters that already have paid entries
        const isNewParts = isPending && hasPaidRow;
        
        return (
          <TableRow key={`bonus-${item.id || index}`} className={isNewParts ? 'new-unpaid-parts' : ''}>
            <td style={{ fontWeight: '500' }}>{item.user || 'Unknown User'}</td>
            <td>{item.email || 'N/A'}</td>
            <td style={{ fontWeight: '500' }}>{item.quarter || 'Unknown Quarter'}</td>
            <td style={{ textAlign: 'center', fontWeight: '500' }}>{item.partsEntered || 0}</td>
            <td style={{ textAlign: 'right' }}>
              <BonusAmount isPaid={item.status === 'paid'} isNewParts={isNewParts}>
                {item.bonusAmount || '$0.00'}
              </BonusAmount>
            </td>
            <td>
              <Badge className={item.status || 'pending'}>
                {item.status === 'paid' ? (
                  <><FiCheckCircle size={14} /> Paid</>
                ) : (
                  <><FiClock size={14} /> {isNewParts ? 'Pending (New Parts)' : 'Pending'}</>
                )}
              </Badge>
            </td>
            <td>{item.paymentDate || '-'}</td>
            <td style={{ textAlign: 'right' }}>
              {item.status !== 'paid' && (
                <ActionButton onClick={() => handleMarkAsPaid(item)}>
                  Mark as Paid
                </ActionButton>
              )}
            </td>
          </TableRow>
        );
      });
    } catch (error) {
      console.error("Error rendering bonus entries:", error);
      return (
        <tr>
          <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
            Error loading bonus data. Please try refreshing the page.
          </td>
        </tr>
      );
    }
  };

  // Prepare chart data with better error handling
  const prepareChartData = useCallback(() => {
    try {
      if (!reportData || reportData.length === 0) {
        setChartData({
          quaterlyData: {
            labels: [],
            datasets: []
          },
          userData: {
            labels: [],
            datasets: []
          },
          statusData: {
            labels: [],
            datasets: []
          }
        });
        return;
      }
      
      // Process data for charts
      const { quarterLabels, paidData, pendingData } = processQuarterlyTrendsData(reportData);
      
      // Create user distribution data
      const userBonusMap = {};
      reportData.forEach(item => {
        const userName = item.user || 'Unknown';
        if (!userBonusMap[userName]) {
          userBonusMap[userName] = 0;
        }
        
        // Parse bonus amount
        let amount = 0;
        if (typeof item.bonusAmount === 'string') {
          amount = parseFloat(item.bonusAmount.replace(/[$,]/g, '')) || 0;
        } else if (typeof item.bonusAmount === 'number') {
          amount = item.bonusAmount;
        }
        
        userBonusMap[userName] += amount;
      });
      
      // Sort users by bonus amount descending
      const sortedUsers = Object.keys(userBonusMap).sort((a, b) => userBonusMap[b] - userBonusMap[a]);
      
      // Take top 5 users for visualization
      const topUsers = sortedUsers.slice(0, 5);
      const userAmounts = topUsers.map(user => parseFloat(userBonusMap[user].toFixed(2)));
      
      // Calculate total paid vs pending
      let totalPaid = 0;
      let totalPending = 0;
      
      reportData.forEach(item => {
        // Parse bonus amount
        let amount = 0;
        if (typeof item.bonusAmount === 'string') {
          amount = parseFloat(item.bonusAmount.replace(/[$,]/g, '')) || 0;
        } else if (typeof item.bonusAmount === 'number') {
          amount = item.bonusAmount;
        }
        
        if (item.status === 'paid') {
          totalPaid += amount;
        } else {
          totalPending += amount;
        }
      });
      
      // Set chart data
      setChartData({
        quaterlyData: {
          labels: quarterLabels,
          datasets: [
            {
              label: 'Paid Bonuses',
              data: paidData,
              backgroundColor: '#4CAF50',
              borderColor: '#4CAF50',
            },
            {
              label: 'Pending Bonuses',
              data: pendingData,
              backgroundColor: '#FFA000',
              borderColor: '#FFA000',
            }
          ]
        },
        userData: {
          labels: topUsers,
          datasets: [
            {
              data: userAmounts,
              backgroundColor: [
                '#3F51B5', '#4CAF50', '#FF9800', '#2196F3', '#F44336'
              ],
              borderWidth: 0,
            }
          ]
        },
        statusData: {
          labels: ['Paid', 'Pending'],
          datasets: [
            {
              label: 'Bonus Amount',
              data: [
                parseFloat(totalPaid.toFixed(2)), 
                parseFloat(totalPending.toFixed(2))
              ],
              backgroundColor: ['#4CAF50', '#FFA000'],
              borderWidth: 0,
            }
          ]
        }
      });
    } catch (error) {
      console.error("Error preparing chart data:", error);
      setChartData({
        quaterlyData: {
          labels: [],
          datasets: []
        },
        userData: {
          labels: [],
          datasets: []
        },
        statusData: {
          labels: [],
          datasets: []
        }
      });
    }
  }, [reportData]);

  // Update the charts when reportData changes
  useEffect(() => {
    if (reportData && reportData.length > 0) {
      prepareChartData();
    }
  }, [reportData, prepareChartData]);

  return (
    <PageContainer>
      <PageTitle>
        <FiDollarSign size={24} />
        Bonus Reports
      </PageTitle>
      
      <SummaryGrid>
        <SummaryCard color={COLORS.primary}>
          <SummaryTitle>Total Users</SummaryTitle>
          <SummaryValue>{totals.users}</SummaryValue>
        </SummaryCard>
        
        <SummaryCard color={COLORS.secondary}>
          <SummaryTitle>Total Parts</SummaryTitle>
          <SummaryValue>{totals.parts}</SummaryValue>
        </SummaryCard>
        
        <SummaryCard color={COLORS.success}>
          <SummaryTitle>Total Bonus</SummaryTitle>
          <SummaryValue>{totals.bonus}</SummaryValue>
        </SummaryCard>
        
        {totals.newParts > 0 && (
          <SummaryCard color={COLORS.warning}>
            <SummaryTitle>New Unpaid Parts</SummaryTitle>
            <SummaryValue>{totals.newParts}</SummaryValue>
          </SummaryCard>
        )}
        
        {totals.newBonus !== '$0.00' && (
          <SummaryCard color={COLORS.warning}>
            <SummaryTitle>New Unpaid Bonus</SummaryTitle>
            <SummaryValue>{totals.newBonus}</SummaryValue>
          </SummaryCard>
        )}
      </SummaryGrid>
      
      <FilterBar>
        <Select 
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
        >
          {availableQuarters.map(quarter => (
            <option key={quarter} value={quarter}>{quarter}</option>
          ))}
        </Select>
        
        <Select 
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          {availableStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </Select>
        
        <Button 
          onClick={handleFilter} 
          style={{ minWidth: '120px' }}
        >
          <FiFilter size={18} style={{ marginRight: '0.5rem' }} />
          Filter
        </Button>
      </FilterBar>
      <div style={{ marginTop: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
      <ActionButton 
          onClick={handleExportReport}
          style={{ 
            backgroundColor: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px'
          }}
        >
          <FiDownload size={18} />
          Export to Excel
        </ActionButton>
        </div>
      <Table>
        <TableHeader>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Quarter</th>
            <th style={{ textAlign: 'center' }}>Parts</th>
            <th style={{ textAlign: 'right' }}>Bonus Amount</th>
            <th>Status</th>
            <th>Payment Date</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </TableHeader>
        <TableBody>
          {renderBonusEntries()}
        </TableBody>
      </Table>
      
      {/* Add charts in cards */}
      <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ padding: '1.5rem' }}>
          <h3>Quarterly Bonus Trends</h3>
          <ChartContainer>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                Loading charts...
              </div>
            ) : (
              <Line 
                data={chartData.quaterlyData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            )}
          </ChartContainer>
        </Card>
        
        <Card style={{ padding: '1.5rem' }}>
          <h3>Bonus Distribution By User</h3>
          <ChartContainer>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                Loading charts...
              </div>
            ) : (
              <Doughnut 
                data={chartData.userData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            )}
          </ChartContainer>
        </Card>
        
        <Card style={{ padding: '1.5rem' }}>
          <h3>Pending vs Paid Bonuses</h3>
          <ChartContainer>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                Loading charts...
              </div>
            ) : (
              <Bar 
                data={chartData.statusData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            )}
          </ChartContainer>
        </Card>
      </div>
      
      
      {/* Payment confirmation modal */}
      {showPaymentModal && selectedPayment && (
        <>
          {/* Overlay */}
          <div 
            style={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              backgroundColor: 'rgba(0,0,0,0.5)', 
              zIndex: 999,
              backdropFilter: 'blur(2px)'
            }}
            onClick={cancelPayment}
          />
          
          <PaymentModal
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ModalTitle>Confirm Payment</ModalTitle>
            <p>You are about to mark the following bonus as paid:</p>
            <ModalInfo>
              <ModalInfoRow>
                <ModalLabel>User:</ModalLabel>
                <ModalValue>{selectedPayment.user}</ModalValue>
              </ModalInfoRow>
              <ModalInfoRow>
                <ModalLabel>Quarter:</ModalLabel>
                <ModalValue>{selectedPayment.quarter}</ModalValue>
              </ModalInfoRow>
              <ModalInfoRow>
                <ModalLabel>Amount:</ModalLabel>
                <ModalValue>{selectedPayment.bonusAmount}</ModalValue>
              </ModalInfoRow>
            </ModalInfo>
            
            <DatePickerContainer>
              <label htmlFor="payment-date">Payment Date:</label>
              <DateInput
                id="payment-date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </DatePickerContainer>
            
            <ButtonGroup style={{ marginTop: '1rem', flexDirection: 'row' }}>
              <Button onClick={cancelPayment} style={{ backgroundColor: '#bdbdbd' }}>
                Cancel
              </Button>
              <ActionButton onClick={confirmPayment} style={{ backgroundColor: '#4caf50' }}>
                Confirm Payment
              </ActionButton>
            </ButtonGroup>
          </PaymentModal>
        </>
      )}
    </PageContainer>
  );
};

export default BonusReports; 