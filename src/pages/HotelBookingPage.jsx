import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import hotelService from '../services/hotels';

/**
 * HotelBookingPage - Page for searching and booking hotels
 */
function HotelBookingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // Call the hotel service to search for hotels
      const results = await hotelService.searchHotels({
        location: searchParams.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: parseInt(searchParams.guests),
        rooms: parseInt(searchParams.rooms)
      });
      
      setHotels(results);
    } catch (err) {
      setError('Failed to search hotels. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-xl p-8 mb-6 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Find Your Perfect Stay</h1>
        <p className="text-indigo-100 mb-6">Search and book hotels at the best prices</p>
        
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 text-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="location">
                Destination / Hotel Name
              </label>
              <input
                id="location"
                name="location"
                type="text"
                required
                value={searchParams.location}
                onChange={handleInputChange}
                placeholder="City, Area, or Hotel"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="checkIn">
                Check-in Date
              </label>
              <input
                id="checkIn"
                name="checkIn"
                type="date"
                required
                value={searchParams.checkIn}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="checkOut">
                Check-out Date
              </label>
              <input
                id="checkOut"
                name="checkOut"
                type="date"
                required
                value={searchParams.checkOut}
                onChange={handleInputChange}
                min={searchParams.checkIn || new Date().toISOString().split('T')[0]}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-semibold p-3 rounded-lg transition duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
                </svg>
                Search Hotels
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="guests">
                Guests
              </label>
              <select
                id="guests"
                name="guests"
                value={searchParams.guests}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="rooms">
                Rooms
              </label>
              <select
                id="rooms"
                name="rooms"
                value={searchParams.rooms}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>
      
      {/* Hotel Results */}
      {searched && (
        <div className="mb-12">
          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 animate-pulse">Searching for hotels...</p>
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
                onClick={() => setSearched(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Try Again
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Hotels Found</h3>
              <p className="text-slate-600 mb-6">We couldn't find any hotels matching your search criteria. Please try adjusting your search.</p>
              <button 
                onClick={() => setSearched(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Search Again
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  Hotels in {searchParams.location}
                </h2>
                <p className="text-slate-600">
                  {hotels.length} hotels found • {new Date(searchParams.checkIn).toLocaleDateString()} - {new Date(searchParams.checkOut).toLocaleDateString()} • {searchParams.guests} guests
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {hotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Popular Destinations */}
      {!searched && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Popular Destinations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularDestinations.map(destination => (
              <DestinationCard 
                key={destination.id} 
                destination={destination} 
                onSelect={(location) => {
                  setSearchParams(prev => ({...prev, location}));
                  document.getElementById('location').focus();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * HotelCard - Component to display hotel information
 */
function HotelCard({ hotel }) {
  const {
    id,
    name,
    image,
    rating,
    reviewCount,
    price,
    currency,
    address,
    amenities,
    distance
  } = hotel;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-100 transform hover:-translate-y-1 flex flex-col md:flex-row">
      <div className="md:w-1/3 h-64 md:h-auto relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        {rating && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-indigo-600 font-bold px-2 py-1 rounded-lg text-sm shadow-sm">
            {rating} ★
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
              <p className="text-slate-600 text-sm mb-3">{address}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-indigo-600">
                {currency} {price.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500">per night</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center text-sm text-slate-600 mb-2">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              {distance} from city center
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities.map((amenity, index) => (
                <span key={index} className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {reviewCount} guest reviews
          </div>
          
          <div className="flex space-x-2">
            <button className="bg-white border border-indigo-500 text-indigo-600 hover:bg-indigo-50 font-medium px-4 py-2 rounded-lg transition duration-300 text-sm">
              View Details
            </button>
            <button className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium px-4 py-2 rounded-lg transition duration-300 text-sm">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DestinationCard - Component to display a popular destination
 */
function DestinationCard({ destination, onSelect }) {
  const { name, image, hotelCount, description } = destination;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer"
      onClick={() => onSelect(name)}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
        <p className="text-slate-600 text-sm mb-3">{description}</p>
        <p className="text-indigo-600 font-medium">{hotelCount} Hotels</p>
      </div>
    </div>
  );
}

// Mock data for popular destinations
const popularDestinations = [
  {
    id: 1,
    name: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c',
    hotelCount: 245,
    description: 'Experience the vibrant city life and coastal beauty of Mumbai.'
  },
  {
    id: 2,
    name: 'Goa',
    image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3',
    hotelCount: 189,
    description: 'Relax on pristine beaches and enjoy the laid-back atmosphere.'
  },
  {
    id: 3,
    name: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    hotelCount: 312,
    description: 'Explore the historic monuments and cultural heritage of India\'s capital.'
  }
];

export default HotelBookingPage; 