import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Papa from 'papaparse';

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

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.secondary ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.secondary ? props.theme.colors.primary : 'white'};
  border: ${props => props.secondary ? `1px solid ${props.theme.colors.primary}` : 'none'};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.secondary ? 
      props.theme.colors.primary + '10' : props.theme.colors.secondary};
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${props => props.theme.colors.primary};
`;

const PartsUpload = () => {
  const [csvData, setCsvData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState(null);
  const [columns, setColumns] = useState([]);
  
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0 && results.meta.fields) {
            setCsvData(results.data);
            setColumns(results.meta.fields);
            setMessage({
              type: 'success',
              text: `Successfully parsed ${results.data.length} rows of data.`
            });
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
  
  const handleSaveToDatabase = () => {
    setMessage({
      type: 'success',
      text: `${csvData.length} parts saved successfully!`
    });
  };
  
  const handleClearData = () => {
    setCsvData([]);
    setColumns([]);
    setFileName('');
    setMessage(null);
  };
  
  return (
      <Container>
        <title>Parts Upload</title>
        <Title>Parts Upload</Title>
        <UploadCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message && (
            <Message type={message.type}>
              {message.text}
            </Message>
          )}
          
          <UploadArea>
            <UploadIcon>📁</UploadIcon>
            <UploadText>
              {fileName ? `Selected file: ${fileName}` : 'Drag and drop your CSV file here, or click to browse'}
            </UploadText>
            <FileInput 
              type="file" 
              id="csv-upload" 
              accept=".csv" 
              onChange={handleFileUpload} 
            />
            <label htmlFor="csv-upload">
              <UploadButton
                as="span"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Browse Files
              </UploadButton>
            </label>
          </UploadArea>
          
          <InfoText>Upload a CSV file with the following columns: part_id, name, description, category, quantity</InfoText>
        </UploadCard>
        
        {csvData.length > 0 && (
          <PreviewCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <PreviewHeader>CSV Data Preview</PreviewHeader>
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
            <TableFooter>
              <span>{csvData.length} rows total. Showing first 5.</span>
            </TableFooter>
            
            <ButtonGroup>
              <Button secondary onClick={handleClearData}>Clear Data</Button>
              <Button onClick={handleSaveToDatabase}>Save to Database</Button>
            </ButtonGroup>
          </PreviewCard>
        )}
      </Container>
  );
};

export default PartsUpload; 