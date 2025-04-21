import { createContext, useState, useContext, useEffect } from 'react';

/**
 * ThemeContext - Context for managing global theme state
 * 
 * Provides:
 * - Current theme (light/dark)
 * - Toggle theme function
 */
const ThemeContext = createContext();

/**
 * ThemeProvider - Provider component for ThemeContext
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ThemeProvider({ children }) {
  // State for theme mode, with localStorage persistence
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Try to load from localStorage on init
    const savedTheme = localStorage.getItem('theme');
    
    // If no saved preference, use system preference
    if (!savedTheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return savedTheme === 'dark';
  });

  // Apply theme to document when it changes
  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Context value
  const value = {
    isDarkMode,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme - Custom hook to use the ThemeContext
 * @returns {Object} - ThemeContext value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 