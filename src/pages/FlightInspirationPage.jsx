import { useState } from 'react';
import amadeusService from '../services/amadeus';
import { Link } from 'react-router-dom';

function InspirationCard({ destination }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{destination.destination}</h3>
            <p className="text-sm text-gray-500">
              From {destination.origin} • {new Date(destination.departureDate).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#0770e3]">
              {destination.price.currency} {destination.price.amount.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">round trip</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {destination.returnDate && `Return: ${new Date(destination.returnDate).toLocaleDateString()}`}
          </div>
          <a
            href={destination.links.flightOffers}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0770e3] text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 text-sm"
          >
            View Flights
          </a>
        </div>
      </div>
    </div>
  );
}

function FlightInspirationPage() {
  const [origin, setOrigin] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!origin) {
      setError('Please enter an origin airport code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const originCode = origin.toUpperCase();
      const price = maxPrice ? parseInt(maxPrice) : null;
      
      const results = await amadeusService.getFlightInspiration(originCode, price);
      setDestinations(results);
      setSearched(true);
    } catch (err) {
      console.error('Error getting flight inspiration:', err);
      setError(err.message || 'Failed to get flight inspiration. Please try again.');
      setDestinations([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Sample origin airports for popular locations
  const suggestedOrigins = [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'BLR', name: 'Bangalore' },
    { code: 'MAA', name: 'Chennai' },
    { code: 'CCU', name: 'Kolkata' },
    { code: 'HYD', name: 'Hyderabad' }
  ];
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Travel Inspiration</h1>
        <p className="text-gray-600 mb-6">
          Discover where you can fly to from your chosen origin. Enter your departing airport and optional
          maximum price to find inspiration for your next trip.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origin Airport Code</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. DEL, BOM"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                maxLength={3}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Price (optional)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                min="1"
              />
            </div>
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
              'Find Destinations'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Try popular origins:</h2>
          <div className="flex flex-wrap gap-2">
            {suggestedOrigins.map((origin) => (
              <button
                key={origin.code}
                type="button"
                onClick={() => setOrigin(origin.code)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-full transition duration-200"
              >
                {origin.name} ({origin.code})
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {searched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {destinations.length > 0
              ? `Destinations from ${origin.toUpperCase()}`
              : 'No destinations found'}
          </h2>
          
          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.map((destination, index) => (
                <InspirationCard key={index} destination={destination} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                No destinations found for your search criteria. Try a different origin airport or increase your maximum price.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FlightInspirationPage; 