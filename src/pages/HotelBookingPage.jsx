import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import hotelService from '../services/hotels';

/**
 * HotelBookingPage - Page for searching and booking hotels
 */
function HotelBookingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
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

  // Set current date as default for check-in and check-out
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    setSearchParams(prev => ({
      ...prev,
      checkIn: formatDate(tomorrow),
      checkOut: formatDate(nextWeek)
    }));
  }, []);
  
  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

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
    setHotels([]);

    try {
      console.log("Searching hotels with params:", searchParams);
      
      // Call the hotel service to search for hotels
      const results = await hotelService.searchHotels({
        location: searchParams.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: parseInt(searchParams.guests),
        rooms: parseInt(searchParams.rooms)
      });
      
      console.log("Hotel search results:", results);
      
      if (results && results.length > 0) {
        setHotels(results);
      } else {
        setError('No hotels found for your search criteria. Please try a different location or dates.');
      }
    } catch (err) {
      console.error("Hotel search error:", err);
      setError(`Failed to search hotels: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Calculate number of nights
  const calculateNights = () => {
    if (!searchParams.checkIn || !searchParams.checkOut) return 0;
    const checkIn = new Date(searchParams.checkIn);
    const checkOut = new Date(searchParams.checkOut);
    const diffTime = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-xl p-8 mb-6 shadow-lg relative overflow-hidden">
        {/* Hotel background overlay */}
        <div className="absolute inset-0 opacity-15 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80" 
            alt="Luxury hotel" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl font-bold mb-2">Find the perfect hotel at the best price</h1>
          <p className="text-indigo-100 mb-6">We compare 70+ booking sites to find you unbeatable hotel deals</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">Save up to 60% by comparing prices from all major booking sites</span>
            </div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">Access exclusive hotel deals not available on single booking platforms</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">See verified reviews from multiple sources for every hotel</span>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSubmit} className={`${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'} rounded-lg shadow-md p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-2">
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`} htmlFor="location">
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
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`} htmlFor="checkIn">
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
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`} htmlFor="checkOut">
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
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
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
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`} htmlFor="guests">
                  Guests
                </label>
                <select
                  id="guests"
                  name="guests"
                  value={searchParams.guests}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'} mb-1`} htmlFor="rooms">
                  Rooms
                </label>
                <select
                  id="rooms"
                  name="rooms"
                  value={searchParams.rooms}
                  onChange={handleInputChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  {[1, 2, 3, 4, 5].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Hotel Results */}
      {searched && (
        <div className="mb-12">
          {loading ? (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-12 text-center`}>
              <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} animate-pulse`}>Searching for hotels...</p>
            </div>
          ) : error ? (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-10 text-center`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>Search Error</h3>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-6`}>{error}</p>
              <button 
                onClick={() => setSearched(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Try Again
              </button>
            </div>
          ) : hotels.length === 0 ? (
            <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-10 text-center`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>No Hotels Found</h3>
              <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-6`}>We couldn't find any hotels matching your search criteria. Please try adjusting your search.</p>
              <button 
                onClick={() => setSearched(false)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
              >
                Search Again
              </button>
            </div>
          ) : (
            <div>
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-4 mb-6`}>
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>
                  Hotels in {searchParams.location}
                </h2>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {hotels.length} hotels found • {formatDisplayDate(searchParams.checkIn)} - {formatDisplayDate(searchParams.checkOut)} • {searchParams.guests} guests
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {hotels.map(hotel => (
                  <HotelCard key={hotel.id} hotel={hotel} isDarkMode={isDarkMode} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Popular Destinations */}
      {!searched && (
        <>
          {/* Why use our service */}
          <div className="mb-10">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-6`}>Why choose our hotel comparison service?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Compare Multiple Booking Sites</h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>We search across 70+ hotel booking services simultaneously, saving you the time and hassle of checking multiple websites.</p>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Find the best deals for your stay, with prices varying by up to 60% for the same room across different booking platforms.</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Verified Guest Reviews</h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>We aggregate authentic reviews from multiple booking sites to give you the most accurate picture of each hotel's quality.</p>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Make confident decisions based on feedback from real travelers who have experienced the property firsthand.</p>
              </div>
              
              <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Transparent Pricing</h3>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-4`}>We show you the final price including all taxes and fees for each booking option, so you know exactly what you'll pay.</p>
                <p className={`${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Compare hotels with confidence knowing there are no hidden charges or surprise fees at checkout.</p>
              </div>
            </div>
          </div>
          
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
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
          
          {/* Testimonial Section */}
          <div className="mb-16 bg-gray-50 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">What Our Users Say</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4">"I saved over ₹12,000 on my stay in Mumbai by comparing prices on this site instead of booking directly. Will definitely use again!"</p>
                <div className="text-sm font-medium">- Rahul S.</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4">"What I love most is seeing all the different prices in one place. Found a luxury hotel in Goa at the price of a standard room elsewhere."</p>
                <div className="text-sm font-medium">- Priya M.</div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="text-yellow-400 flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill={i < 4 ? "currentColor" : "none"} stroke={i < 4 ? "none" : "currentColor"} viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 mb-4">"The interface is simple and the comparison is quick. Found a great deal in Delhi that wasn't available on my usual booking site."</p>
                <div className="text-sm font-medium">- Vikram P.</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * HotelCard - Component to display hotel information
 */
function HotelCard({ hotel, isDarkMode }) {
  const {
    id,
    name,
    image,
    rating,
    reviewCount,
    price,
    originalPrice,
    discount,
    currency,
    address,
    amenities,
    distance,
    bookingLink,
    prices = []
  } = hotel;

  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-700' : 'bg-white border-slate-100 hover:border-indigo-100'} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border transform hover:-translate-y-1 flex flex-col md:flex-row`}>
      <div className="md:w-1/3 h-64 md:h-auto relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945";
          }}
        />
        {rating > 0 && (
          <div className="absolute top-3 right-3 bg-white bg-opacity-90 text-indigo-600 font-bold px-2 py-1 rounded-lg text-sm shadow-sm">
            {rating.toFixed(1)} ★
          </div>
        )}
        {discount && discount > 5 && (
          <div className="absolute top-3 left-3 bg-red-600 text-white font-bold px-2 py-1 rounded-lg text-sm shadow-sm">
            -{discount}%
          </div>
        )}
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>{name}</h3>
              <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-3`}>{address}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className={`flex items-center text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-2`}>
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              {distance}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities && amenities.slice(0, 5).map((amenity, index) => (
                <span key={index} className={`inline-flex items-center ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-700'} text-xs font-medium px-2.5 py-1 rounded-full`}>
                  {amenity}
                </span>
              ))}
            </div>
          </div>
          
          {/* Price comparison section */}
          <div className="mb-4 border-t border-b border-slate-100 py-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-slate-700">Price comparison</div>
              <div className="text-xs text-slate-500">from {prices.length} booking sites</div>
            </div>
            
            <div className="space-y-2">
              {prices.slice(0, 3).map((priceItem, index) => (
                <div key={index} className={`flex justify-between items-center ${index === 0 ? 'bg-green-50 p-2 rounded-lg' : ''}`}>
                  <div className="flex items-center">
                    <img src={priceItem.systemLogo} alt={priceItem.systemName} className="h-5 mr-2" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/80x30?text=" + priceItem.systemName;
                      }}
                    />
                    <span className="text-sm text-slate-700">{priceItem.systemName}</span>
                  </div>
                  <div className="font-bold text-sm">
                    {currency} {priceItem.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="text-sm text-slate-600 flex items-center">
            <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
            </svg>
            {reviewCount} reviews
          </div>
          
          <div className="flex flex-col items-end">
            {discount && originalPrice && (
              <div className="text-sm text-slate-500 line-through mb-1">{currency} {originalPrice.toLocaleString()}</div>
            )}
            <div className="text-2xl font-bold text-indigo-600 mb-2">
              {currency} {price.toLocaleString()}
            </div>
            <a 
              href={bookingLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-medium px-6 py-2 rounded-lg transition duration-300 text-sm inline-flex items-center"
            >
              Compare Prices
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DestinationCard - Component to display a popular destination
 */
function DestinationCard({ destination, onSelect, isDarkMode }) {
  const { name, cityId, image, hotelCount, description } = destination;
  
  return (
    <div 
      className={`${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-700' : 'bg-white border-slate-100 hover:border-indigo-100'} rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border group cursor-pointer`}
      onClick={() => onSelect(cityId)}
    >
      <div className="h-48 overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945";
          }}
        />
      </div>
      <div className="p-5">
        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-2`}>{name}</h3>
        <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm mb-3`}>{description}</p>
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
    cityId: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 245,
    description: 'Experience luxury hotels with stunning city and sea views.'
  },
  {
    id: 2,
    name: 'Goa',
    cityId: 'Goa',
    image: 'https://images.unsplash.com/photo-1566974957693-78edc5a2a31a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 189,
    description: 'Beachfront resorts and boutique hotels with tropical vibes.'
  },
  {
    id: 3,
    name: 'Delhi',
    cityId: 'Delhi',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 312,
    description: 'Historic luxury and modern comfort in India\'s capital.'
  }
];

export default HotelBookingPage; 