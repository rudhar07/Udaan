import { useState, useEffect } from 'react';
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
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-xl p-8 mb-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Book a hotel with a discount and save up to 60%</h1>
          <p className="text-indigo-100 mb-6">We search 70+ booking systems to find you the best hotel deals</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">We compare room prices from 70 different hotel booking services</span>
            </div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">Find exclusive deals with discounts up to 60% off standard rates</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                </svg>
              </div>
              <span className="text-white text-sm md:text-base">All prices are final with no hidden fees or taxes</span>
            </div>
          </div>
          
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
                  {hotels.length} hotels found • {formatDisplayDate(searchParams.checkIn)} - {formatDisplayDate(searchParams.checkOut)} • {searchParams.guests} guests
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
        <>
          {/* Why use our service */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Why choose our hotel comparison service?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">More Hotels Than Direct Search</h3>
                <p className="text-slate-600 mb-4">We compare room prices from 70 different hotel booking services, enabling you to pick the most affordable offers that aren't listed on individual sites.</p>
                <p className="text-slate-600">The price for one and the same room can differ dramatically depending on the booking system you use.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Authentic Verified Reviews</h3>
                <p className="text-slate-600 mb-4">We gather reviews from many booking services and calculate ratings based on all the reviews available online using smart analysis.</p>
                <p className="text-slate-600">This means you get the most accurate picture of hotel quality from real guests.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Final Prices, No Hidden Fees</h3>
                <p className="text-slate-600 mb-4">We display the final room prices with all taxes and fees included. No surprises at checkout.</p>
                <p className="text-slate-600">Save time by comparing final prices all in one place, without needing to check each booking site separately.</p>
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
function HotelCard({ hotel }) {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 hover:border-indigo-100 transform hover:-translate-y-1 flex flex-col md:flex-row">
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">{name}</h3>
              <p className="text-slate-600 text-sm mb-3">{address}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center text-sm text-slate-600 mb-2">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              {distance}
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities && amenities.slice(0, 5).map((amenity, index) => (
                <span key={index} className="inline-flex items-center bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-full">
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
function DestinationCard({ destination, onSelect }) {
  const { name, cityId, image, hotelCount, description } = destination;
  
  return (
    <div 
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer"
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
    cityId: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 245,
    description: 'Experience the vibrant city life and coastal beauty of Mumbai.'
  },
  {
    id: 2,
    name: 'Goa',
    cityId: 'Goa',
    image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 189,
    description: 'Relax on pristine beaches and enjoy the laid-back atmosphere.'
  },
  {
    id: 3,
    name: 'Delhi',
    cityId: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',
    hotelCount: 312,
    description: 'Explore the historic monuments and cultural heritage of India\'s capital.'
  }
];

export default HotelBookingPage; 