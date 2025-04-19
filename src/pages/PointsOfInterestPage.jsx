import { useState } from 'react';
import amadeusService from '../services/amadeus';

// POI Card Component
function POICard({ poi }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
      <div className="p-4">
        <h3 className="text-lg font-semibold">{poi.name}</h3>
        
        <div className="flex items-center mt-1 mb-2">
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {poi.category}
          </span>
          {poi.rank && (
            <span className="ml-2 text-xs text-gray-500">
              Rank: {poi.rank}
            </span>
          )}
        </div>
        
        {poi.tags && poi.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {poi.tags.slice(0, 5).map((tag, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 text-sm text-gray-600">
          {poi.address?.cityName && poi.address?.countryName && (
            <p>{poi.address.cityName}, {poi.address.countryName}</p>
          )}
        </div>
        
        {poi.geoCode && (
          <div className="mt-4 pt-4 border-t">
            <a
              href={`https://maps.google.com/?q=${poi.geoCode.latitude},${poi.geoCode.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0770e3] hover:underline flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              View on Google Maps
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function PointsOfInterestPage() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [radius, setRadius] = useState(10);
  const [category, setCategory] = useState('');
  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!latitude || !longitude) {
      setError('Please provide both latitude and longitude.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await amadeusService.getPointsOfInterest(
        latitude,
        longitude,
        radius,
        category || null
      );
      
      setPointsOfInterest(results);
      setSearched(true);
    } catch (err) {
      console.error('Error getting points of interest:', err);
      setError(err.message || 'Failed to get points of interest. Please try again.');
      setPointsOfInterest([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Available categories
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'SIGHTS', label: 'Sights' },
    { value: 'SHOPPING', label: 'Shopping' },
    { value: 'RESTAURANT', label: 'Restaurants' },
    { value: 'NIGHTLIFE', label: 'Nightlife' },
    { value: 'ACTIVITY', label: 'Activities' }
  ];
  
  // Popular destinations with their coordinates
  const popularDestinations = [
    { name: 'Delhi', lat: '28.6139', lng: '77.2090' },
    { name: 'Mumbai', lat: '19.0760', lng: '72.8777' },
    { name: 'Bangalore', lat: '12.9716', lng: '77.5946' },
    { name: 'Jaipur', lat: '26.9124', lng: '75.7873' },
    { name: 'Agra (Taj Mahal)', lat: '27.1751', lng: '78.0421' },
    { name: 'Goa', lat: '15.2993', lng: '74.1240' }
  ];
  
  // Handle selecting a popular destination
  const handleSelectDestination = (destination) => {
    setLatitude(destination.lat);
    setLongitude(destination.lng);
  };
  
  // Use geolocation
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Points of Interest</h1>
        <p className="text-gray-600 mb-6">
          Discover interesting places around your destination. Enter the coordinates and find attractions, restaurants, shops, and more.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Latitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 28.6139"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longitude <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 77.2090"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (km)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                min="1"
                max="50"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0770e3] text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
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
                'Find Places'
              )}
            </button>
            
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Popular destinations:</h2>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((destination, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectDestination(destination)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-full transition duration-200"
              >
                {destination.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {searched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {pointsOfInterest.length > 0
              ? `${pointsOfInterest.length} Points of Interest Found`
              : 'No points of interest found'}
          </h2>
          
          {pointsOfInterest.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pointsOfInterest.map((poi, index) => (
                <POICard key={index} poi={poi} />
              ))}
            </div>
          )}
          
          {pointsOfInterest.length === 0 && searched && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                No points of interest found for your search criteria. Try increasing the radius or changing the category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PointsOfInterestPage; 