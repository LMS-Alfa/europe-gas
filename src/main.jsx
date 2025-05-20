import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './fonts.css'

// Import i18n configuration - make sure this is imported BEFORE the App
import './i18n.js'

// Loading component with nicer styling
const LoadingFallback = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: '#f5f5f5'
  }}>
    <div style={{
      padding: '20px',
      borderRadius: '8px',
      background: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '10px' }}>Loading...</div>
      <div style={{ fontSize: '14px', color: '#666' }}>Please wait while we load the application</div>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </React.StrictMode>,
)
