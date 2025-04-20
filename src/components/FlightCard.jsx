import React, { useState, useMemo } from 'react';
import { useFlightContext } from '../context/FlightContext';
import { useAuth } from '../context/AuthContext';

// Airline logo mapping
const airlineLogos = {
  'IndiGo': 'https://upload.wikimedia.org/wikipedia/commons/9/9b/IndiGo_Airlines_logo.svg',
  'Air India': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Air_India.svg',
  'Vistara': 'https://companieslogo.com/img/orig/VISTARA-c07b120f.png',
  'SpiceJet': 'https://companieslogo.com/img/orig/SPICEJET-6a0c3b5e.png?t=1633073270',
  'GoAir': 'https://seeklogo.com/images/G/goair-airlines-logo-276810-seeklogo.com.png',
  'AirAsia': 'https://upload.wikimedia.org/wikipedia/commons/2/2b/AirAsia_New_Logo_%282020%29.svg',
  'Alliance Air': 'https://airhex.com/images/airline-logos/alliance-air.png',
  // Add more airlines as needed
};

// Default logo for airlines not in the mapping
const defaultLogo = '✈️';

/**
 * FlightCard - A component to display flight information 
 * 
 * @param {Object} props - Component props
 * @param {Object} props.flight - Flight data object
 */
function FlightCard({ flight }) {
  const { favorites, addToFavorites, removeFromFavorites } = useFlightContext();
  const { currentUser, login } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Default values in case flight object is not complete
  const {
    id = `FL${Math.random().toString(36).substr(2, 9)}`,
    airline = 'Airline',
    logo = airlineLogos[airline] || defaultLogo,
    departureTime = '00:00',
    arrivalTime = '00:00',
    departureAirport = 'DEP',
    arrivalAirport = 'ARR',
    duration = '0h 0m',
    stops = 0,
    price = 0,
    currency = 'INR',
    bookingLink = '#'
  } = flight || {};

  // Generate a consistent flight number based on flight attributes but outside 1000-1009
  const flightNumber = useMemo(() => {
    // Create a hash from flight attributes
    const hash = `${airline}${departureAirport}${arrivalAirport}${departureTime}`.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate a number between 1010-9999
    return 1010 + (hash % 8990);
  }, [airline, departureAirport, arrivalAirport, departureTime]);

  // Check if flight is in favorites using multiple properties for more accurate matching
  const isFavorite = favorites.some(fav => 
    fav.departureAirport === departureAirport && 
    fav.arrivalAirport === arrivalAirport &&
    fav.departureTime === departureTime &&
    fav.airline === airline
  );

  // Format stops text
  const stopsText = stops === 0 
    ? 'Direct' 
    : stops === 1 
      ? '1 stop' 
      : `${stops} stops`;
      
  // Get color based on stops
  const getStopsColor = () => {
    if (stops === 0) return 'bg-green-100 text-green-800';
    if (stops === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  // Handle booking click
  const handleBookingClick = () => {
    window.open(bookingLink, '_blank');
  };

  // Handle favorite toggle
  const handleFavoriteToggle = () => {
    if (!currentUser) {
      setShowLoginPrompt(true);
      setTimeout(() => setShowLoginPrompt(false), 3000);
      return;
    }
    
    if (isFavorite) {
      // Find the favorite item by matching properties
      const favoriteItem = favorites.find(fav => 
        fav.departureAirport === departureAirport && 
        fav.arrivalAirport === arrivalAirport &&
        fav.departureTime === departureTime &&
        fav.airline === airline
      );
      
      if (favoriteItem) {
        removeFromFavorites(favoriteItem.id);
      }
    } else {
      // Add flight with the consistent flight number
      const flightWithConsistentNumber = {
        ...flight,
        flightNumber: flightNumber
      };
      addToFavorites(flightWithConsistentNumber);
    }
  };

  // Handle sign in
  const handleSignIn = (e) => {
    e.stopPropagation();
    login();
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-100 transform hover:-translate-y-1">
      <div className="p-5">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center space-x-3">
            {typeof logo === 'string' && logo.startsWith('http') ? (
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={logo} 
                  alt={`${airline} logo`} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.parentNode.innerHTML = defaultLogo;
                  }}
                />
              </div>
            ) : (
              <div className="text-2xl bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center">{defaultLogo}</div>
            )}
            <div className="flex flex-col">
              <div className="font-medium text-slate-800">{airline}</div>
              <div className="text-xs text-slate-500">Flight #{flightNumber}</div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative">
              <button 
                onClick={handleFavoriteToggle}
                className={`mr-4 p-2 rounded-full transition-colors hover-heart ${
                  isFavorite 
                    ? 'bg-red-100 text-red-500 hover:bg-red-200' 
                    : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                title={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      fillRule="evenodd" 
                      d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    ></path>
                  </svg>
                )}
              </button>
              
              {showLoginPrompt && !currentUser && (
                <div className="absolute right-0 top-0 mt-10 w-48 bg-white rounded-lg shadow-lg p-3 z-10 text-xs animate-fade-in">
                  <p className="text-slate-700 mb-2">Sign in to save favorites</p>
                  <button
                    onClick={handleSignIn}
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-indigo-600">
                {currency} {price.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">per passenger</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-slate-800">{departureTime}</span>
            <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded-lg text-slate-600 mt-1">{departureAirport}</span>
          </div>
          
          <div className="flex-1 mx-4 relative">
            <div className="h-[2px] bg-slate-200 my-4 relative">
              <div className="absolute inset-y-0 left-0 h-full w-full flex items-center justify-center">
                <div className="bg-white px-2">
                  <span className={`text-xs font-medium ${getStopsColor()} rounded-full px-2 py-1`}>{stopsText}</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-center text-slate-500 font-medium">{duration}</div>
            
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-indigo-500 bg-white"></div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-slate-800">{arrivalTime}</span>
            <span className="text-sm font-medium bg-slate-100 px-2 py-1 rounded-lg text-slate-600 mt-1">{arrivalAirport}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-xs text-slate-500 mb-5">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
            </svg>
            On-time performance: 92%
          </div>
          
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            Available seats: {Math.floor(Math.random() * 50) + 10}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button 
            onClick={handleBookingClick}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
            </svg>
            Book this flight
          </button>
          
          <button 
            className="w-full border border-slate-200 text-slate-600 font-medium py-2 px-4 rounded-lg hover:bg-slate-50 transition duration-300 flex items-center justify-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path>
            </svg>
            Flight details
          </button>
        </div>
      </div>
      
      <div className="border-t border-slate-100 px-5 py-3 bg-slate-50 flex justify-between text-xs">
        <div className="flex items-center text-slate-500">
          <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Flexible booking
        </div>
        <div className="flex items-center text-slate-500">
          <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
          Verified by Udaan
        </div>
      </div>
    </div>
  );
}

export default FlightCard; 