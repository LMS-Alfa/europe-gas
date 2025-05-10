/**
 * Utility functions for exporting charts and data
 */

/**
 * Converts an HTML element to an image and triggers download
 * 
 * @param {string} elementId - The ID of the element to convert
 * @param {string} fileName - The name of the downloaded file (without extension)
 */
export const downloadElementAsImage = (elementId, fileName) => {
  // Get the element
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID ${elementId} not found`);
    alert(`Error: Chart element not found`);
    return;
  }
  
  try {
    // Find SVG element - either direct child or inside ResponsiveContainer
    let svgElement = element.querySelector('svg');
    
    // If not found as direct child, look deeper in the DOM tree
    if (!svgElement) {
      // Look for SVG in nested containers (Recharts specific structure)
      const containerElement = element.querySelector('.recharts-wrapper');
      if (containerElement) {
        svgElement = containerElement.querySelector('svg');
      }
    }
    
    if (svgElement) {
      // For SVG charts (Recharts)
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match SVG
      const rect = svgElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Create an image from SVG
      const img = new Image();
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = function() {
        // Draw image on canvas
        ctx.fillStyle = '#1a1a1a'; // Dark background to match theme
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        // Convert canvas to PNG
        try {
          const dataUrl = canvas.toDataURL('image/png');
          
          // Create a download link
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          console.log(`Chart downloaded as ${fileName}.png`);
        } catch (err) {
          console.error('Error converting canvas to PNG:', err);
          alert('Failed to export chart: ' + err.message);
        }
      };
      
      img.onerror = function() {
        console.error('Error loading SVG image');
        alert('Failed to export chart: Error loading SVG image');
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } else {
      // Attempt to capture the entire element as an image using html2canvas approach
      console.warn('No SVG element found in chart, attempting fallback capture');
      
      // Create a canvas matching the element dimensions
      const canvas = document.createElement('canvas');
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = '#1a1a1a'; // Dark background to match theme
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw text indicating manual screenshot is needed
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('Please use screenshot tool to capture this chart', canvas.width / 2, canvas.height / 2);
      
      // Convert canvas to image and download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('This chart type could not be automatically exported. A placeholder has been downloaded instead. Please use your system screenshot tool to capture the chart.');
      } catch (err) {
        console.error('Error with fallback capture:', err);
        alert('Failed to export chart. Please use your system screenshot tool instead.');
      }
    }
  } catch (error) {
    console.error('Error exporting chart:', error);
    alert(`Failed to export chart: ${error.message}`);
  }
};

/**
 * Exports data as a CSV file
 * 
 * @param {Array} data - The data to export
 * @param {Array} headers - The column headers
 * @param {string} fileName - The name of the downloaded file (without extension)
 */
export const exportAsCSV = (data, headers, fileName) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return;
  }
  
  try {
    // Create CSV content
    let csvContent = '';
    
    // Add headers
    if (headers && headers.length) {
      csvContent += headers.join(',') + '\n';
    }
    
    // Add data rows
    data.forEach(item => {
      const row = headers.map(header => {
        // Get the value for this header
        const value = item[header] || '';
        
        // Escape commas and quotes in the value
        const escapedValue = String(value).replace(/"/g, '""');
        
        // Wrap in quotes if contains comma, newline or quote
        return /[",\n]/.test(escapedValue) ? `"${escapedValue}"` : escapedValue;
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    // Create a blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting data as CSV:', error);
    return false;
  }
};

/**
 * Formats date object to YYYY-MM-DD format
 * 
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string
 */
export const formatDateForFileName = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Exports a report as CSV with formatted data
 * 
 * @param {Array} reportData - The report data to export
 * @param {string} reportType - The type of report (used in filename)
 * @param {string} periodName - Optional period name to include in filename
 */
export const exportReport = (reportData, reportType, periodName = '') => {
  if (!reportData || !reportData.length) {
    alert('No data available to export');
    return false;
  }
  
  try {
    // Get headers from the first data item
    const headers = Object.keys(reportData[0]);
    
    // Generate a filename
    const dateStr = formatDateForFileName();
    const periodStr = periodName ? `_${periodName.replace(/\s+/g, '_')}` : '';
    const fileName = `${reportType}_report${periodStr}_${dateStr}`;
    
    // Export as CSV
    return exportAsCSV(reportData, headers, fileName);
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Failed to export report');
    return false;
  }
}; 