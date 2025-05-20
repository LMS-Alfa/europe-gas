import { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import Panel from './Panel';

const TableContainer = styled.div`
  width: 100% !important;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    overflow-x: auto;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    overflow-x: visible;
    padding: 0;
    margin: 0;
    width: 100% !important;
  }
`;

const Table = styled.table`
  width: 100% !important;
  border-collapse: separate;
  border-spacing: 0;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    border-collapse: collapse;
    display: block;
    width: 100% !important;
    margin: 0;
    padding: 0;
  }
`;

const TableBody = styled.tbody`
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: block;
    width: 100%;
  }
`;

const TableHead = styled.thead`
  background-color: ${props => props.theme.colors.background};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: none;
  }
`;

const TableRow = styled(motion.tr)`
  transition: background-color ${props => props.theme.transition.fast};
  
  &:hover {
    background-color: ${props => `${props.theme.colors.primary}05`};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: flex;
    flex-direction: column;
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    margin: 0 0 ${props => props.theme.spacing.xs} 0;
    padding: 0;
    background-color: ${props => props.theme.colors.surface};
    box-shadow: ${props => props.theme.shadows.sm};
    width: 100%;
    color: ${props => props.theme.colors.text.primary};
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const TableHeadCell = styled.th.attrs(props => {
  // Filter out custom props
  const { isSortable, ...rest } = props;
  return rest;
})`
  padding: ${props => props.theme.spacing.md};
  text-align: left;
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.secondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: relative;
  cursor: ${props => props.isSortable ? 'pointer' : 'default'};
  white-space: nowrap;

  &:hover {
    color: ${props => props.isSortable ? props.theme.colors.primary : props.theme.colors.text.secondary};
  }
`;

const SortIcon = styled.span`
  margin-left: ${props => props.theme.spacing.xs};
  transition: transform ${props => props.theme.transition.fast};
  display: inline-block;
  transform: ${props => props.direction === 'asc' ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const TableCell = styled.td`
  padding: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text.primary};
  
  /* Status cell styling */
  ${props => props.type === 'status' && `
    & > span {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: ${props.theme.borderRadius.pill};
      font-size: ${props.theme.typography.fontSize.sm};
      font-weight: ${props.theme.typography.fontWeight.medium};
    }
  `}
  
  .cell-content {
    display: inline-block;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-bottom: 1px solid ${props => props.theme.colors.border}10;
    font-size: ${props => props.theme.typography.fontSize.md};
    word-break: break-word;
    overflow: hidden;
    min-height: 36px;
    
    &:before {
      content: attr(data-label);
      font-weight: ${props => props.theme.typography.fontWeight.medium};
      color: ${props => props.theme.colors.text.secondary};
      margin-right: ${props => props.theme.spacing.sm};
      min-width: 80px;
      flex-shrink: 0;
    }
    
    & > * {
      text-align: right;
      flex: 1;
      color: ${props => props.theme.colors.text.primary};
      font-weight: ${props => props.theme.typography.fontWeight.regular};
    }
    
    .cell-content {
      display: block;
      text-align: right;
      color: ${props => props.theme.colors.text.primary};
      font-weight: ${props => props.theme.typography.fontWeight.medium};
      width: auto;
      max-width: 100%;
    }
    
    &:last-child {
      border-bottom: none;
      padding-bottom: ${props => props.theme.spacing.xs};
    }
    
    /* Name cell styling */
    ${props => props['data-label'] === 'Name' && `
      font-weight: ${props.theme.typography.fontWeight.bold};
      font-size: ${props.theme.typography.fontSize.lg};
      padding: ${props.theme.spacing.xs} ${props.theme.spacing.sm};
      border-bottom: 1px solid ${props.theme.colors.border}60;
      
      & > * {
        font-weight: ${props.theme.typography.fontWeight.bold};
      }
      
      .cell-content {
        font-weight: ${props.theme.typography.fontWeight.bold};
      }
    `}
    
    /* Email-specific styling */
    ${props => props['data-label'] === 'Email' && `
      white-space: normal;
      overflow-wrap: break-word;
      word-wrap: break-word;
      max-width: 100%;
      
      & > a {
        word-break: break-all;
      }
    `}
    
    /* Actions styling */
    ${props => props['data-label'] === 'Actions' && `
      justify-content: flex-end;
      padding-top: ${props.theme.spacing.xs};
      padding-bottom: ${props.theme.spacing.xs};
    `}
  }
`;

const StatusBadge = styled.span`
  background-color: ${props => {
    switch (props.status) {
      case 'success':
      case 'active':
      case 'completed':
        return `${props.theme.colors.success}15`;
      case 'warning':
      case 'pending':
        return `${props.theme.colors.warning}15`;
      case 'error':
      case 'failed':
        return `${props.theme.colors.error}15`;
      default:
        return `${props.theme.colors.primary}15`;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'success':
      case 'active':
      case 'completed':
        return props.theme.colors.success;
      case 'warning':
      case 'pending':
        return props.theme.colors.warning;
      case 'error':
      case 'failed':
        return props.theme.colors.error;
      default:
        return props.theme.colors.primary;
    }
  }};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0.25rem 0.75rem;
    font-size: ${props => props.theme.typography.fontSize.sm};
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    justify-content: flex-end;
    flex-shrink: 0;
    margin-left: auto;
    gap: ${props => props.theme.spacing.xs};
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  transition: color ${props => props.theme.transition.fast};
  
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: ${props => props.theme.borderRadius.circular};
    background-color: ${props => `${props.theme.colors.background}80`};
    margin-left: ${props => props.theme.spacing.xs};
    
    &:hover {
      background-color: ${props => `${props.theme.colors.primary}10`};
    }
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const EmptyState = styled.div`
  padding: ${props => props.theme.spacing.xl} 0;
  text-align: center;
  color: ${props => props.theme.colors.text.secondary};
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

const PageInfo = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.typography.fontSize.sm};
`;

const PageControls = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  align-items: center;
`;

const PageButton = styled.button`
  min-width: 36px;
  height: 36px;
  border-radius: ${props => props.theme.borderRadius.sm};
  background-color: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? '#fff' : props.theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  transition: all ${props => props.theme.transition.fast};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? props.theme.colors.primary : props.theme.colors.background};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    min-width: 40px;
    height: 40px;
  }
`;

const tableRowVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 }
};

// Override Panel styling for DataTable
const DataTablePanel = styled(Panel).attrs(props => {
  // Filter out custom props
  const { noPadding, compact, ...rest } = props;
  return rest;
})`
  width: 100% !important;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100% !important;
    
    & > div {
      width: 100% !important;
    }
  }
  
  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    & > div:first-child {
      padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
      margin: 0;
      width: 100% !important;
    }
    
    & > div {
      padding: ${props => props.theme.spacing.xs} !important;
      margin: 0;
      width: 100% !important;
    }
  }
`;

const DataTable = ({
  data = [],
  columns = [],
  title,
  icon,
  actions,
  onRowClick,
  sortable = true,
  pagination = true,
  pageSize = 10,
  emptyMessage = "No data to display",
  variant = "default",
  accent,
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'desc'
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;
  
  // Handle sorting
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Sort data if needed
  const sortedData = [...paginatedData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  // Calculate page controls
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of visible pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning or end
      if (currentPage <= 2) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      } else if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - maxVisiblePages + 2);
      }
      
      // Add ellipsis if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add visible pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  return (
    <DataTablePanel 
      title={title}
      icon={icon}
      actions={actions}
      variant={variant}
      accent={accent}
      noPadding
      compact
      {...props}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <tr>
              {columns.map((column, index) => (
                <TableHeadCell 
                  key={index}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                  isSortable={column.sortable !== false && sortable}
                  style={{ width: column.width }}
                >
                  {column.title}
                  {column.sortable !== false && sortable && sortConfig.key === column.key && (
                    <SortIcon direction={sortConfig.direction}>↓</SortIcon>
                  )}
                </TableHeadCell>
              ))}
            </tr>
          </TableHead>
          <TableBody>
            <AnimatePresence>
              {sortedData.length > 0 ? (
                sortedData.map((row, rowIndex) => (
                  <TableRow 
                    key={row.id || rowIndex}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.2, delay: rowIndex * 0.05 }}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell 
                        key={colIndex} 
                        type={column.type}
                        data-label={column.title}
                      >
                        {column.type === 'status' ? (
                          <StatusBadge status={row[column.key]}>
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </StatusBadge>
                        ) : column.type === 'actions' ? (
                          <TableActions>
                            {column.actions && column.actions.map((action, actionIndex) => (
                              <ActionButton 
                                key={actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                title={action.label}
                              >
                                {action.icon}
                              </ActionButton>
                            ))}
                          </TableActions>
                        ) : column.render ? (
                          <div className="cell-content">
                            {column.render(row[column.key], row)}
                          </div>
                        ) : (
                          <div className="cell-content">
                            {row[column.key]}
                          </div>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState>
                      {emptyMessage}
                    </EmptyState>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>
      
      {pagination && totalPages > 1 && (
        <Pagination>
          <PageInfo>
            Showing {startIndex + 1}-{Math.min(endIndex, data.length)} of {data.length} items
          </PageInfo>
          
          <PageControls>
            <PageButton
              onClick={() => setCurrentPage(curr => Math.max(curr - 1, 1))}
              disabled={currentPage === 1}
            >
              ←
            </PageButton>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`}>...</span>
              ) : (
                <PageButton
                  key={page}
                  active={currentPage === page}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </PageButton>
              )
            ))}
            
            <PageButton
              onClick={() => setCurrentPage(curr => Math.min(curr + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              →
            </PageButton>
          </PageControls>
        </Pagination>
      )}
    </DataTablePanel>
  );
};

export default DataTable; 