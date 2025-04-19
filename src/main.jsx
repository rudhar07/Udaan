import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { FlightProvider } from './context/FlightContext'
import { AuthProvider } from './context/AuthContext'

/**
 * Main application entry point
 * Wraps the App component with necessary providers:
 * - StrictMode for development checks
 * - AuthProvider for authentication state management
 * - FlightProvider for global flight state management
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <FlightProvider>
        <App />
      </FlightProvider>
    </AuthProvider>
  </StrictMode>,
)
