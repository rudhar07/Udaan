import { useState } from 'react';
import amadeusService from '../services/amadeus';

function HotelCard({ hotel }) {
  const [showAllOffers, setShowAllOffers] = useState(false);
  const bestOffer = hotel.offers[0]; // Assuming offers are sorted by price
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{hotel.name}</h3>
            <p className="text-sm text-gray-500">
              {hotel.address.cityName}, {hotel.address.countryCode}
            </p>
            <div className="flex items-center mt-1">
              {hotel.rating && (
                <div className="flex">
                  {[...Array(parseInt(hotel.rating))].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#0770e3]">
              {bestOffer.price.currency} {bestOffer.price.total.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">per night</div>
          </div>
        </div>
        
        {hotel.description && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 line-clamp-2">{hotel.description.text || hotel.description}</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-2">Available Offers:</h4>
          <div className="space-y-3">
            {(showAllOffers ? hotel.offers : [hotel.offers[0]]).map((offer, index) => (
              <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{offer.roomType?.category || 'Standard Room'}</div>
                    <div className="text-xs text-gray-500">
                      {offer.checkInDate} to {offer.checkOutDate}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{offer.price.currency} {offer.price.total}</div>
                    <div className="text-xs text-gray-500">
                      {offer.cancellable ? 'Free cancellation' : 'Non-refundable'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hotel.offers.length > 1 && (
            <button
              onClick={() => setShowAllOffers(!showAllOffers)}
              className="mt-3 text-sm text-[#0770e3] hover:underline"
            >
              {showAllOffers ? 'Show less' : `Show ${hotel.offers.length - 1} more offers`}
            </button>
          )}
          
          <button className="w-full bg-[#0770e3] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200 mt-4">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

function HotelSearchPage() {
  const [cityCode, setCityCode] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!cityCode || !checkInDate || !checkOutDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    const today = new Date();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkIn < today) {
      setError('Check-in date cannot be in the past.');
      return;
    }
    
    if (checkOut <= checkIn) {
      setError('Check-out date must be after check-in date.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await amadeusService.searchHotels(
        cityCode.toUpperCase(), 
        checkInDate, 
        checkOutDate, 
        adults
      );
      
      setHotels(results);
      setSearched(true);
    } catch (err) {
      console.error('Error searching hotels:', err);
      setError(err.message || 'Failed to search hotels. Please try again.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Popular city codes for hotels
  const popularCities = [
    { code: 'DEL', name: 'Delhi' },
    { code: 'BOM', name: 'Mumbai' },
    { code: 'GOI', name: 'Goa' },
    { code: 'BLR', name: 'Bangalore' },
    { code: 'CCU', name: 'Kolkata' },
    { code: 'HYD', name: 'Hyderabad' }
  ];
  
  // Calculate tomorrow and day after for default date suggestions
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterStr = dayAfter.toISOString().split('T')[0];
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Hotel Search</h1>
        <p className="text-gray-600 mb-6">
          Find the perfect accommodation for your trip. Enter your destination and dates to see available hotels.
        </p>
        
        <form onSubmit={handleSearch} className="max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cityCode}
                onChange={(e) => setCityCode(e.target.value)}
                placeholder="e.g. DEL, BOM"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                maxLength={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Adults
              </label>
              <select
                value={adults}
                onChange={(e) => setAdults(parseInt(e.target.value))}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Adult' : 'Adults'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                min={checkInDate || new Date().toISOString().split('T')[0]}
                required
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
              'Search Hotels'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Try popular destinations:</h2>
          <div className="flex flex-wrap gap-2">
            {popularCities.map((city) => (
              <button
                key={city.code}
                type="button"
                onClick={() => setCityCode(city.code)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-full transition duration-200"
              >
                {city.name} ({city.code})
              </button>
            ))}
          </div>
          
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                setCheckInDate(tomorrowStr);
                setCheckOutDate(dayAfterStr);
              }}
              className="text-sm text-[#0770e3] hover:underline"
            >
              Set dates to tomorrow &amp; day after
            </button>
          </div>
        </div>
      </div>
      
      {searched && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {hotels.length > 0
              ? `Hotels in ${cityCode.toUpperCase()}`
              : 'No hotels found'}
          </h2>
          
          {hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel, index) => (
                <HotelCard key={index} hotel={hotel} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">
                No hotels found for your search criteria. Try a different city or dates.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HotelSearchPage; 