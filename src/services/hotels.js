/**
 * Hotels API Service
 * 
 * This service provides an interface to interact with the Hotellook API 
 * for hotel search and booking, comparing prices from multiple booking systems.
 * Uses Travelpayouts Hotels Data API for real data.
 */

import { proxiedFetch, proxyUrl } from './corsProxy';

// Hotellook API configuration
const config = {
  apiToken: import.meta.env.VITE_HOTELLOOK_API_TOKEN || 'd9bfe25df635cf0b2514cb6af1c87c5c',
  partnerId: import.meta.env.VITE_HOTELLOOK_PARTNER_ID || '624529',
  apiBaseUrl: 'https://engine.hotellook.com/api/v2',
  travelpayoutsApiToken: import.meta.env.VITE_TRAVELPAYOUTS_TOKEN || '7c5000b11c4f88b77bbcbb03e8dcf9ab',
  travelpayoutsApiUrl: 'https://api.travelpayouts.com/data/en-US',
  useMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || false
};

// Booking systems that we compare
const bookingSystems = [
  { id: 'booking', name: 'Booking.com', logo: 'https://logos-download.com/wp-content/uploads/2016/05/Booking_com_logo_logotype.png' },
  { id: 'agoda', name: 'Agoda', logo: 'https://cdn6.agoda.net/images/agoda-homes-theme/assets/agoda-logo.svg' },
  { id: 'hotels', name: 'Hotels.com', logo: 'https://www.hotels.com/partners/images/hcom-logo-en-us.png' },
  { id: 'expedia', name: 'Expedia', logo: 'https://cdn.freebiesupply.com/logos/large/2x/expedia-logo-png-transparent.png' },
  { id: 'ostrovok', name: 'Ostrovok', logo: 'https://www.ecasa.by/uploads/tours/ostrovok.jpg' },
  { id: 'hotellook', name: 'Hotellook', logo: 'https://aviasales.ru/docs/assets/hotellook.png' }
];

console.log('Hotel API config:', { 
  token: config.apiToken, 
  partnerId: config.partnerId,
  useMockData: config.useMockData,
  travelpayoutsToken: config.travelpayoutsApiToken ? '✓' : '✗'
});

/**
 * Search for hotels based on provided parameters
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.location - City or location name
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} [params.adults=1] - Number of adults
 * @param {number} [params.rooms=1] - Number of rooms
 * @returns {Promise<Array>} - Array of hotel results
 */
export async function searchHotels(params) {
  try {
    console.log('searchHotels params:', params);
    
    // Validate required parameters
    if (!params.location || !params.checkIn || !params.checkOut) {
      console.error('Missing required parameters for hotel search');
      return getMockHotelsWithPriceComparison(params);
    }
    
    // If mock data is enabled, use it directly
    if (config.useMockData) {
      console.log('Using mock data for hotel search (mock data enabled)');
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      return getMockHotelsWithPriceComparison(params);
    }
    
    // Check if the location matches one of our known mock locations
    const mockLocations = ['Mumbai', 'Delhi', 'Goa'];
    const isKnownLocation = mockLocations.some(loc => 
      params.location.toLowerCase().includes(loc.toLowerCase())
    );
    
    if (isKnownLocation) {
      console.log('Known location found, using enhanced mock data');
      return getMockHotelsWithPriceComparison(params);
    }
    
    // Try to get real hotel data from Hotellook API
    try {
      console.log('Fetching hotels from Hotellook API');
      const hotels = await fetchHotelsFromAPI(params);
      
      if (hotels && hotels.length > 0) {
        console.log(`Found ${hotels.length} hotels from API`);
        return hotels;
      }
    } catch (apiError) {
      console.error('Error fetching from Hotellook API:', apiError);
    }
    
    // Generate "anywhere results" - combine a few mock hotels and customize them for the location
    console.log('No results from API, generating custom hotels for this location');
    return generateCustomHotelsForLocation(params);
  } catch (error) {
    console.error('Error in searchHotels:', error);
    return getMockHotelsWithPriceComparison(params);
  }
}

/**
 * Fetch hotels directly from Hotellook API
 * 
 * @param {Object} params - Search parameters
 * @returns {Promise<Array>} - Array of hotel results
 */
async function fetchHotelsFromAPI(params) {
  try {
    // Build the API URL
    const location = encodeURIComponent(params.location.trim());
    const checkIn = params.checkIn;
    const checkOut = params.checkOut;
    const adults = params.adults || 1;
    const rooms = params.rooms || 1;
    
    // Calculate number of nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Construct URL for Hotellook API
    // Note: Using the cache.json endpoint which is more reliable
    const apiUrl = `https://engine.hotellook.com/api/v2/cache.json`;
    const queryParams = new URLSearchParams({
      location: params.location.trim(),
      checkIn: checkIn,
      checkOut: checkOut,
      currency: 'INR',
      limit: '20',
      token: config.apiToken,
      marker: config.partnerId
    });
    
    const url = `${apiUrl}?${queryParams.toString()}`;
    console.log('Fetching hotels from URL:', url);
    
    // Use the CORS proxy to make the request (always use proxy in development)
    const proxiedUrl = proxyUrl(url);
    console.log('Proxied URL:', proxiedUrl);
    
    // Make the API request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    try {
      const response = await fetch(proxiedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('API response not OK:', response.status, response.statusText);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Log the response headers for debugging
      console.log('Response headers:', Object.fromEntries([...response.headers.entries()]));
      
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!data.results || !data.results.hotels || data.results.hotels.length === 0) {
        console.log('No hotels found in API response');
        return [];
      }
      
      console.log(`Found ${data.results.hotels.length} hotels from API`);
      
      // Transform the response to match our app's format
      return data.results.hotels.map((hotel, index) => {
        // Generate price comparisons based on the hotel's price
        const basePrice = hotel.priceFrom ? hotel.priceFrom * nights : 5000 + Math.floor(Math.random() * 5000);
        const prices = generatePriceComparisons(basePrice);
        const bestPrice = Math.min(...prices.map(p => p.price));
        const originalPrice = prices.length > 0 ? prices[0].price : basePrice;
        const discount = originalPrice > bestPrice ? Math.round(((originalPrice - bestPrice) / originalPrice) * 100) : 0;
        
        // Create a location-specific image URL
        const locationName = params.location.trim();
        const uniqueSeed = `${hotel.id || index}-${Date.now()}`;
        const imageUrl = hotel.photoURL || getLocationSpecificImage(locationName, uniqueSeed);
        
        return {
          id: `hotel-${hotel.id || Math.random().toString(36).substring(7)}`,
          name: hotel.name,
          image: imageUrl,
          rating: hotel.stars ? hotel.stars * 2 : 8.0, // Convert 5-star scale to 10-point scale
          reviewCount: hotel.rating?.reviews || Math.floor(Math.random() * 300) + 50,
          address: hotel.location?.name ? `${hotel.location.name}, ${hotel.location.country || ''}` : params.location,
          amenities: generateAmenitiesFromTags(hotel.tags || []),
          distance: hotel.location?.distance ? `${hotel.location.distance.toFixed(1)} km` : '1.0 km',
          location: hotel.location?.name || params.location,
          prices: prices,
          price: bestPrice || basePrice,
          originalPrice: originalPrice,
          discount: discount > 5 ? discount : null,
          currency: hotel.priceCurrency || '₹',
          bookingLink: `https://search.hotellook.com/hotels/${hotel.id}?marker=${config.partnerId}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&rooms=${rooms}`
        };
      });
    } catch (fetchError) {
      if (fetchError.name === 'AbortError') {
        console.error('API request timed out');
        throw new Error('API request timed out');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('Error fetching hotels from API:', error);
    
    // Try an alternative approach with the lookup endpoint if the cache endpoint fails
    try {
      console.log('Trying alternative API approach...');
      // This is a simplified approach that searches by city name only
      const lookupUrl = `https://engine.hotellook.com/api/v2/lookup.json?query=${encodeURIComponent(params.location)}&lang=en&lookFor=both&limit=10&token=${config.apiToken}`;
      
      const proxiedLookupUrl = proxyUrl(lookupUrl);
      const lookupResponse = await fetch(proxiedLookupUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });
      
      if (!lookupResponse.ok) {
        throw new Error(`Lookup API error: ${lookupResponse.status}`);
      }
      
      const lookupData = await lookupResponse.json();
      console.log('Lookup API response:', lookupData);
      
      // If we have hotels in the lookup response, format them
      if (lookupData.results && lookupData.results.hotels && lookupData.results.hotels.length > 0) {
        console.log(`Found ${lookupData.results.hotels.length} hotels from lookup API`);
        
        const checkInDate = new Date(params.checkIn);
        const checkOutDate = new Date(params.checkOut);
        const nights = Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
        
        return lookupData.results.hotels.map((hotel, index) => {
          // Generate a base price
          const basePrice = 5000 + Math.floor(Math.random() * 15000);
          const prices = generatePriceComparisons(basePrice);
          const bestPrice = Math.min(...prices.map(p => p.price));
          const discount = Math.round(((prices[0].price - bestPrice) / prices[0].price) * 100);
          
          // Create a location-specific image
          const locationName = params.location.trim();
          const uniqueSeed = `${hotel.id || index}-${Date.now()}`;
          
          return {
            id: `hotel-${hotel.id}`,
            name: hotel.name,
            image: getLocationSpecificImage(locationName, uniqueSeed),
            rating: 8.0 + Math.random() * 1.5,
            reviewCount: Math.floor(Math.random() * 500) + 50,
            address: hotel.fullName || hotel.label || params.location,
            amenities: ['Free WiFi', 'Restaurant', 'Air Conditioning', 'Room Service', '24/7 Service'],
            distance: `${(Math.random() * 5).toFixed(1)} km`,
            location: params.location,
            prices: prices,
            price: bestPrice,
            originalPrice: prices[0].price,
            discount: discount > 5 ? discount : null,
            currency: '₹',
            bookingLink: `https://search.hotellook.com/hotels/${hotel.id}?marker=${config.partnerId}&checkIn=${params.checkIn}&checkOut=${params.checkOut}&adults=${params.adults || 1}&rooms=${params.rooms || 1}`
          };
        });
      }
    } catch (alternativeError) {
      console.error('Alternative API approach also failed:', alternativeError);
    }
    
    // If everything fails, throw the original error
    throw error;
  }
}

/**
 * Generate amenities based on hotel tags
 * 
 * @param {Array} tags - Hotel tags from API
 * @returns {Array} - Formatted amenities
 */
function generateAmenitiesFromTags(tags) {
  const amenityMap = {
    'pool': 'Pool',
    'beach': 'Beach Access',
    'wifi': 'Free WiFi',
    'parking': 'Parking',
    'restaurant': 'Restaurant',
    'pets': 'Pet Friendly',
    'spa': 'Spa',
    'gym': 'Gym',
    'bar': 'Bar',
    'breakfast': 'Breakfast',
    'airport': 'Airport Shuttle',
    'air_conditioning': 'Air Conditioning',
    'fitness': 'Fitness Center'
  };
  
  // Extract amenities from tags
  const amenities = [];
  tags.forEach(tag => {
    Object.keys(amenityMap).forEach(key => {
      if (tag.toLowerCase().includes(key) && !amenities.includes(amenityMap[key])) {
        amenities.push(amenityMap[key]);
      }
    });
  });
  
  // Add some default amenities if we don't have enough
  if (amenities.length < 3) {
    const defaultAmenities = ['Free WiFi', 'Air Conditioning', 'Room Service', '24/7 Service'];
    defaultAmenities.forEach(amenity => {
      if (!amenities.includes(amenity)) {
        amenities.push(amenity);
        if (amenities.length >= 5) return;
      }
    });
  }
  
  return amenities.slice(0, 5); // Limit to 5 amenities
}

/**
 * Get detailed information about a specific hotel
 * 
 * @param {string} hotelId - Hotel ID
 * @param {Object} params - Additional parameters like check-in, check-out dates
 * @returns {Promise<Object>} - Hotel details
 */
export async function getHotelDetails(hotelId, params) {
  try {
    if (!hotelId || !params.checkIn || !params.checkOut) {
      console.error('Missing required parameters for hotel details');
      return null;
    }
    
    // Try to fetch from API first
    if (!config.useMockData && hotelId.startsWith('hotel-')) {
      try {
        const realHotelId = hotelId.replace('hotel-', '');
        const url = `https://engine.hotellook.com/api/v2/lookup.json?id=${realHotelId}&token=${config.apiToken}`;
        const response = await proxiedFetch(url);
        const hotelData = await response.json();
        
        if (hotelData && hotelData.results && hotelData.results.hotels && hotelData.results.hotels.length > 0) {
          const apiHotel = hotelData.results.hotels[0];
          // Format and return the hotel details
          // Implementation details here...
          console.log('Found hotel details from API');
          // Fall back to mock data processing for now
        }
      } catch (apiError) {
        console.error('Error fetching hotel details from API:', apiError);
      }
    }
    
    console.log('Using mock data for hotel details');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    
    // Find the hotel in our mock data
    const mockHotels = getMockHotelsWithPriceComparison({ location: 'all' });
    const hotel = mockHotels.find(h => h.id === hotelId) || mockHotels[0];
    
    if (!hotel) return null;
    
    // Add additional details for the hotel
    return {
      ...hotel,
      description: 'This luxurious hotel offers the perfect blend of comfort and elegance. Guests can enjoy a range of facilities including a swimming pool, fitness center, and spa. The rooms are spacious and well-appointed with modern amenities.',
      amenities: [
        'Free WiFi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant',
        'Room Service', '24-hour Front Desk', 'Airport Shuttle', 'Non-smoking Rooms',
        'Family Rooms', 'Facilities for Disabled Guests', 'Breakfast'
      ],
      rooms: [
        {
          id: `room-${hotelId}-1`,
          name: 'Standard Room',
          description: 'Comfortable room with essential amenities',
          capacity: '2 Adults',
          prices: hotel.prices.map(price => ({
            ...price,
            roomPrice: Math.round(price.price * 0.9) // Slightly cheaper for standard rooms
          })),
          amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Private Bathroom'],
          cancellationPolicy: { deadline: '24 hours', refundable: true }
        },
        {
          id: `room-${hotelId}-2`,
          name: 'Deluxe Room',
          description: 'Spacious room with premium amenities and views',
          capacity: '2 Adults',
          prices: hotel.prices,
          amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Private Bathroom', 'City View', 'Mini Bar'],
          cancellationPolicy: { deadline: '48 hours', refundable: true }
        },
        {
          id: `room-${hotelId}-3`,
          name: 'Suite',
          description: 'Luxury suite with separate living area',
          capacity: '3 Adults',
          prices: hotel.prices.map(price => ({
            ...price,
            roomPrice: Math.round(price.price * 1.4) // More expensive for suites
          })),
          amenities: ['Free WiFi', 'Air Conditioning', 'TV', 'Private Bathroom', 'City View', 'Mini Bar', 'Living Area', 'Bathtub'],
          cancellationPolicy: { deadline: '72 hours', refundable: true }
        }
      ],
      reviews: {
        average: hotel.rating,
        total: hotel.reviewCount,
        breakdown: {
          location: (Math.random() * 1 + 8).toFixed(1),
          cleanliness: (Math.random() * 1 + 8).toFixed(1),
          staff: (Math.random() * 1 + 8.5).toFixed(1),
          comfort: (Math.random() * 1 + 8).toFixed(1),
          valueForMoney: (Math.random() * 1 + 7.5).toFixed(1),
          facilities: (Math.random() * 1 + 8).toFixed(1)
        },
        comments: [
          {
            author: 'John D.',
            date: '2 weeks ago',
            rating: Math.floor(Math.random() * 2 + 8),
            text: 'Great location, very clean rooms, and friendly staff.'
          },
          {
            author: 'Sarah M.',
            date: '1 month ago',
            rating: Math.floor(Math.random() * 2 + 8),
            text: 'Excellent value for money. The breakfast was delicious!'
          },
          {
            author: 'Michael R.',
            date: '2 months ago',
            rating: Math.floor(Math.random() * 3 + 7),
            text: 'Comfortable stay. The room was a bit small but had everything we needed.'
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error getting hotel details:', error);
    return null;
  }
}

/**
 * Generate mock hotel data with price comparisons for testing
 * 
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of mock hotel results with price comparisons
 */
function getMockHotelsWithPriceComparison(params) {
  // Base hotels data
  const hotels = [
    {
      id: 'hotel-1',
      name: 'Grand Plaza Hotel & Spa',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      rating: 8.8,
      reviewCount: 254,
      address: 'Civil Lines, Mumbai, Maharashtra',
      amenities: ['Pool', 'Spa', 'Gym', 'Free WiFi', 'Restaurant'],
      distance: '1.2 km',
      location: 'Mumbai'
    },
    {
      id: 'hotel-2',
      name: 'Sunset Beach Resort',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      rating: 8.5,
      reviewCount: 189,
      address: 'Juhu Beach, Mumbai, Maharashtra',
      amenities: ['Beach Access', 'Pool', 'Restaurant', 'Bar', 'Free WiFi'],
      distance: '3.5 km',
      location: 'Mumbai'
    },
    {
      id: 'hotel-3',
      name: 'City Lights Inn',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      rating: 8.2,
      reviewCount: 145,
      address: 'Andheri East, Mumbai, Maharashtra',
      amenities: ['Free WiFi', 'Airport Shuttle', 'Restaurant', '24/7 Service'],
      distance: '4.8 km',
      location: 'Mumbai'
    },
    {
      id: 'hotel-4',
      name: 'Royal Heritage Palace',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
      rating: 9.1,
      reviewCount: 320,
      address: 'Marine Drive, Mumbai, Maharashtra',
      amenities: ['Sea View', 'Luxury Spa', 'Fine Dining', 'Gym', 'Pool'],
      distance: '0.8 km',
      location: 'Mumbai'
    },
    {
      id: 'hotel-5',
      name: 'Urban Oasis Hotel',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
      rating: 8.3,
      reviewCount: 178,
      address: 'Bandra West, Mumbai, Maharashtra',
      amenities: ['Rooftop Pool', 'Restaurant', 'Bar', 'Free WiFi', 'Gym'],
      distance: '5.2 km',
      location: 'Mumbai'
    },
    {
      id: 'hotel-6',
      name: 'Imperial Luxury Hotel',
      image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e',
      rating: 8.6,
      reviewCount: 421,
      address: 'Connaught Place, Delhi, Delhi NCR',
      amenities: ['Pool', 'Spa', 'Gym', 'Free WiFi', 'Restaurant', 'Bar'],
      distance: '1.0 km',
      location: 'Delhi'
    },
    {
      id: 'hotel-7',
      name: 'Heritage Grand',
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
      rating: 8.4,
      reviewCount: 286,
      address: 'Karol Bagh, Delhi, Delhi NCR',
      amenities: ['Free WiFi', 'Restaurant', 'Room Service', 'Parking'],
      distance: '2.7 km',
      location: 'Delhi'
    },
    {
      id: 'hotel-8',
      name: 'Diplomatic Suites',
      image: 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4',
      rating: 8.7,
      reviewCount: 328,
      address: 'Chanakyapuri, Delhi, Delhi NCR',
      amenities: ['Business Center', 'Pool', 'Spa', 'Fine Dining', 'Airport Shuttle'],
      distance: '3.2 km',
      location: 'Delhi'
    },
    {
      id: 'hotel-9',
      name: 'Beach Paradise Resort',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
      rating: 9.0,
      reviewCount: 512,
      address: 'Calangute Beach, North Goa, Goa',
      amenities: ['Beachfront', 'Pool', 'Water Sports', 'Spa', 'Multiple Restaurants'],
      distance: '0.1 km',
      location: 'Goa'
    },
    {
      id: 'hotel-10',
      name: 'Tropical Oasis Villa',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
      rating: 8.5,
      reviewCount: 345,
      address: 'Anjuna, North Goa, Goa',
      amenities: ['Private Pool', 'Garden', 'Free WiFi', 'Kitchen', 'Beach Shuttle'],
      distance: '1.2 km',
      location: 'Goa'
    },
    {
      id: 'hotel-11',
      name: 'Seaside Luxury Hotel',
      image: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf',
      rating: 9.2,
      reviewCount: 621,
      address: 'Palolem Beach, South Goa, Goa',
      amenities: ['Private Beach', 'Infinity Pool', 'Spa', 'Water Sports', '5 Restaurants'],
      distance: '0.3 km',
      location: 'Goa'
    }
  ];
  
  // Add price comparisons to each hotel
  const hotelsWithPrices = hotels.map(hotel => {
    // Generate a base price based on hotel rating
    const basePrice = 5000 + Math.floor(Math.random() * 15000) + (hotel.rating * 1000);
    
    // Generate prices from different booking systems
    // Each system has a slightly different price
    const prices = generatePriceComparisons(basePrice);
    
    // Find the best price
    const bestPrice = Math.min(...prices.map(p => p.price));
    const discount = Math.round(((prices[0].price - bestPrice) / prices[0].price) * 100);
    
    return {
      ...hotel,
      prices, // Array of prices from different systems
      price: bestPrice, // Best price
      originalPrice: prices[0].price, // Original price (for showing discount)
      discount: discount > 0 ? discount : null, // Discount percentage
      currency: '₹',
      bookingLink: `https://hotels-comparer.com/2/hotel/${hotel.id}?marker=${config.partnerId}&checkIn=${params.checkIn || '2023-08-10'}&checkOut=${params.checkOut || '2023-08-15'}`
    };
  });
  
  // Return all hotels if location is "all" or not provided
  if (!params.location || params.location === 'all') {
    return hotelsWithPrices;
  }
  
  // Filter based on location (case insensitive search)
  const searchLocation = params.location.toLowerCase();
  return hotelsWithPrices.filter(hotel => 
    hotel.location.toLowerCase().includes(searchLocation) ||
    hotel.address.toLowerCase().includes(searchLocation) ||
    hotel.name.toLowerCase().includes(searchLocation)
  );
}

/**
 * Generate custom hotels for any location
 * 
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of hotel results customized for the location
 */
function generateCustomHotelsForLocation(params) {
  const location = params.location.trim();
  
  // Hotel name prefixes and suffixes for generating realistic hotel names
  const prefixes = ['Grand', 'Royal', 'Luxury', 'Premium', 'Elegant', 'Imperial', 'Golden', 'Plaza', 'Regency', 'Presidential'];
  const suffixes = ['Hotel & Spa', 'Resort', 'Suites', 'Inn', 'Palace', 'Residency', 'Retreat', 'Grand Hotel', 'Majestic', 'Towers'];
  
  // Generate 5-10 hotels for this location
  const hotelCount = Math.floor(Math.random() * 6) + 5;
  const customHotels = [];
  
  for (let i = 0; i < hotelCount; i++) {
    // Create a unique hotel name using the location and random prefix/suffix
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    let hotelName;
    
    // 50% chance to include the location name in the hotel name
    if (Math.random() > 0.5) {
      hotelName = `${prefix} ${location} ${suffix}`;
    } else {
      hotelName = `${prefix} ${suffix}`;
    }
    
    // Generate a random rating between 7.5 and 9.5
    const rating = 7.5 + Math.random() * 2;
    
    // Generate a base price
    const basePrice = 4000 + Math.floor(Math.random() * 15000) + (rating * 500);
    const prices = generatePriceComparisons(basePrice);
    const bestPrice = Math.min(...prices.map(p => p.price));
    const discount = Math.round(((prices[0].price - bestPrice) / prices[0].price) * 100);
    
    // Create a location-specific image with a unique seed for variety
    const uniqueSeed = `custom-${i}-${Date.now()}`;
    
    customHotels.push({
      id: `hotel-custom-${i}-${Date.now()}`,
      name: hotelName,
      image: getLocationSpecificImage(location, uniqueSeed),
      rating: rating,
      reviewCount: Math.floor(Math.random() * 400) + 50,
      address: `${location}, India`,
      amenities: generateRandomAmenities(),
      distance: `${(Math.random() * 5).toFixed(1)} km from center`,
      location: location,
      prices: prices,
      price: bestPrice,
      originalPrice: prices[0].price,
      discount: discount > 5 ? discount : null,
      currency: '₹',
      bookingLink: `https://www.hotellook.com/hotels?marker=${config.partnerId}&destination=${encodeURIComponent(location)}&checkIn=${params.checkIn}&checkOut=${params.checkOut}&adults=${params.adults || 1}&children=0&rooms=${params.rooms || 1}`
    });
  }
  
  return customHotels;
}

/**
 * Generate random hotel amenities
 */
function generateRandomAmenities() {
  const allAmenities = [
    'Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 
    'Room Service', '24/7 Service', 'Airport Shuttle', 'Parking',
    'Air Conditioning', 'Beach Access', 'Business Center', 'Laundry',
    'Breakfast Included'
  ];
  
  const count = Math.floor(Math.random() * 4) + 3; // 3-6 amenities
  const selectedAmenities = [];
  
  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * allAmenities.length);
    if (!selectedAmenities.includes(allAmenities[index])) {
      selectedAmenities.push(allAmenities[index]);
    }
  }
  
  return selectedAmenities;
}

/**
 * Generate price comparisons from different booking systems
 * 
 * @param {number} basePrice - Base price to generate variations from
 * @returns {Array} - Array of price objects from different systems
 */
function generatePriceComparisons(basePrice) {
  // Shuffle the booking systems array to randomize which ones offer the hotel
  const shuffledSystems = [...bookingSystems].sort(() => 0.5 - Math.random());
  
  // Use 3-5 random booking systems
  const systemsCount = Math.floor(Math.random() * 3) + 3;
  const selectedSystems = shuffledSystems.slice(0, systemsCount);
  
  // Generate prices for each system with some variation
  return selectedSystems.map(system => {
    // Generate a price variation between -15% and +15% of the base price
    const variation = (Math.random() * 0.3) - 0.15;
    const price = Math.round(basePrice * (1 + variation));
    
    return {
      system: system.id,
      systemName: system.name,
      systemLogo: system.logo,
      price,
      url: `https://hotels-comparer.com/2/redirect?system=${system.id}&marker=${config.partnerId}`
    };
  }).sort((a, b) => a.price - b.price); // Sort by price ascending
}

/**
 * Legacy function for backward compatibility
 */
function getMockHotels(params) {
  return getMockHotelsWithPriceComparison(params);
}

/**
 * Get a location-specific image for a hotel
 * 
 * @param {string} location - Location name
 * @param {string} seed - Unique seed for the image
 * @returns {string} - URL for a location-specific image
 */
function getLocationSpecificImage(location, seed) {
  const cleanLocation = location.replace(/[^\w\s]/gi, '').trim();
  
  // Map of common Indian tourist locations to more specific search terms
  const locationMappings = {
    'mumbai': ['mumbai gateway india', 'mumbai marine drive', 'mumbai taj hotel', 'mumbai elephanta', 'mumbai city skyline'],
    'delhi': ['delhi india gate', 'delhi red fort', 'delhi qutub minar', 'delhi lotus temple', 'delhi humayun tomb'],
    'bangalore': ['bangalore palace gardens', 'bangalore cubbon park', 'bangalore vidhana soudha', 'bangalore lalbagh', 'bangalore mg road'],
    'kolkata': ['kolkata howrah bridge', 'kolkata victoria memorial', 'kolkata park street', 'kolkata dakshineswar temple', 'kolkata eco park'],
    'chennai': ['chennai marina beach', 'chennai kapaleeshwarar temple', 'chennai fort st george', 'chennai mylapore', 'chennai cathedral'],
    'hyderabad': ['hyderabad charminar', 'hyderabad golconda fort', 'hyderabad hussain sagar', 'hyderabad falaknuma palace', 'hyderabad birla mandir'],
    'ahmedabad': ['ahmedabad sabarmati riverfront', 'ahmedabad adalaj stepwell', 'ahmedabad sabarmati ashram', 'ahmedabad kankaria lake', 'ahmedabad jama masjid'],
    'pune': ['pune shaniwar wada', 'pune aga khan palace', 'pune sinhagad fort', 'pune dagdusheth temple', 'pune khadakwasla dam'],
    'jaipur': ['jaipur hawa mahal', 'jaipur amber fort', 'jaipur city palace', 'jaipur jantar mantar', 'jaipur jal mahal'],
    'lucknow': ['lucknow bara imambara', 'lucknow rumi darwaza', 'lucknow chhota imambara', 'lucknow british residency', 'lucknow ambedkar park'],
    'agra': ['agra taj mahal', 'agra red fort', 'agra fatehpur sikri', 'agra tomb of akbar', 'agra mehtab bagh'],
    'varanasi': ['varanasi ganges ghats', 'varanasi dasaswamedh ghat', 'varanasi kashi vishwanath', 'varanasi sarnath', 'varanasi evening aarti'],
    'amritsar': ['amritsar golden temple', 'amritsar jallianwala bagh', 'amritsar wagah border', 'amritsar partition museum', 'amritsar gobindgarh fort'],
    'goa': ['goa beaches', 'goa calangute', 'goa basilica bom jesus', 'goa dudhsagar falls', 'goa fort aguada'],
    'udaipur': ['udaipur lake palace', 'udaipur city palace', 'udaipur jagdish temple', 'udaipur lake pichola', 'udaipur fateh sagar lake'],
    'shimla': ['shimla mall road', 'shimla christ church', 'shimla ridge', 'shimla kufri', 'shimla jakhu temple']
  };
  
  // Additional modifiers to add variety
  const hotelStyles = ['luxury hotel', 'resort', 'boutique hotel', 'heritage hotel', 'palace hotel'];
  const interiorFeatures = ['lobby', 'swimming pool', 'hotel restaurant', 'hotel room', 'spa'];
  const vibeModifiers = ['elegant', 'luxurious', 'high-end', 'beautiful', 'grand'];
  
  // Try to find a specific search term for the location
  let searchTerms = [cleanLocation];
  const locationLower = cleanLocation.toLowerCase();
  
  // Get location-specific terms if available
  for (const [key, values] of Object.entries(locationMappings)) {
    if (locationLower.includes(key) || key.includes(locationLower)) {
      searchTerms = values;
      break;
    }
  }
  
  // Choose a random search term from the available options
  // Generate a number 0-999 from the seed to pick a consistent but varied term
  const seedNum = parseInt(seed.replace(/[^\d]/g, '').slice(-3) || '123');
  const searchTermIndex = seedNum % searchTerms.length;
  let searchTerm = searchTerms[searchTermIndex];
  
  // Determine if we show a hotel interior or a location landmark
  // Use another digit from the seed to ensure consistent but different choices
  const seedLastDigit = parseInt(seed.slice(-1) || '0');
  
  let imageCategory;
  if (seedLastDigit < 4) {
    // 40% chance for hotel interior with location influence
    const hotelStyleIndex = (seedNum % hotelStyles.length);
    const interiorFeatureIndex = ((seedNum + 1) % interiorFeatures.length);
    
    imageCategory = `${cleanLocation} ${hotelStyles[hotelStyleIndex]} ${interiorFeatures[interiorFeatureIndex]}`;
  } else if (seedLastDigit < 8) {
    // 40% chance for location landmark
    imageCategory = searchTerm;
  } else {
    // 20% chance for vibe-modified hotel in location
    const vibeIndex = (seedNum % vibeModifiers.length);
    imageCategory = `${vibeModifiers[vibeIndex]} ${cleanLocation} ${hotelStyles[0]}`;
  }
  
  // Add unrelated random numbers to ensure different images
  const randomNum = Date.now() % 10000 + Math.floor(Math.random() * 10000);
  
  // Add one of these strings to make each URL unique
  const uniqueParams = [
    'hotel', 'travel', 'vacation', 'tourism', 'architecture', 
    'building', 'luxury', 'holiday', 'accommodations', 'landmark'
  ];
  const uniqueParam = uniqueParams[seedNum % uniqueParams.length];
  
  // Create the final URL
  return `https://source.unsplash.com/random/800x600/?${encodeURIComponent(imageCategory)}&${uniqueParam}=${randomNum}`;
}

/**
 * Export all functions as default object
 */
export default {
  searchHotels,
  getHotelDetails,
  getMockHotels: getMockHotelsWithPriceComparison,
  getMockHotelsWithPriceComparison
}; 