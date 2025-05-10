import { useState, useEffect, useContext, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiFilter, FiSearch, FiX } from 'react-icons/fi';
import Layout from '../../components/Layout';
import AuthContext from '../../contexts/AuthContext';
import { getUserParts, getUserBonus } from '../../utils/api';

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

const Input = styled.input`
  padding: ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.md};
  flex: 2;
  
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

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${props => props.theme.spacing.md};
  }
`;

const PaginationInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  flex-wrap: wrap;
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

const LoadingOverlay = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => props.theme.spacing.xl};
  color: ${props => props.theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  padding: ${props => props.theme.spacing.md};
  background-color: #ffebee;
  color: #c62828;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const History = () => {
  const { currentUser } = useContext(AuthContext);
  const [filter, setFilter] = useState({
    quarter: 'All',
    partName: 'All',
    searchQuery: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [summary, setSummary] = useState({ totalParts: 0, uniquePartTypes: 0, totalBonus: '$0.00' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const itemsPerPage = 10;
  
  // Fetch history data from Supabase
  useEffect(() => {
    const fetchHistoryData = async () => {
      if (!currentUser || !currentUser.id) return;
      
      setLoading(true);
      try {
        // Get user's parts from Supabase
        const parts = await getUserParts(currentUser.id);
        
        // Log parts data to see what's being returned
        console.log('Parts from API:', parts);
        if (parts.length > 0) {
          console.log('First part example:', parts[0]);
          console.log('Serial number from parts:', parts[0]?.parts?.serial_number);
        }
        
        // Get user bonus data
        const bonusData = await getUserBonus(currentUser.id);
        
        // Format data for display
        const formattedData = parts.map(entry => {
          const date = new Date(entry.created_at);
          
          // Determine quarter based on date
          const quarter = `Q${Math.floor((date.getMonth() / 3) + 1)} ${date.getFullYear()}`;
          
          // Get the part's serial number - use proper structure exploration
          let serialNumber = 'Unknown';
          if (entry.parts) {
            // Try to directly access or iterate object keys if it's an object
            if (typeof entry.parts === 'object') {
              serialNumber = entry.parts.serial_number || 
                           entry.parts.serialNumber || 
                           entry.parts.serialnumber || 
                           entry.part_id || 
                           'Unknown';
              
              // Log the parts object to see its structure
              console.log('Parts object:', entry.parts, 'Serial number extracted:', serialNumber);
            }
          }
          
          return {
            id: entry.id,
            serialNumber: serialNumber,
            partName: entry.parts?.name || 'Unknown Part',
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString(),
            bonus: entry.parts?.status ? '$1.00' : '$0.00',
            quarter
          };
        });
        
        // Log formatted data
        console.log('Formatted data:', formattedData);
        
        setHistoryData(formattedData);
        
        // Apply initial filtering
        applyFilters(formattedData, filter);
        
        // Calculate summary
        const summary = calculateSummary(formattedData);
        setSummary({
          ...summary,
          totalBonus: bonusData?.totalBonus ? `$${bonusData.totalBonus.toFixed(2)}` : '$0.00'
        });
        
      } catch (error) {
        console.error('Error fetching history data:', error);
        setError('Failed to load your entry history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoryData();
  }, [currentUser]);
  
  // Extract available quarters from data
  const quarters = useMemo(() => {
    const uniqueQuarters = new Set(['All']);
    historyData.forEach(entry => {
      if (entry.quarter) uniqueQuarters.add(entry.quarter);
    });
    return Array.from(uniqueQuarters);
  }, [historyData]);
  
  // Extract unique part names for filtering
  const partNames = useMemo(() => {
    const uniquePartNames = new Set(['All']);
    historyData.forEach(entry => {
      if (entry.partName && entry.partName !== 'Unknown Part') {
        uniquePartNames.add(entry.partName);
      }
    });
    return Array.from(uniquePartNames);
  }, [historyData]);
  
  const applyFilters = (data = historyData, newFilter = filter) => {
    let filtered = [...data];
    
    // Apply quarter filter
    if (newFilter.quarter !== 'All') {
      filtered = filtered.filter(entry => entry.quarter === newFilter.quarter);
    }
    
    // Apply part name filter
    if (newFilter.partName !== 'All') {
      filtered = filtered.filter(entry => entry.partName === newFilter.partName);
    }
    
    // Apply search query
    if (newFilter.searchQuery) {
      const query = newFilter.searchQuery.toLowerCase();
      filtered = filtered.filter(entry => 
        (entry.serialNumber && entry.serialNumber.toLowerCase().includes(query)) ||
        (entry.partName && entry.partName.toLowerCase().includes(query)) ||
        entry.date.toLowerCase().includes(query)
      );
    }
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handleFilterChange = (newFilter) => {
    const updatedFilter = { ...filter, ...newFilter };
    setFilter(updatedFilter);
    applyFilters(historyData, updatedFilter);
  };
  
  const calculateSummary = (data = historyData) => {
    const totalParts = data.length;
    
    // Count unique part types
    const uniquePartTypes = new Set();
    data.forEach(entry => {
      if (entry.partName && entry.partName !== 'Unknown Part') {
        uniquePartTypes.add(entry.partName);
      }
    });
    
    return {
      totalParts,
      uniquePartTypes: uniquePartTypes.size
    };
  };
  
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  
  return (
    <Layout>
      <h2>Part Entry History</h2>
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      <SummaryCard>
        <SummaryItem>
          <SummaryLabel>Total Parts</SummaryLabel>
          <SummaryValue>{summary.totalParts}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Unique Part Types</SummaryLabel>
          <SummaryValue>{summary.uniquePartTypes}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Total Bonus</SummaryLabel>
          <SummaryValue>{summary.totalBonus}</SummaryValue>
        </SummaryItem>
      </SummaryCard>
      
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Section>
          <h3>Filter Entries</h3>
          <FilterBar>
            <Select 
              value={filter.quarter} 
              onChange={(e) => handleFilterChange({ quarter: e.target.value })}
              aria-label="Filter by quarter"
            >
              {quarters.map(quarter => (
                <option key={quarter} value={quarter}>{quarter}</option>
              ))}
            </Select>
            <Select 
              value={filter.partName} 
              onChange={(e) => handleFilterChange({ partName: e.target.value })}
              aria-label="Filter by part name"
            >
              {partNames.map(name => (
                <option key={name} value={name}>{name === 'All' ? 'All Parts' : name}</option>
              ))}
            </Select>
            <Input
              type="text"
              placeholder="Search serial number, part name, or date..."
              value={filter.searchQuery}
              onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
              aria-label="Search entries"
            />
          </FilterBar>
        </Section>
        
        {loading ? (
          <LoadingOverlay>Loading your entry history...</LoadingOverlay>
        ) : (
          <>
            <HistoryTable>
              <TableHead>
                <tr>
                  <th>Serial Number</th>
                  <th>Part Name</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Bonus</th>
                  <th>Quarter</th>
                </tr>
              </TableHead>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map(entry => (
                    <tr key={entry.id}>
                      <td>{entry.serialNumber}</td>
                      <td>{entry.partName}</td>
                      <td>{entry.date}</td>
                      <td>{entry.time}</td>
                      <td>{entry.bonus}</td>
                      <td>{entry.quarter}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      No matching entries found
                    </td>
                  </tr>
                )}
              </TableBody>
            </HistoryTable>
            
            {filteredData.length > 0 && (
              <Pagination>
                <PaginationInfo>
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                </PaginationInfo>
                <PaginationButtons>
                  <PaginationButton 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    Previous
                  </PaginationButton>
                  
                  {/* Show limited number of page buttons */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Calculate which page numbers to show
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationButton
                        key={pageNum}
                        active={currentPage === pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        aria-label={`Page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </PaginationButton>
                    );
                  })}
                  
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    Next
                  </PaginationButton>
                </PaginationButtons>
              </Pagination>
            )}
          </>
        )}
      </Card>
    </Layout>
  );
};

export default History; 