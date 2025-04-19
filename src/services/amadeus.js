/**
 * Amadeus API Service
 * Handles authentication and requests to the Amadeus API
 */

// API Credentials
const API_KEY = 'Jp4mDPIidnghpVDPEBU8wL9Yl2NJh1fq';
const API_SECRET = 'LbOr5m1m6lFpK1nj';
const BASE_URL = 'https://test.api.amadeus.com'; // Using test environment

// Store the token and its expiry
let accessToken = null;
let tokenExpiry = null;

/**
 * Get an authentication token from Amadeus API
 */
async function getToken() {
  // Check if we already have a valid token
  if (accessToken && tokenExpiry && new Date() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: API_KEY,
        client_secret: API_SECRET,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Authentication failed: ${data.error_description || 'Unknown error'}`);
    }

    // Store the token and calculate expiry
    accessToken = data.access_token;
    tokenExpiry = new Date(Date.now() + data.expires_in * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting authentication token:', error);
    throw error;
  }
}

/**
 * Make an authenticated request to the Amadeus API
 */
async function makeRequest(endpoint, method = 'GET', params = null) {
  try {
    const token = await getToken();
    
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    
    // Add body for POST requests
    if (method === 'POST' && params) {
      options.body = JSON.stringify(params);
      options.headers['Content-Type'] = 'application/json';
    }
    
    // Build URL with query string for GET requests
    let url = `${BASE_URL}${endpoint}`;
    if (method === 'GET' && params) {
      const queryString = new URLSearchParams(params).toString();
      url = `${url}?${queryString}`;
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      const errorMessage = data.errors?.[0]?.detail || 'Unknown error';
      throw new Error(`API request failed: ${errorMessage}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Search for flights using the Amadeus Flight Offers Search API
 */
export async function searchFlights(params) {
  try {
    const queryParams = {
      originLocationCode: params.from,
      destinationLocationCode: params.to,
      departureDate: params.departure,
      adults: params.passengers || 1,
      currencyCode: 'INR',
      max: 10, // Limit results
    };
    
    // Add return date if it's a round trip
    if (params.tripType === 'return' && params.return) {
      queryParams.returnDate = params.return;
    }
    
    // Add cabin class if specified
    if (params.cabinClass) {
      let travelClass;
      switch (params.cabinClass) {
        case 'economy': travelClass = 'ECONOMY'; break;
        case 'premium': travelClass = 'PREMIUM_ECONOMY'; break;
        case 'business': travelClass = 'BUSINESS'; break;
        case 'first': travelClass = 'FIRST'; break;
        default: travelClass = 'ECONOMY';
      }
      queryParams.travelClass = travelClass;
    }
    
    const data = await makeRequest('/v2/shopping/flight-offers', 'GET', queryParams);
    return processFlightData(data);
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
}

/**
 * Process the flight data from Amadeus into a format our app can use
 */
function processFlightData(apiData) {
  if (!apiData.data || !Array.isArray(apiData.data)) {
    return [];
  }
  
  const airlines = apiData.dictionaries?.carriers || {};
  const airports = apiData.dictionaries?.locations || {};
  
  return apiData.data.map((offer, index) => {
    const outbound = offer.itineraries[0];
    const firstSegment = outbound.segments[0];
    const lastSegment = outbound.segments[outbound.segments.length - 1];
    
    // Calculate stops
    const stops = outbound.segments.length - 1;
    
    // Calculate total duration in minutes and format
    const durationMatch = outbound.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(durationMatch[1] || 0);
    const minutes = parseInt(durationMatch[2] || 0);
    const totalDuration = `${hours}h ${minutes}m`;
    
    // Get departure and arrival information
    const departureTime = firstSegment.departure.at.substring(11, 16);
    const arrivalTime = lastSegment.arrival.at.substring(11, 16);
    const departureAirport = firstSegment.departure.iataCode;
    const arrivalAirport = lastSegment.arrival.iataCode;
    
    // Get airline info
    const airlineCode = firstSegment.carrierCode;
    const airlineName = airlines[airlineCode] || airlineCode;
    
    // Get price
    const price = parseFloat(offer.price.total);
    const currency = offer.price.currency;
    
    return {
      id: offer.id || index.toString(),
      airline: airlineName,
      logo: '✈️',
      departureTime,
      arrivalTime,
      departureAirport,
      arrivalAirport,
      duration: totalDuration,
      stops,
      price,
      currency,
      // Add booking link to the actual airline website
      bookingLink: `https://www.skyscanner.com/transport/flights/${departureAirport}/${arrivalAirport}`,
      rawData: offer // Keep the raw data in case we need more details
    };
  });
}

/**
 * Search for flight inspiration using Amadeus Flight Inspiration Search API
 * This API suggests destinations from a given origin
 */
export async function getFlightInspiration(origin, maxPrice = null) {
  try {
    const params = {
      origin: origin,
      maxPrice: maxPrice
    };
    
    const data = await makeRequest('/v1/shopping/flight-destinations', 'GET', params);
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map(dest => ({
      origin: dest.origin,
      destination: dest.destination,
      departureDate: dest.departureDate,
      returnDate: dest.returnDate,
      price: {
        amount: parseFloat(dest.price.total),
        currency: dest.price.currency
      },
      links: {
        flightOffers: `https://www.skyscanner.com/transport/flights/${dest.origin}/${dest.destination}`
      }
    }));
  } catch (error) {
    console.error('Error getting flight inspiration:', error);
    throw error;
  }
}

/**
 * Search for airports and cities using Amadeus Airport & City Search API
 * Useful for autocomplete in search forms
 */
export async function searchLocations(keyword, subType = 'AIRPORT,CITY') {
  try {
    const params = {
      keyword: keyword,
      subType: subType,
      page: {
        limit: 10
      }
    };
    
    const data = await makeRequest('/v1/reference-data/locations', 'GET', params);
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map(location => ({
      id: location.id,
      name: location.name,
      iataCode: location.iataCode,
      address: {
        cityName: location.address?.cityName,
        countryName: location.address?.countryName
      },
      geoCode: location.geoCode,
      subType: location.subType
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
}

/**
 * Get flight price analysis using Amadeus Flight Price Analysis API
 * Provides insights on flight prices
 */
export async function getFlightPriceAnalysis(origin, destination, departureDate) {
  try {
    const params = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate: departureDate,
      currencyCode: 'INR'
    };
    
    const data = await makeRequest('/v1/analytics/flight-price-analysis', 'GET', params);
    
    if (!data.data) {
      return null;
    }
    
    return {
      currencyCode: data.currencyCode,
      lowestPrice: data.data.lowestPrice,
      medianPrice: data.data.medianPrice,
      highestPrice: data.data.highestPrice,
      priceHistory: data.data.priceHistory || []
    };
  } catch (error) {
    console.error('Error getting flight price analysis:', error);
    throw error;
  }
}

/**
 * Search for hotels using Amadeus Hotel Search API
 */
export async function searchHotels(cityCode, checkInDate, checkOutDate, adults = 1) {
  try {
    const params = {
      cityCode: cityCode,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      roomQuantity: 1,
      adults: adults,
      radius: 50,
      radiusUnit: 'KM',
      ratings: '3,4,5',
    };
    
    const data = await makeRequest('/v2/shopping/hotel-offers', 'GET', params);
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map(hotel => ({
      hotelId: hotel.hotel.hotelId,
      name: hotel.hotel.name,
      rating: hotel.hotel.rating,
      address: {
        lines: hotel.hotel.address?.lines,
        cityName: hotel.hotel.address?.cityName,
        countryCode: hotel.hotel.address?.countryCode
      },
      contact: hotel.hotel.contact,
      description: hotel.hotel.description,
      amenities: hotel.hotel.amenities,
      media: hotel.hotel.media,
      offers: hotel.offers.map(offer => ({
        id: offer.id,
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        roomType: offer.room?.typeEstimated,
        price: {
          total: parseFloat(offer.price.total),
          currency: offer.price.currency
        },
        policies: offer.policies,
        cancellable: offer.cancellable
      }))
    }));
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
}

/**
 * Get points of interest at a destination
 */
export async function getPointsOfInterest(latitude, longitude, radius = 20, categories = null) {
  try {
    const params = {
      latitude: latitude,
      longitude: longitude,
      radius: radius
    };
    
    if (categories) {
      params.category = categories;
    }
    
    const data = await makeRequest('/v1/reference-data/locations/pois', 'GET', params);
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map(poi => ({
      id: poi.id,
      name: poi.name,
      category: poi.category,
      rank: poi.rank,
      tags: poi.tags,
      geoCode: poi.geoCode,
      address: {
        cityName: poi.address?.cityName,
        countryName: poi.address?.countryName
      }
    }));
  } catch (error) {
    console.error('Error getting points of interest:', error);
    throw error;
  }
}

/**
 * Get airline routes
 */
export async function getAirlineRoutes(airlineCode) {
  try {
    const params = {
      airlineCode: airlineCode
    };
    
    const data = await makeRequest('/v1/airline/routes', 'GET', params);
    
    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }
    
    return data.data.map(route => ({
      departureAirport: route.departureAirport,
      arrivalAirport: route.arrivalAirport,
      aircraft: route.aircraft
    }));
  } catch (error) {
    console.error('Error getting airline routes:', error);
    throw error;
  }
}

export default {
  searchFlights,
  getFlightInspiration,
  searchLocations,
  getFlightPriceAnalysis,
  searchHotels,
  getPointsOfInterest,
  getAirlineRoutes
}; 