/**
 * Utility functions for exporting charts and data
 */
import * as XLSX from 'xlsx';

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
    
    // Debug helper to list all available IDs in the document
    console.log('Available elements with IDs:');
    const allElementsWithId = document.querySelectorAll('[id]');
    allElementsWithId.forEach(el => {
      console.log(`- ${el.id} (${el.tagName})`);
    });
    
    alert(`Error: Chart element not found with ID: ${elementId}`);
    return;
  }
  
  console.log(`Found element with ID ${elementId}:`, element);
  
  try {
    // Find SVG element using more robust selector patterns for Recharts
    let svgElement = element.querySelector('svg');
    
    // If not found as direct child, look deeper using multiple patterns
    if (!svgElement) {
      // Look in different nested containers that Recharts might create
      const possibleContainers = [
        element.querySelector('.recharts-wrapper'),
        element.querySelector('.recharts-surface'),
        element.querySelector('.recharts-responsive-container')
      ];
      
      // Try each possible container
      for (const container of possibleContainers) {
        if (container) {
          svgElement = container.querySelector('svg');
          if (svgElement) break;
        }
      }
      
      // If still not found, try getting any SVG deeper in the DOM
      if (!svgElement) {
        svgElement = element.getElementsByTagName('svg')[0];
      }
    }
    
    if (svgElement) {
      console.log(`Found SVG element for ${elementId}, proceeding with export`);
      
      // Create a clone of the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true);
      
      // Ensure SVG has proper dimensions
      const boundingRect = svgElement.getBoundingClientRect();
      clonedSvg.setAttribute('width', boundingRect.width);
      clonedSvg.setAttribute('height', boundingRect.height);
      
      // Inline styles for better rendering in exported image
      const styles = document.querySelectorAll('style');
      let styleText = '';
      styles.forEach(style => styleText += style.textContent);
      
      // Add a style element to the cloned SVG
      const styleElement = document.createElement('style');
      styleElement.textContent = styleText;
      clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);
      
      // Serialize SVG to a string
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      
      // Create a Blob from the SVG string
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Create an Image element to draw the SVG on a canvas
      const img = new Image();
      
      img.onload = function() {
        // Create a canvas with the same dimensions
        const canvas = document.createElement('canvas');
        canvas.width = boundingRect.width;
        canvas.height = boundingRect.height;
        const ctx = canvas.getContext('2d');
        
        // Fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0);
        
        // Release the object URL
        URL.revokeObjectURL(url);
        
        // Convert canvas to PNG and download
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
        console.error('Error loading SVG image for export');
        URL.revokeObjectURL(url);
        
        // Fallback to direct SVG download if PNG conversion fails
        try {
          console.log('Attempting direct SVG download as fallback');
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
          const svgUrl = URL.createObjectURL(svgBlob);
          const link = document.createElement('a');
          link.download = `${fileName}.svg`;
          link.href = svgUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(svgUrl);
          console.log(`Chart downloaded as ${fileName}.svg`);
        } catch (svgErr) {
          console.error('Error with SVG fallback:', svgErr);
          alert('Failed to export chart: Could not convert to image');
        }
      };
      
      img.src = url;
    } else {
      console.warn(`No SVG element found in chart with ID: ${elementId}, attempting fallback capture`);
      
      // Create a simple canvas as a fallback
      const canvas = document.createElement('canvas');
      const rect = element.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      const ctx = canvas.getContext('2d');
      
      // Set background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw placeholder text
      ctx.font = '16px Arial';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'center';
      ctx.fillText('Chart export not available', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillText('Please use screenshot tool instead', canvas.width / 2, canvas.height / 2 + 20);
      
      // Convert canvas to image and download
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('This chart could not be automatically exported. A placeholder has been downloaded instead. Please use your system screenshot tool to capture the chart.');
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
 * Exports data as an Excel file
 * 
 * @param {Array} data - The data to export
 * @param {string} fileName - The name of the downloaded file (without extension)
 */
export const exportAsExcel = (data, fileName) => {
  if (!data || !data.length) {
    console.error('No data to export');
    return false;
  }
  
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Set column widths for better readability
    const columnWidths = [];
    const headerKeys = Object.keys(data[0]);
    
    // Set width based on header length (plus some padding)
    headerKeys.forEach(key => {
      columnWidths.push({ wch: Math.max(key.length + 2, 15) });
    });
    
    worksheet['!cols'] = columnWidths;
    
    // Export the workbook
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting data as Excel:', error);
    return false;
  }
};

/**
 * Exports a report as Excel with formatted data
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
    // Generate a filename
    const dateStr = formatDateForFileName();
    const periodStr = periodName ? `_${periodName.replace(/\s+/g, '_')}` : '';
    const fileName = `${reportType}_report${periodStr}_${dateStr}`;
    
    // Export as Excel
    return exportAsExcel(reportData, fileName);
  } catch (error) {
    console.error('Error exporting report:', error);
    alert('Failed to export report');
    return false;
  }
}; 