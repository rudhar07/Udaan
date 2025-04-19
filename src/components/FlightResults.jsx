import { useState, useEffect } from 'react';
import FlightCard from './FlightCard.jsx';
import amadeusService from '../services/amadeus';

// Sample data - in a real app, this would come from an API
const sampleFlights = [
  {
    id: 1,
    airline: 'IndiGo',
    logo: 'https://logos-world.net/wp-content/uploads/2023/01/IndiGo-Logo-700x394.png',
    departureTime: '06:00',
    arrivalTime: '08:30',
    departureAirport: 'DEL',
    arrivalAirport: 'BOM',
    duration: '2h 30m',
    stops: 0,
    price: 3500,
    currency: '₹'
  },
  {
    id: 2,
    airline: 'Air India',
    logo: 'https://logos-world.net/wp-content/uploads/2023/02/Air-India-Logo-700x394.png',
    departureTime: '10:15',
    arrivalTime: '13:30',
    departureAirport: 'DEL',
    arrivalAirport: 'BOM',
    duration: '3h 15m',
    stops: 1,
    price: 4200,
    currency: '₹'
  },
  {
    id: 3,
    airline: 'Vistara',
    logo: 'https://logos-world.net/wp-content/uploads/2023/03/Vistara-Logo-700x394.png',
    departureTime: '16:45',
    arrivalTime: '19:00',
    departureAirport: 'DEL',
    arrivalAirport: 'BOM',
    duration: '2h 15m',
    stops: 0,
    price: 5100,
    currency: '₹'
  },
  {
    id: 4,
    airline: 'SpiceJet',
    logo: 'https://logos-world.net/wp-content/uploads/2023/01/SpiceJet-Logo-2014-present-700x394.png',
    departureTime: '19:30',
    arrivalTime: '22:15',
    departureAirport: 'DEL',
    arrivalAirport: 'BOM',
    duration: '2h 45m',
    stops: 0,
    price: 3200,
    currency: '₹'
  },
];

function FlightResults({ searchParams }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [filterStops, setFilterStops] = useState('all');
  const [originalFlights, setOriginalFlights] = useState([]);

  // Fetch flight data when component mounts or search params change
  useEffect(() => {
    async function fetchFlightData() {
      setLoading(true);
      setError(null);
      
      try {
        // Check if we have valid search parameters
        if (!searchParams || !searchParams.from || !searchParams.to || !searchParams.departure) {
          throw new Error('Invalid search parameters. Please provide origin, destination and departure date.');
        }
        
        // Convert date format from YYYY-MM-DD to YYYY-MM-DD (already correct format)
        const formattedParams = {
          ...searchParams,
        };
        
        // Fetch flight data from Amadeus API
        const flightData = await amadeusService.searchFlights(formattedParams);
        
        // Store the original flights for filtering later
        setOriginalFlights(flightData);
        
        // Apply initial sorting
        const sortedFlights = sortFlightData(flightData, 'price');
        setFlights(sortedFlights);
      } catch (err) {
        console.error('Error fetching flight data:', err);
        setError(err.message || 'Failed to fetch flight data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchFlightData();
  }, [searchParams]);

  // Sort flights based on selected criteria
  const sortFlights = (criteria) => {
    setSortBy(criteria);
    const sortedFlights = sortFlightData([...flights], criteria);
    setFlights(sortedFlights);
  };
  
  // Helper function to sort flight data
  const sortFlightData = (flightData, criteria) => {
    switch (criteria) {
      case 'price':
        return flightData.sort((a, b) => a.price - b.price);
      case 'duration':
        return flightData.sort((a, b) => {
          // Convert duration strings to minutes for comparison
          const durationToMinutes = (dur) => {
            const [hours, minutes] = dur.match(/(\d+)h\s*(\d+)m/).slice(1).map(Number);
            return hours * 60 + minutes;
          };
          return durationToMinutes(a.duration) - durationToMinutes(b.duration);
        });
      case 'departure':
        return flightData.sort((a, b) => {
          const timeToMinutes = (time) => {
            const [hours, minutes] = time.split(':').map(Number);
            return hours * 60 + minutes;
          };
          return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
        });
      default:
        return flightData;
    }
  };

  // Filter flights based on number of stops
  const filterFlightsByStops = (filter) => {
    setFilterStops(filter);
    let filteredFlights = [...originalFlights]; // Reset to original flights
    
    if (filter !== 'all') {
      const stops = parseInt(filter);
      filteredFlights = filteredFlights.filter(flight => flight.stops === stops);
    }
    
    // Apply current sort after filtering
    setFlights(sortFlightData(filteredFlights, sortBy));
  };

  // Format the search parameters for display
  const formatSearchSummary = () => {
    if (!searchParams) return '';
    
    const from = searchParams.from;
    const to = searchParams.to;
    const departureDate = new Date(searchParams.departure).toLocaleDateString('en-US', {
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
    
    let summary = `${from} to ${to} · ${departureDate}`;
    
    if (searchParams.return) {
      const returnDate = new Date(searchParams.return).toLocaleDateString('en-US', {
        weekday: 'short', 
        month: 'short', 
        day: 'numeric'
      });
      summary += ` · Return: ${returnDate}`;
    }
    
    summary += ` · ${searchParams.passengers} passenger${searchParams.passengers > 1 ? 's' : ''}`;
    summary += ` · ${searchParams.cabinClass.charAt(0).toUpperCase() + searchParams.cabinClass.slice(1)}`;
    
    return summary;
  };

  return (
    <div className="relative">
      {/* Search summary and results count */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">{searchParams?.from} → {searchParams?.to}</h2>
            <p className="text-indigo-100">{formatSearchSummary()}</p>
          </div>
          
          {!loading && !error && (
            <div className="mt-4 md:mt-0 bg-white/20 rounded-lg py-2 px-4 text-sm backdrop-blur-sm">
              <span className="font-semibold">{flights.length}</span> {flights.length === 1 ? 'flight' : 'flights'} found
            </div>
          )}
        </div>
      </div>
        
      {/* Main content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-md p-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 animate-pulse">Searching for the best flights...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Search Error</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Filters and sorting */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-5">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                <div className="relative">
                  <select 
                    value={sortBy} 
                    onChange={(e) => sortFlights(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  >
                    <option value="price">Price (Lowest first)</option>
                    <option value="duration">Duration (Shortest first)</option>
                    <option value="departure">Departure (Earliest first)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-[180px]">
                <label className="block text-sm font-medium text-slate-700 mb-2">Filter by stops</label>
                <div className="relative">
                  <select 
                    value={filterStops} 
                    onChange={(e) => filterFlightsByStops(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
                  >
                    <option value="all">All flights</option>
                    <option value="0">Direct flights only</option>
                    <option value="1">1 stop</option>
                    <option value="2">2+ stops</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
            
          {/* Flight list */}
          <div className="space-y-6">
            {flights.length > 0 ? (
              flights.map(flight => (
                <FlightCard key={flight.id} flight={flight} />
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-md p-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No flights found</h3>
                <p className="text-slate-600 mb-6">
                  No flights match your criteria. Try changing your filters or search for different dates.
                </p>
                <button 
                  onClick={() => filterFlightsByStops('all')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  Show all flights
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlightResults; 