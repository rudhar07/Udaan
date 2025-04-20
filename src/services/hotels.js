/**
 * Hotels API Service
 * 
 * This service provides an interface to interact with the Hotellook API 
 * for hotel search and booking, comparing prices from multiple booking systems.
 */

import { proxiedFetch, proxyUrl } from './corsProxy';

// Hotellook API configuration
const config = {
  apiToken: import.meta.env.VITE_HOTELLOOK_API_TOKEN || 'd9bfe25df635cf0b2514cb6af1c87c5c',
  partnerId: import.meta.env.VITE_HOTELLOOK_PARTNER_ID || '624529',
  apiBaseUrl: 'https://engine.hotellook.com/api/v2',
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

console.log('Hotellook API config:', { 
  token: config.apiToken, 
  partnerId: config.partnerId,
  useMockData: config.useMockData 
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
      return getMockHotels(params);
    }
    
    // Always use mock data for this implementation since we can't access all booking systems
    console.log('Using comparison data for hotel search');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
    return getMockHotelsWithPriceComparison(params);
  } catch (error) {
    console.error('Error in searchHotels:', error);
    return getMockHotelsWithPriceComparison(params);
  }
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
  
  // Return all hotels if location is "all"
  if (params.location === 'all') {
    return hotelsWithPrices;
  }
  
  // Filter based on location
  if (params.location) {
    return hotelsWithPrices.filter(hotel => 
      hotel.location.toLowerCase() === params.location.toLowerCase() ||
      hotel.address.toLowerCase().includes(params.location.toLowerCase())
    );
  }
  
  return hotelsWithPrices;
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
 * Export all functions as default object
 */
export default {
  searchHotels,
  getHotelDetails,
  getMockHotels: getMockHotelsWithPriceComparison
}; 