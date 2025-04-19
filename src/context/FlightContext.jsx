
import { createContext, useState, useContext, useEffect } from 'react';
import amadeusService from '../services/amadeus';
import { 
  getFavoriteFlights, 
  addFavoriteFlight, 
  removeFavoriteFlight 
} from '../services/firebase';
import { useAuth } from './AuthContext';

/**
 * FlightContext - Context for managing global flight state
 * 
 * Provides:
 * - Recent searches
 * - Favorite flights
 * - Loading states
 * - Error handling
 */
const FlightContext = createContext();

/**
 * FlightProvider - Provider component for FlightContext
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function FlightProvider({ children }) {
  // Get authentication context
  const { currentUser } = useAuth();
  
  // State for recent searches
  const [recentSearches, setRecentSearches] = useState(() => {
    // Try to load from localStorage on init
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });

  // State for favorite flights
  const [favorites, setFavorites] = useState([]);
  
  // State for favorites loading
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  // State for popular routes
  const [popularRoutes, setPopularRoutes] = useState([
    { from: 'DEL', to: 'BOM', label: 'Delhi to Mumbai' },
    { from: 'BLR', to: 'DEL', label: 'Bangalore to Delhi' },
    { from: 'DEL', to: 'BLR', label: 'Delhi to Bangalore' },
    { from: 'BOM', to: 'GOI', label: 'Mumbai to Goa' },
    { from: 'DEL', to: 'CCU', label: 'Delhi to Kolkata' }
  ]);

  // Global loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Global error state
  const [error, setError] = useState(null);

  // Load favorites when user changes
  useEffect(() => {
    async function loadFavorites() {
      if (currentUser) {
        setLoadingFavorites(true);
        try {
          const userFavorites = await getFavoriteFlights(currentUser.uid);
          setFavorites(userFavorites);
        } catch (err) {
          setError('Failed to load favorites: ' + err.message);
        } finally {
          setLoadingFavorites(false);
        }
      } else {
        // Clear favorites when user signs out
        setFavorites([]);
      }
    }
    
    loadFavorites();
  }, [currentUser]);

  // Save to localStorage when recent searches change
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  /**
   * Add a search to recent searches
   * @param {Object} searchParams - The search parameters
   */
  const addRecentSearch = (searchParams) => {
    setRecentSearches(prev => {
      // Remove duplicates
      const filtered = prev.filter(s => 
        s.from !== searchParams.from || 
        s.to !== searchParams.to || 
        s.departure !== searchParams.departure
      );
      
      // Add to beginning of array, limit to 5
      return [searchParams, ...filtered].slice(0, 5);
    });
  };

  /**
   * Add a flight to favorites
   * @param {Object} flight - The flight to add to favorites
   */
  const addToFavorites = async (flight) => {
    if (!currentUser) {
      setError('You must be signed in to save favorites');
      return;
    }
    
    try {
      setError(null);
      
      // Check if already in favorites
      if (favorites.some(f => f.id === flight.id)) {
        return;
      }
      
      // Add to Firebase
      await addFavoriteFlight(currentUser.uid, flight);
      
      // Update local state
      setFavorites(prev => [flight, ...prev]);
    } catch (err) {
      setError('Failed to add favorite: ' + err.message);
    }
  };

  /**
   * Remove a flight from favorites
   * @param {string} flightId - The ID of the flight to remove
   */
  const removeFromFavorites = async (flightId) => {
    if (!currentUser) {
      setError('You must be signed in to manage favorites');
      return;
    }
    
    try {
      setError(null);
      
      // Remove from Firebase
      await removeFavoriteFlight(currentUser.uid, flightId);
      
      // Update local state
      setFavorites(prev => prev.filter(f => f.id !== flightId));
    } catch (err) {
      setError('Failed to remove favorite: ' + err.message);
    }
  };

  /**
   * Search for flights with parameters
   * @param {Object} params - Search parameters
   * @returns {Promise<Array>} - Array of flight results
   */
  const searchFlights = async (params) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add to recent searches
      addRecentSearch(params);
      
      // Search flights
      const results = await amadeusService.searchFlights(params);
      return results;
    } catch (err) {
      setError(err.message || 'Failed to search flights');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    recentSearches,
    favorites,
    popularRoutes,
    isLoading,
    loadingFavorites,
    error,
    addRecentSearch,
    addToFavorites,
    removeFromFavorites,
    searchFlights,
    clearError: () => setError(null)
  };

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}

/**
 * useFlightContext - Custom hook to use the FlightContext
 * @returns {Object} - FlightContext value
 */
export function useFlightContext() {
  const context = useContext(FlightContext);
  if (context === undefined) {
    throw new Error('useFlightContext must be used within a FlightProvider');
  }
  return context;
} 