import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';

const Card = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
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

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const HistoryTable = styled.table`
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

const StatusBadge = styled.span`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${props => props.theme.typography.fontSize.sm};
  
  ${props => props.status === 'Valid' && `
    background-color: #e8f5e9;
    color: #2e7d32;
  `}
  
  ${props => props.status === 'Invalid' && `
    background-color: #ffebee;
    color: #c62828;
  `}
  
  ${props => props.status === 'Duplicate' && `
    background-color: #fff8e1;
    color: #f57f17;
  `}
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg};
`;

const PaginationInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const PaginationButton = styled.button`
  padding: ${props => `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  color: ${props => props.active ? 'white' : props.theme.colors.text.primary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.sm};
  cursor: pointer;
  
  &:hover {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SummaryCard = styled.div`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
`;

const SummaryItem = styled.div`
  flex: 1;
  min-width: 150px;
`;

const SummaryLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const SummaryValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.lg};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const Section = styled.section`
  margin-bottom: ${props => props.theme.spacing.xl};
  
  h3 {
    font-size: ${props => props.theme.typography.fontSize.xl};
    margin-bottom: ${props => props.theme.spacing.lg};
    color: ${props => props.theme.colors.text.primary};
  }
`;

// Mock data for demonstration
const mockHistoryData = [
  { id: 1, partId: 'ABC123', date: '2025-01-15', time: '09:15:23', status: 'Valid', bonus: '$1', quarter: 'Q1 2025' },
  { id: 2, partId: 'DEF456', date: '2025-01-14', time: '11:23:45', status: 'Valid', bonus: '$1', quarter: 'Q1 2025' },
  { id: 3, partId: 'XYZ789', date: '2025-01-14', time: '14:05:12', status: 'Valid', bonus: '$1', quarter: 'Q1 2025' },
  { id: 4, partId: 'MNO123', date: '2025-01-12', time: '10:33:21', status: 'Invalid', bonus: '$0', quarter: 'Q1 2025' },
  { id: 5, partId: 'ABC123', date: '2025-01-11', time: '16:45:33', status: 'Duplicate', bonus: '$0', quarter: 'Q1 2025' },
  { id: 6, partId: 'PQR321', date: '2024-12-20', time: '08:22:11', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
  { id: 7, partId: 'LMN654', date: '2024-12-15', time: '13:12:42', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
  { id: 8, partId: 'GHI789', date: '2024-12-10', time: '09:55:18', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
  { id: 9, partId: 'JKL321', date: '2024-12-05', time: '15:33:29', status: 'Invalid', bonus: '$0', quarter: 'Q4 2024' },
  { id: 10, partId: 'STU987', date: '2024-12-01', time: '11:11:11', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
  { id: 11, partId: 'VWX654', date: '2024-11-25', time: '14:22:33', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
  { id: 12, partId: 'YZA321', date: '2024-11-20', time: '16:44:55', status: 'Valid', bonus: '$1', quarter: 'Q4 2024' },
];

const quarters = ['All', 'Q1 2025', 'Q4 2024', 'Q3 2024', 'Q2 2024'];
const statuses = ['All', 'Valid', 'Invalid', 'Duplicate'];

const History = () => {
  const [historyData, setHistoryData] = useState(mockHistoryData);
  const [filteredData, setFilteredData] = useState(mockHistoryData);
  const [selectedQuarter, setSelectedQuarter] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const applyFilters = () => {
    let filtered = [...historyData];
    
    if (selectedQuarter !== 'All') {
      filtered = filtered.filter(item => item.quarter === selectedQuarter);
    }
    
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.partId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredData(filtered);
    setCurrentPage(1);
  };
  
  const calculateSummary = () => {
    const totalEntries = filteredData.length;
    const validEntries = filteredData.filter(item => item.status === 'Valid').length;
    const totalBonus = filteredData.reduce((sum, item) => {
      return sum + parseFloat(item.bonus.replace('$', '') || 0);
    }, 0);
    
    return {
      totalEntries,
      validEntries,
      totalBonus: `$${totalBonus}`,
      validPercentage: totalEntries > 0 ? Math.round((validEntries / totalEntries) * 100) : 0
    };
  };
  
  const summary = calculateSummary();
  
  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const pageStartIndex = (currentPage - 1) * itemsPerPage;
  const pageEndIndex = pageStartIndex + itemsPerPage;
  const currentItems = filteredData.slice(pageStartIndex, pageEndIndex);
  
  return (
    <Layout title="Entry History">
      <Section>
        <Card>
          <h3>Filters</h3>
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
            
            <Input
              type="text"
              placeholder="Search by Part ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Button onClick={applyFilters}>Apply Filters</Button>
          </FilterBar>
        </Card>
      </Section>
      
      <Section>
        <h3>Summary</h3>
        <SummaryCard>
          <SummaryItem>
            <SummaryLabel>Total Entries</SummaryLabel>
            <SummaryValue>{summary.totalEntries}</SummaryValue>
          </SummaryItem>
          
          <SummaryItem>
            <SummaryLabel>Valid Entries</SummaryLabel>
            <SummaryValue>{summary.validEntries}</SummaryValue>
          </SummaryItem>
          
          <SummaryItem>
            <SummaryLabel>Valid Percentage</SummaryLabel>
            <SummaryValue>{summary.validPercentage}%</SummaryValue>
          </SummaryItem>
          
          <SummaryItem>
            <SummaryLabel>Total Bonus</SummaryLabel>
            <SummaryValue>{summary.totalBonus}</SummaryValue>
          </SummaryItem>
        </SummaryCard>
      </Section>
      
      <Section>
        <Card>
          <h3>Entry History</h3>
          
          <HistoryTable>
            <TableHead>
              <tr>
                <th>Part ID</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Bonus</th>
                <th>Quarter</th>
              </tr>
            </TableHead>
            <TableBody>
              {currentItems.map(item => (
                <tr key={item.id}>
                  <td>{item.partId}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>
                    <StatusBadge status={item.status}>
                      {item.status}
                    </StatusBadge>
                  </td>
                  <td>{item.bonus}</td>
                  <td>{item.quarter}</td>
                </tr>
              ))}
            </TableBody>
          </HistoryTable>
          
          {filteredData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#757575' }}>
              No data found matching the filters.
            </div>
          )}
          
          {filteredData.length > 0 && (
            <Pagination>
              <PaginationInfo>
                Showing {pageStartIndex + 1}-{Math.min(pageEndIndex, filteredData.length)} of {filteredData.length} entries
              </PaginationInfo>
              
              <PaginationButtons>
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </PaginationButton>
                
                {[...Array(totalPages).keys()].map(pageNumber => (
                  <PaginationButton 
                    key={pageNumber + 1}
                    active={currentPage === pageNumber + 1}
                    onClick={() => setCurrentPage(pageNumber + 1)}
                  >
                    {pageNumber + 1}
                  </PaginationButton>
                ))}
                
                <PaginationButton 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </PaginationButton>
              </PaginationButtons>
            </Pagination>
          )}
        </Card>
      </Section>
    </Layout>
  );
};

export default History; 