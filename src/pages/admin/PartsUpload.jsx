import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { motion } from 'framer-motion';
import Papa from 'papaparse';
import { FiSearch, FiUpload, FiFilter, FiEdit, FiTrash, FiCheckCircle, FiXCircle, FiRefreshCw } from 'react-icons/fi';
import { getParts, uploadParts, syncPartsStatus, testPartsStatusSync } from '../../utils/api';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const UploadCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 3rem;
  text-align: center;
  transition: all 0.2s ease;
  margin-bottom: 1.5rem;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const UploadText = styled.div`
  margin-bottom: 1.5rem;
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const FileInput = styled.input`
  display: none;
`;

const UploadButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.theme.colors.secondary};
  }
`;

const InfoText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const Message = styled.div`
  padding: 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.type === 'success' && `
    background-color: ${props.theme.colors.success}10;
    color: ${props.theme.colors.success};
  `}
  
  ${props => props.type === 'error' && `
    background-color: ${props.theme.colors.error}10;
    color: ${props.theme.colors.error};
  `}
`;

const PreviewCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-top: 2rem;
`;

const PreviewHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: ${props => props.theme.colors.text.primary};
`;

const PreviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background};
  
  th {
    padding: 0.75rem;
    text-align: left;
    font-weight: 500;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: ${props => props.theme.colors.background};
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid ${props => props.theme.colors.border};
  }
`;

const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  
  span {
    color: ${props => props.theme.colors.text.secondary};
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button.attrs(props => {
  // Filter out custom props
  const { secondary, ...rest } = props;
  return rest;
})`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.secondary ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.secondary ? props.theme.colors.primary : 'white'};
  border: ${props => props.secondary ? `1px solid ${props.theme.colors.primary}` : 'none'};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => props.secondary ? 
      props.theme.colors.primary + '10' : props.theme.colors.secondary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const PartsListCard = styled(motion.div)`
  background-color: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: ${props => props.theme.spacing.lg};
  box-shadow: ${props => props.theme.shadows.sm};
  margin-top: 2rem;
`;

const PartsListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-wrap: wrap;
  }
`;

const PartsTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  color: ${props => props.theme.colors.text.primary};
`;

const SearchContainer = styled.div`
  display: flex;
  width: 300px;
  position: relative;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.div`
  position: relative;
  width: 100%;
  
  input {
    width: 100%;
    padding: 0.75rem;
    padding-left: 2.5rem;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.primary};
      box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}20;
    }
  }
  
  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${props => props.theme.colors.text.secondary};
  }
`;

const SyncButton = styled(Button)`
  height: 40px;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  white-space: nowrap;
  
  svg {
    font-size: 16px;
  }
`;

const RefreshButton = styled.button`
  height: 40px;
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.theme.colors.primary}10;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${props => props.theme.colors.text.secondary};
  font-style: italic;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const Badge = styled.span`
  display: inline-flex;
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 0.75rem;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  background-color: ${props => {
    if (props.type === 'entered') return `${props.theme.colors.success}20`;
    if (props.type === 'not-entered') return `${props.theme.colors.error}20`;
    return props.theme.colors.border;
  }};
  color: ${props => {
    if (props.type === 'entered') return props.theme.colors.success;
    if (props.type === 'not-entered') return props.theme.colors.error;
    return props.theme.colors.text.secondary;
  }};
`;

const GlobalStyle = createGlobalStyle`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .spinning {
    animation: spin 1s linear infinite;
  }
`;

const PartsUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // State for parts list
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Fetch parts data on component mount
  useEffect(() => {
    fetchParts();
  }, []);
  
  // Filter parts when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = parts.filter(part => 
        (part.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.id || '').toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (part.serial_number || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParts(filtered);
    } else {
      setFilteredParts(parts);
    }
  }, [searchTerm, parts]);
  
  const fetchParts = async () => {
    try {
      setIsLoading(true);
      
      // First sync the status field with enteredparts
      await syncPartsStatus();
      
      // Then get the parts with updated status
      const data = await getParts();
      setParts(data);
      setFilteredParts(data);
    } catch (error) {
      console.error('Error fetching parts:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load parts. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true, // Automatically convert numeric values
        trimHeaders: true, // Trim whitespace from headers
        complete: (results) => {
          if (results.data && results.data.length > 0 && results.meta.fields) {
            console.log('CSV headers:', results.meta.fields);
            console.log('First row data:', results.data[0]);
            
            setCsvData(results.data);
            setColumns(results.meta.fields);
            setMessage({
              type: 'success',
              text: `Successfully parsed ${results.data.length} rows of data.`
            });
            console.log('Parsed CSV data:', results.data);
          } else {
            setCsvData([]);
            setColumns([]);
            setMessage({
              type: 'error',
              text: 'The CSV file is empty or invalid.'
            });
          }
        },
        error: (error) => {
          setCsvData([]);
          setColumns([]);
          setMessage({
            type: 'error',
            text: `Error parsing CSV: ${error.message}`
          });
        }
      });
    }
  };
  
  // Handle drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileInput = document.getElementById('csv-upload');
      fileInput.files = files;
      handleFileUpload({ target: { files } });
    }
  };
  
  const handleSaveToDatabase = async () => {
    try {
      setIsUploading(true);
      
      // Map CSV data to the format expected by the database
      const formattedData = csvData.map(row => {
        console.log("Processing row:", row); // Debug log for each row
        return {
          id: row.id,
          name: row.name,
          serial_number: row.serial_number,
          status: row.status,
        };
      });
      
      console.log('Data being uploaded:', formattedData); // Debug log
      
      // Upload to database
      const result = await uploadParts(formattedData);
      
      // Sync parts status with enteredparts table
      await syncPartsStatus();
      
      // Show success message
      if (result.skippedAll) {
        setMessage({
          type: 'error',
          text: 'All parts were skipped because they already exist in the database.'
        });
      } else if (result.skipped > 0) {
        setMessage({
          type: 'success',
          text: `${result.added} parts saved successfully! ${result.skipped} parts were skipped because they already exist.`
        });
      } else {
        setMessage({
          type: 'success',
          text: `${result.added} parts saved successfully!`
        });
      }
      
      // Refresh the parts list
      fetchParts();
      
      // Clear the upload form
      handleClearData();
    } catch (error) {
      console.error('Error uploading parts:', error);
      setMessage({
        type: 'error',
        text: `Error uploading parts: ${error.message}`
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleClearData = () => {
    setCsvData([]);
    setColumns([]);
    setFileName('');
    setMessage(null);
  };
  
  const handleSyncStatus = async () => {
    try {
      setIsSyncing(true);
      const result = await syncPartsStatus();
      
      // Test results after sync
      const testResult = await testPartsStatusSync();
      
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Successfully synchronized status for ${result.updated} parts. ${testResult.success ? 'Status is now in sync!' : `There are still ${testResult.mismatchCount} mismatches.`}`
        });
      } else {
        setMessage({
          type: 'error',
          text: `Error synchronizing status: ${result.error}`
        });
      }
      
      // Refresh parts list
      fetchParts();
    } catch (error) {
      console.error('Error syncing status:', error);
      setMessage({
        type: 'error',
        text: `Error syncing part status: ${error.message}`
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
      <Container>
        <GlobalStyle />
        <title>Parts Upload</title>
        <Title>Parts Upload</Title>
        <UploadCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message && (
            <Message type={message.type}>
              {message.type === 'success' ? <FiCheckCircle /> : <FiXCircle />}
              {message.text}
            </Message>
          )}
          
          <UploadArea
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <UploadIcon><FiUpload size={48} /></UploadIcon>
            <UploadText>
              {fileName ? `Selected file: ${fileName}` : 'Drag and drop your CSV file here, or click to browse'}
            </UploadText>
            <label htmlFor="csv-upload">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UploadButton as="div">
                  <FiUpload size={16} /> Browse Files
                </UploadButton>
              </motion.div>
            </label>
            <FileInput 
              type="file" 
              id="csv-upload" 
              accept=".csv" 
              onChange={handleFileUpload}
            />
          </UploadArea>
          
          <InfoText>
            The CSV file should contain the following columns: name, serial_number. Parts with serial numbers that already exist in the database will be skipped. The status field should be true/false indicating if the part has been entered.
          </InfoText>
          
          {csvData.length > 0 && (
            <PreviewCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <PreviewHeader>Preview ({csvData.length} rows)</PreviewHeader>
              <div style={{ overflowX: 'auto' }}>
                <PreviewTable>
                  <TableHead>
                    <tr>
                      {columns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </TableHead>
                  <TableBody>
                    {csvData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((column, colIndex) => (
                          <td key={colIndex}>{row[column]}</td>
                        ))}
                      </tr>
                    ))}
                  </TableBody>
                </PreviewTable>
              </div>
              
              <TableFooter>
                <span>Showing 5 of {csvData.length} rows</span>
              </TableFooter>
              
              <ButtonGroup>
                <Button 
                  secondary={true}
                  onClick={handleClearData}
                  disabled={isUploading}
                >
                  <FiXCircle size={16} /> Clear
                </Button>
                <Button 
                  onClick={handleSaveToDatabase}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : (
                    <>
                      <FiCheckCircle size={16} /> Save to Database
                    </>
                  )}
                </Button>
              </ButtonGroup>
            </PreviewCard>
          )}
        </UploadCard>
        
        {/* Parts List Section */}
        <PartsListCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <PartsListHeader>
            <PartsTitle>Parts Inventory</PartsTitle>
            
            <HeaderActions>
              <SearchContainer>
                <SearchInput>
                  <FiSearch size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </SearchInput>
              </SearchContainer>
              
              <SyncButton 
                secondary={true}
                onClick={handleSyncStatus}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <FiRefreshCw size={16} className="spinning" /> Syncing...
                  </>
                ) : (
                  <>
                    <FiCheckCircle size={16} /> Sync Status
                  </>
                )}
              </SyncButton>
              
              <RefreshButton onClick={fetchParts}>
                <FiRefreshCw size={16} /> Refresh
              </RefreshButton>
            </HeaderActions>
          </PartsListHeader>
          
          {isLoading ? (
            <LoadingIndicator>Loading parts...</LoadingIndicator>
          ) : filteredParts.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <PreviewTable>
                <TableHead>
                  <tr>
                    <th>Part ID</th>
                    <th>Name</th>
                    <th>Serial Number</th>
                    <th>Status</th>
                  </tr>
                </TableHead>
                <TableBody>
                  {filteredParts.map((part, index) => {
                    console.log('Rendering part:', part);
                    return (
                    <tr key={part.id || index}>
                      <td>{part.id}</td>
                      <td>{part.name}</td>
                      <td>{part.serial_number}</td>
                      <td>
                        {part.status === true ? (
                          <Badge type="entered">Entered</Badge>
                        ) : (
                          <Badge type="not-entered">Not Entered</Badge>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </TableBody>
              </PreviewTable>
              
              <TableFooter>
                <span>
                  {filteredParts.length === parts.length 
                    ? `Showing all ${parts.length} parts` 
                    : `Showing ${filteredParts.length} of ${parts.length} parts`}
                </span>
              </TableFooter>
            </div>
          ) : (
            <EmptyMessage>
              {searchTerm 
                ? 'No parts match your search criteria' 
                : 'No parts found. Upload some parts to get started.'}
            </EmptyMessage>
          )}
        </PartsListCard>
      </Container>
  );
};

export default PartsUpload; 