import { useState, useEffect } from 'react';
import FlightCard from './FlightCard.jsx';
import amadeusService from '../services/amadeus';

// Sample data - in a real app, this would come from an API
const sampleFlights = [
  {
    id: 1,
    airline: 'IndiGo',
    logo: '✈️',
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
    logo: '✈️',
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
    logo: '✈️',
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
    logo: '✈️',
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
        
        // If API fails, use sample data for testing/fallback
        setOriginalFlights(sampleFlights);
        setFlights(sortFlightData(sampleFlights, 'price'));
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Flight Results</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0770e3]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-[#0770e3] text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Filters and sorting */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => sortFlights(e.target.value)}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                >
                  <option value="price">Price (Lowest first)</option>
                  <option value="duration">Duration (Shortest first)</option>
                  <option value="departure">Departure (Earliest first)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stops</label>
                <select 
                  value={filterStops} 
                  onChange={(e) => filterFlightsByStops(e.target.value)}
                  className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                >
                  <option value="all">All flights</option>
                  <option value="0">Direct flights only</option>
                  <option value="1">1 stop</option>
                  <option value="2">2+ stops</option>
                </select>
              </div>
            </div>
            
            {/* Flight list */}
            <div className="space-y-4">
              {flights.length > 0 ? (
                flights.map(flight => (
                  <FlightCard key={flight.id} flight={flight} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No flights match your criteria. Try adjusting your filters.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FlightResults; 