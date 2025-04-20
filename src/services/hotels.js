/**
 * Hotels API Service
 * 
 * This service provides an interface to interact with the Amadeus API 
 * for hotel search and booking.
 */

import { getToken, makeRequest } from './amadeus';

/**
 * Search for hotels based on provided parameters
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.location - City or IATA code
 * @param {string} params.checkIn - Check-in date (YYYY-MM-DD)
 * @param {string} params.checkOut - Check-out date (YYYY-MM-DD)
 * @param {number} [params.adults=1] - Number of adults
 * @param {number} [params.rooms=1] - Number of rooms
 * @param {number} [params.ratings] - Array of star ratings [1,2,3,4,5]
 * @param {string} [params.priceRange] - Price range (e.g., "50-200")
 * @returns {Promise<Array>} - Array of hotel results
 */
export async function searchHotels(params) {
  try {
    // Validate required parameters
    if (!params.location || !params.checkIn || !params.checkOut) {
      console.error('Missing required parameters for hotel search');
      return getMockHotels(params);
    }
    
    // Ensure we have a valid auth token
    await getToken();
    
    // Convert city name to IATA code if needed
    let cityCode = params.location;
    if (!/^[A-Z]{3}$/.test(params.location)) {
      // If not an IATA code, search for the city first
      const cityResponse = await makeRequest('/v1/reference-data/locations', {
        keyword: params.location,
        subType: 'CITY'
      });
      
      if (cityResponse.data && cityResponse.data.length > 0) {
        cityCode = cityResponse.data[0].iataCode;
      } else {
        console.log('City not found, returning mock data');
        return getMockHotels(params);
      }
    }
    
    // Construct query parameters for hotel search
    const queryParams = {
      cityCode: cityCode,
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      adults: params.adults || 1,
      roomQuantity: params.rooms || 1,
      currency: 'INR',
      bestRateOnly: true
    };
    
    // Add optional parameters if provided
    if (params.ratings && params.ratings.length > 0) {
      queryParams.ratings = params.ratings.join(',');
    }
    
    if (params.priceRange) {
      const [min, max] = params.priceRange.split('-');
      if (min) queryParams.priceRange = `${min}-`;
      if (max) queryParams.priceRange += max;
    }
    
    // Make the request to Amadeus API
    const response = await makeRequest('/v3/shopping/hotel-offers', queryParams);
    
    // Check if we got hotels back
    if (!response.data || response.data.length === 0) {
      console.log('No hotels found, returning mock data');
      return getMockHotels(params);
    }
    
    // Parse the hotel data from the API response
    const hotels = response.data.map(hotelData => {
      const { hotel, offers, self } = hotelData;
      
      // Get the best offer price
      const bestOffer = offers && offers.length > 0 ? offers[0] : null;
      const price = bestOffer ? parseFloat(bestOffer.price.total) : null;
      
      return {
        id: hotel.hotelId,
        name: hotel.name,
        rating: hotel.rating,
        address: formatAddress(hotel.address),
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        amenities: hotel.amenities || [],
        contact: hotel.contact || {},
        price: price,
        currency: bestOffer ? bestOffer.price.currency : 'INR',
        description: hotel.description || '',
        media: hotel.media || [],
        image: hotel.media && hotel.media.length > 0 
          ? hotel.media[0].uri 
          : `https://source.unsplash.com/random/300x200/?hotel,${hotel.name.split(' ')[0]}`,
        bookingLink: self,
        reviewCount: Math.floor(Math.random() * 200) + 50, // This would come from a real API
        distance: '1.5 km' // This would come from a real API
      };
    });
    
    return hotels;
  } catch (error) {
    console.error('Error searching hotels:', error);
    // Return mock data in case of error
    return getMockHotels(params);
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
    
    // Ensure we have a valid auth token
    await getToken();
    
    // Construct query parameters
    const queryParams = {
      hotelIds: hotelId,
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      adults: params.adults || 1,
      roomQuantity: params.rooms || 1,
      currency: 'INR',
      bestRateOnly: false
    };
    
    // Make the request to Amadeus API
    const response = await makeRequest('/v3/shopping/hotel-offers/by-hotel', queryParams);
    
    if (!response.data || response.data.length === 0) {
      console.log('No hotel details found');
      return null;
    }
    
    const hotelData = response.data[0];
    const { hotel, offers } = hotelData;
    
    // Format room offers
    const roomOffers = offers.map(offer => ({
      id: offer.id,
      roomType: offer.room ? offer.room.typeEstimated : 'Standard Room',
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      includedServices: offer.services || [],
      cancellationPolicy: offer.policies && offer.policies.cancellations 
        ? offer.policies.cancellations[0] 
        : null,
      bedType: offer.room && offer.room.typeEstimated ? offer.room.typeEstimated.bedType : null,
      description: offer.room ? offer.room.description : null
    }));
    
    return {
      id: hotel.hotelId,
      name: hotel.name,
      rating: hotel.rating,
      address: formatAddress(hotel.address),
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      amenities: hotel.amenities || [],
      contact: hotel.contact || {},
      description: hotel.description || '',
      media: hotel.media || [],
      image: hotel.media && hotel.media.length > 0 
        ? hotel.media[0].uri 
        : `https://source.unsplash.com/random/800x600/?hotel,${hotel.name.split(' ')[0]}`,
      offers: roomOffers,
      reviewCount: Math.floor(Math.random() * 200) + 50, // This would come from a real API
      distance: '1.5 km' // This would come from a real API
    };
  } catch (error) {
    console.error('Error getting hotel details:', error);
    return null;
  }
}

/**
 * Format the address object into a readable string
 * 
 * @param {Object} address - Address object from API
 * @returns {string} - Formatted address
 */
function formatAddress(address) {
  if (!address) return '';
  
  const parts = [
    address.lines ? address.lines.join(', ') : '',
    address.postalCode || '',
    address.cityName || '',
    address.stateCode ? `${address.stateCode}, ` : '',
    address.countryName || address.countryCode || ''
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Generate mock hotel data for testing
 * 
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of mock hotel results
 */
function getMockHotels(params) {
  const hotels = [
    {
      id: 'hotel-1',
      name: 'Grand Plaza Hotel & Spa',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      rating: 4.8,
      reviewCount: 254,
      price: 12500,
      currency: '₹',
      address: 'Civil Lines, Mumbai, Maharashtra',
      amenities: ['Pool', 'Spa', 'Gym', 'Free WiFi', 'Restaurant'],
      distance: '1.2 km'
    },
    {
      id: 'hotel-2',
      name: 'Sunset Beach Resort',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4',
      rating: 4.5,
      reviewCount: 189,
      price: 8500,
      currency: '₹',
      address: 'Juhu Beach, Mumbai, Maharashtra',
      amenities: ['Beach Access', 'Pool', 'Restaurant', 'Bar', 'Free WiFi'],
      distance: '3.5 km'
    },
    {
      id: 'hotel-3',
      name: 'City Lights Inn',
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      rating: 4.2,
      reviewCount: 145,
      price: 5800,
      currency: '₹',
      address: 'Andheri East, Mumbai, Maharashtra',
      amenities: ['Free WiFi', 'Airport Shuttle', 'Restaurant', '24/7 Service'],
      distance: '4.8 km'
    },
    {
      id: 'hotel-4',
      name: 'Royal Heritage Palace',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
      rating: 4.9,
      reviewCount: 320,
      price: 18900,
      currency: '₹',
      address: 'Marine Drive, Mumbai, Maharashtra',
      amenities: ['Sea View', 'Luxury Spa', 'Fine Dining', 'Gym', 'Pool'],
      distance: '0.8 km'
    },
    {
      id: 'hotel-5',
      name: 'Urban Oasis Hotel',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39',
      rating: 4.3,
      reviewCount: 178,
      price: 7200,
      currency: '₹',
      address: 'Bandra West, Mumbai, Maharashtra',
      amenities: ['Rooftop Pool', 'Restaurant', 'Bar', 'Free WiFi', 'Gym'],
      distance: '5.2 km'
    }
  ];
  
  // Add hotels for other cities
  if (params.location && params.location.toLowerCase() === 'delhi') {
    return [
      {
        id: 'hotel-6',
        name: 'Imperial Luxury Hotel',
        image: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28f8e',
        rating: 4.6,
        reviewCount: 421,
        price: 14500,
        currency: '₹',
        address: 'Connaught Place, Delhi, Delhi NCR',
        amenities: ['Pool', 'Spa', 'Gym', 'Free WiFi', 'Restaurant', 'Bar'],
        distance: '1.0 km'
      },
      {
        id: 'hotel-7',
        name: 'Heritage Grand',
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a',
        rating: 4.4,
        reviewCount: 286,
        price: 9200,
        currency: '₹',
        address: 'Karol Bagh, Delhi, Delhi NCR',
        amenities: ['Free WiFi', 'Restaurant', 'Room Service', 'Parking'],
        distance: '2.7 km'
      },
      {
        id: 'hotel-8',
        name: 'Diplomatic Suites',
        image: 'https://images.unsplash.com/photo-1606402179428-a57976d71fa4',
        rating: 4.7,
        reviewCount: 328,
        price: 16800,
        currency: '₹',
        address: 'Chanakyapuri, Delhi, Delhi NCR',
        amenities: ['Business Center', 'Pool', 'Spa', 'Fine Dining', 'Airport Shuttle'],
        distance: '3.2 km'
      }
    ];
  } else if (params.location && params.location.toLowerCase() === 'goa') {
    return [
      {
        id: 'hotel-9',
        name: 'Beach Paradise Resort',
        image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6',
        rating: 4.8,
        reviewCount: 512,
        price: 15700,
        currency: '₹',
        address: 'Calangute Beach, North Goa, Goa',
        amenities: ['Beachfront', 'Pool', 'Water Sports', 'Spa', 'Multiple Restaurants'],
        distance: '0.1 km'
      },
      {
        id: 'hotel-10',
        name: 'Tropical Oasis Villa',
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd',
        rating: 4.5,
        reviewCount: 345,
        price: 12300,
        currency: '₹',
        address: 'Anjuna, North Goa, Goa',
        amenities: ['Private Pool', 'Garden', 'Free WiFi', 'Kitchen', 'Beach Shuttle'],
        distance: '1.2 km'
      },
      {
        id: 'hotel-11',
        name: 'Seaside Luxury Hotel',
        image: 'https://images.unsplash.com/photo-1615880484746-a134be9a6ecf',
        rating: 4.9,
        reviewCount: 621,
        price: 22800,
        currency: '₹',
        address: 'Palolem Beach, South Goa, Goa',
        amenities: ['Private Beach', 'Infinity Pool', 'Spa', 'Water Sports', '5 Restaurants'],
        distance: '0.3 km'
      }
    ];
  }
  
  // Filter based on location name (very basic filtering for mock)
  if (params.location && params.location !== 'mumbai') {
    return hotels.filter(hotel => 
      hotel.address.toLowerCase().includes(params.location.toLowerCase())
    );
  }
  
  return hotels;
}

/**
 * Export all functions as default object
 */
export default {
  searchHotels,
  getHotelDetails,
  getMockHotels
}; 