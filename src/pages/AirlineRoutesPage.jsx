import { useState } from 'react';
import amadeusService from '../services/amadeus';

// Route Card Component
function RouteCard({ route }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold">
              {route.departureAirport} → {route.arrivalAirport}
            </h3>
          </div>
          {route.aircraft && (
            <div>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                {route.aircraft}
              </span>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between">
          <a
            href={`https://www.flightradar24.com/data/airports/${route.departureAirport.toLowerCase()}/departures`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0770e3] hover:underline"
          >
            View Departures
          </a>
          
          <a
            href={`https://www.flightradar24.com/data/airports/${route.arrivalAirport.toLowerCase()}/arrivals`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#0770e3] hover:underline"
          >
            View Arrivals
          </a>
        </div>
      </div>
    </div>
  );
}

function AirlineRoutesPage() {
  const [airlineCode, setAirlineCode] = useState('');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!airlineCode) {
      setError('Please enter an airline code.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await amadeusService.getAirlineRoutes(airlineCode.toUpperCase());
      setRoutes(results);
      setSearched(true);
    } catch (err) {
      console.error('Error getting airline routes:', err);
      setError(err.message || 'Failed to get airline routes. Please try again.');
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Popular airlines with their codes
  const popularAirlines = [
    { code: 'AI', name: 'Air India' },
    { code: '6E', name: 'IndiGo' },
    { code: 'UK', name: 'Vistara' },
    { code: 'SG', name: 'SpiceJet' },
    { code: 'I5', name: 'AirAsia India' },
    { code: 'G8', name: 'GoAir' }
  ];
  
  // Filter routes by departure airport
  const [filterDeparture, setFilterDeparture] = useState('');
  const [filterArrival, setFilterArrival] = useState('');
  
  // Get unique departure and arrival airports
  const uniqueDepartures = [...new Set(routes.map(route => route.departureAirport))].sort();
  const uniqueArrivals = [...new Set(routes.map(route => route.arrivalAirport))].sort();
  
  // Filter routes based on filters
  const filteredRoutes = routes.filter(route => {
    const matchesDeparture = !filterDeparture || route.departureAirport === filterDeparture;
    const matchesArrival = !filterArrival || route.arrivalAirport === filterArrival;
    return matchesDeparture && matchesArrival;
  });
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Airline Routes</h1>
        <p className="text-gray-600 mb-6">
          Discover all routes operated by an airline. Enter the two-letter IATA airline code to see where they fly.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Airline Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={airlineCode}
              onChange={(e) => setAirlineCode(e.target.value)}
              placeholder="e.g. AI, 6E"
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
              maxLength={2}
              required
            />
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0770e3] text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </>
            ) : (
              'Get Routes'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Popular airlines:</h2>
          <div className="flex flex-wrap gap-2">
            {popularAirlines.map((airline) => (
              <button
                key={airline.code}
                type="button"
                onClick={() => setAirlineCode(airline.code)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-full transition duration-200"
              >
                {airline.name} ({airline.code})
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {searched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {routes.length > 0
              ? `${routes.length} Routes for ${airlineCode.toUpperCase()}`
              : 'No routes found'}
          </h2>
          
          {routes.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Filter Routes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departure Airport
                  </label>
                  <select
                    value={filterDeparture}
                    onChange={(e) => setFilterDeparture(e.target.value)}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                  >
                    <option value="">All Departures</option>
                    {uniqueDepartures.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Arrival Airport
                  </label>
                  <select
                    value={filterArrival}
                    onChange={(e) => setFilterArrival(e.target.value)}
                    className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                  >
                    <option value="">All Arrivals</option>
                    {uniqueArrivals.map((airport) => (
                      <option key={airport} value={airport}>
                        {airport}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                Showing {filteredRoutes.length} of {routes.length} routes
              </div>
            </div>
          )}
          
          {routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRoutes.map((route, index) => (
                <RouteCard key={index} route={route} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                No routes found for this airline. Please check if the airline code is correct.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AirlineRoutesPage; 