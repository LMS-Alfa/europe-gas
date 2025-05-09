import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

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

const ChartContainer = styled.div`
  height: 300px;
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

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

// Mock data for demonstration
const mockReportData = [
  { id: 1, user: 'John Doe', email: 'john@europegas.com', quarter: 'Q1 2025', partsEntered: 25, bonusAmount: '$25', status: 'Pending' },
  { id: 2, user: 'Jane Smith', email: 'jane@europegas.com', quarter: 'Q1 2025', partsEntered: 42, bonusAmount: '$42', status: 'Pending' },
  { id: 3, user: 'Mike Johnson', email: 'mike@europegas.com', quarter: 'Q1 2025', partsEntered: 15, bonusAmount: '$15', status: 'Pending' },
  { id: 4, user: 'Sarah Williams', email: 'sarah@europegas.com', quarter: 'Q1 2025', partsEntered: 31, bonusAmount: '$31', status: 'Pending' },
  { id: 5, user: 'John Doe', email: 'john@europegas.com', quarter: 'Q4 2024', partsEntered: 38, bonusAmount: '$38', status: 'Paid' },
  { id: 6, user: 'Jane Smith', email: 'jane@europegas.com', quarter: 'Q4 2024', partsEntered: 27, bonusAmount: '$27', status: 'Paid' },
  { id: 7, user: 'Mike Johnson', email: 'mike@europegas.com', quarter: 'Q4 2024', partsEntered: 19, bonusAmount: '$19', status: 'Paid' },
  { id: 8, user: 'Sarah Williams', email: 'sarah@europegas.com', quarter: 'Q4 2024', partsEntered: 44, bonusAmount: '$44', status: 'Paid' },
];

const quarters = ['Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];
const statuses = ['All', 'Pending', 'Paid'];

const BonusReports = () => {
  const [selectedQuarter, setSelectedQuarter] = useState('Q1 2025');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [reportData, setReportData] = useState(mockReportData.filter(item => item.quarter === 'Q1 2025'));
  
  const handleFilter = () => {
    let filteredData = mockReportData.filter(item => item.quarter === selectedQuarter);
    
    if (selectedStatus !== 'All') {
      filteredData = filteredData.filter(item => item.status === selectedStatus);
    }
    
    setReportData(filteredData);
  };
  
  const calculateTotals = () => {
    const totalUsers = new Set(reportData.map(item => item.user)).size;
    const totalParts = reportData.reduce((sum, item) => sum + item.partsEntered, 0);
    const totalBonus = reportData.reduce((sum, item) => sum + parseInt(item.bonusAmount.replace('$', '')), 0);
    
    return {
      users: totalUsers,
      parts: totalParts,
      bonus: `$${totalBonus}`,
    };
  };
  
  const totals = calculateTotals();
  
  return (
    <Container>
      <title>Bonus Reports</title>
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
            
            <Button onClick={handleFilter}>Apply Filters</Button>
          </FilterBar>
        </Card>
      </Section>
      
      <Section>
        <SummaryGrid>
          <SummaryCard color={totals.users > 0 ? '#1e88e5' : '#bdbdbd'}>
            <SummaryTitle>Total Users</SummaryTitle>
            <SummaryValue>{totals.users}</SummaryValue>
          </SummaryCard>
          
          <SummaryCard color={totals.parts > 0 ? '#26a69a' : '#bdbdbd'}>
            <SummaryTitle>Total Parts Entered</SummaryTitle>
            <SummaryValue>{totals.parts}</SummaryValue>
          </SummaryCard>
          
          <SummaryCard color={parseFloat(totals.bonus.replace('$', '')) > 0 ? '#66bb6a' : '#bdbdbd'}>
            <SummaryTitle>Total Bonus Amount</SummaryTitle>
            <SummaryValue>{totals.bonus}</SummaryValue>
          </SummaryCard>
        </SummaryGrid>
      </Section>
      
      <Section>
        <ChartContainer>
          <h4>Bonus Distribution By User</h4>
          <ChartPlaceholder>
            Chart would be rendered here in a production app
          </ChartPlaceholder>
        </ChartContainer>
      </Section>
      
      <Section>
        <Card>
          <ReportTable>
            <TableHead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Quarter</th>
                <th>Parts Entered</th>
                <th>Bonus Amount</th>
                <th>Status</th>
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
                  <td style={{ color: item.status === 'Paid' ? '#66bb6a' : '#ff9800' }}>
                    {item.status}
                  </td>
                </tr>
              ))}
            </TableBody>
          </ReportTable>
          
          {reportData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#757575' }}>
              No data found for the selected filters.
            </div>
          )}
          
          {selectedStatus === 'Pending' && reportData.length > 0 && (
            <ButtonGroup>
              <Button>Process Payments</Button>
            </ButtonGroup>
          )}
        </Card>
      </Section>
    </Container>
  );
};

export default BonusReports; 