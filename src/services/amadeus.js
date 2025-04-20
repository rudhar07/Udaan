/**
 * Amadeus API Service
 * 
 * This service provides an interface to interact with the Amadeus API 
 * for flight search, hotel search, and other travel-related data.
 * 
 * Environment variables:
 * - VITE_AMADEUS_API_KEY: API key for authentication
 * - VITE_AMADEUS_API_SECRET: API secret for authentication
 * - VITE_AMADEUS_API_URL: Base URL for API requests
 * - VITE_ENABLE_MOCK_DATA: Whether to use mock data instead of real API
 */

// Get configuration from environment variables
const config = {
  apiKey: import.meta.env.VITE_AMADEUS_API_KEY || 'CwAfhOLzVvZ84qJ33B4FU1aUcjTJT4yk',
  apiSecret: import.meta.env.VITE_AMADEUS_API_SECRET || 'JcOYSGl8KyoK4Z3E',
  apiUrl: import.meta.env.VITE_AMADEUS_API_URL || 'https://test.api.amadeus.com',
  useMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || true
};

// Token management
let authToken = null;
let tokenExpiration = null;

/**
 * Get a valid authentication token
 * @returns {Promise<string>} - Authentication token
 */
export async function getToken() {
  try {
    // Check if we have a valid token
    if (authToken && tokenExpiration && new Date() < tokenExpiration) {
      return authToken;
    }
    
    // Request a new token
    const response = await fetch(`${config.apiUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.apiKey,
        client_secret: config.apiSecret,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get token: ${error.error_description || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Set token and expiration
    authToken = data.access_token;
    // Set expiration to 30 seconds before actual expiration to prevent token expiration during requests
    tokenExpiration = new Date(new Date().getTime() + (data.expires_in - 30) * 1000);
    
    console.log('Obtained new Amadeus API token');
    return authToken;
  } catch (error) {
    console.error('Error getting authentication token:', error);
    throw error;
  }
}

/**
 * Make a request to the Amadeus API
 * @param {string} endpoint - API endpoint
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} - API response
 */
export async function makeRequest(endpoint, params = {}) {
  // If mock data is enabled, return mock data directly
  if (config.useMockData) {
    console.log(`Mock data enabled - returning mock data for ${endpoint}`);
    // Add a delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    // Return null to trigger the fallback to mock data in the calling functions
    return null;
  }
  
  try {
    // Ensure we have a valid token
    const token = await getToken();
    
    // Construct the URL with query parameters
    const url = new URL(`${config.apiUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });
    
    // Make the request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });
    
    // Handle rate limiting
    if (response.status === 429) {
      console.log('Rate limit exceeded, retrying after delay...');
      // Wait for a few seconds and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      return makeRequest(endpoint, params);
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error:', errorData);
      throw new Error(`Amadeus API error: ${errorData.errors?.[0]?.detail || 'Unknown error'}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error making request to Amadeus API:', error);
    throw error;
  }
}

/**
 * Search for flights based on provided parameters
 * 
 * @param {Object} params - Search parameters
 * @param {string} params.from - Origin airport code (IATA)
 * @param {string} params.to - Destination airport code (IATA)
 * @param {string} params.departure - Departure date (YYYY-MM-DD)
 * @param {string} [params.return] - Return date for round trips (YYYY-MM-DD)
 * @param {number} [params.passengers=1] - Number of passengers
 * @param {string} [params.tripType="return"] - Trip type ("return" or "oneway")
 * @param {string} [params.cabinClass="economy"] - Cabin class
 * @returns {Promise<Array>} - Array of flight results
 */
export async function searchFlights(params) {
  console.log('Searching flights with params:', params);
  
  // Check if we should use mock data
  if (config.useMockData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate mock flight data based on search parameters
    return generateMockFlights(params);
  }
  
  // Here would be the real API call to Amadeus if mock data is disabled
  // Example:
  // const token = await getToken();
  // const response = await fetch(`${config.apiUrl}/shopping/flight-offers`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify(formatSearchParams(params))
  // });
  // const data = await response.json();
  // return parseFlightResults(data);
  
  // For now, return mock data
  return generateMockFlights(params);
}

/**
 * Generate mock flight data based on search parameters
 * 
 * @param {Object} params - Search parameters
 * @returns {Array} - Array of mock flight results
 * @private
 */
function generateMockFlights(params) {
  const { from, to, departure, passengers = 1, tripType, cabinClass = 'economy' } = params;
  
  // Base price range depending on cabin class
  let basePriceRange;
  switch (cabinClass) {
    case 'economy': basePriceRange = { min: 5000, max: 15000 }; break;
    case 'premium': basePriceRange = { min: 15000, max: 30000 }; break;
    case 'business': basePriceRange = { min: 30000, max: 60000 }; break;
    case 'first': basePriceRange = { min: 60000, max: 120000 }; break;
    default: basePriceRange = { min: 5000, max: 15000 };
  }
  
  // Adjust price based on passengers
  const priceMultiplier = Math.max(1, passengers * 0.9); // Slight discount for multiple passengers
  
  // Airlines with their logos
  const airlines = [
    { code: 'AI', name: 'Air India', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Air_India.svg' },
    { code: '6E', name: 'IndiGo', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/IndiGo_Airlines_logo.svg' },
    { code: 'UK', name: 'Vistara', logo: 'https://companieslogo.com/img/orig/VISTARA-c07b120f.png' },
    { code: 'SG', name: 'SpiceJet', logo: 'https://companieslogo.com/img/orig/SPICEJET-6a0c3b5e.png' },
    { code: 'I5', name: 'AirAsia India', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2b/AirAsia_New_Logo_%282020%29.svg' },
    { code: 'G8', name: 'GoAir', logo: 'https://seeklogo.com/images/G/goair-airlines-logo-276810-seeklogo.com.png' }
  ];
  
  // Generate a random number of flights (5-10)
  const numFlights = 5 + Math.floor(Math.random() * 6);
  const flights = [];
  
  // Parse the departure date
  const departureDate = new Date(departure);
  
  for (let i = 0; i < numFlights; i++) {
    // Pick a random airline
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    
    // Generate random departure time (between 5am and 9pm)
    const departureHour = 5 + Math.floor(Math.random() * 16);
    const departureMinute = Math.floor(Math.random() * 60);
    const departureTime = `${departureHour.toString().padStart(2, '0')}:${departureMinute.toString().padStart(2, '0')}`;
    
    // Generate a random duration (1.5h to 4h)
    const durationHours = 1 + Math.floor(Math.random() * 3);
    const durationMinutes = Math.floor(Math.random() * 30);
    const duration = `${durationHours}h ${durationMinutes}m`;
    
    // Calculate arrival time
    const arrivalDateTime = new Date(departureDate);
    arrivalDateTime.setHours(departureHour + durationHours);
    arrivalDateTime.setMinutes(departureMinute + durationMinutes);
    const arrivalTime = `${arrivalDateTime.getHours().toString().padStart(2, '0')}:${arrivalDateTime.getMinutes().toString().padStart(2, '0')}`;
    
    // Generate random number of stops (0, 1, or occasionally 2)
    const stops = Math.random() < 0.5 ? 0 : Math.random() < 0.8 ? 1 : 2;
    
    // Generate a price based on stops and class
    let price = basePriceRange.min + Math.floor(Math.random() * (basePriceRange.max - basePriceRange.min));
    // Direct flights are more expensive
    if (stops === 0) price *= 1.2;
    // Multiply by passenger count
    price = Math.round(price * priceMultiplier);
    
    // Add flight to results
    flights.push({
      id: `FL${1000 + i}`,
      airline: airline.name,
      logo: airline.logo,
      departureTime,
      arrivalTime,
      departureAirport: from,
      arrivalAirport: to,
      duration,
      stops,
      price,
      currency: '₹',
      bookingLink: '#'
    });
  }
  
  // Sort flights by price (lowest first)
  return flights.sort((a, b) => a.price - b.price);
}

/**
 * Get flight inspiration (popular destinations) from an origin
 * 
 * @param {string} origin - Origin airport code
 * @param {number} [maxPrice] - Maximum price constraint
 * @returns {Promise<Array>} - Array of destination results
 */
export async function getFlightInspiration(origin, maxPrice) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Sample destination data
  const destinations = [
    { city: 'Mumbai', country: 'India', price: 4500, departureDate: '2023-07-15', returnDate: '2023-07-22', airline: 'IndiGo' },
    { city: 'Bangalore', country: 'India', price: 5200, departureDate: '2023-07-18', returnDate: '2023-07-25', airline: 'Air India' },
    { city: 'Goa', country: 'India', price: 6500, departureDate: '2023-07-10', returnDate: '2023-07-17', airline: 'Vistara' },
    { city: 'Dubai', country: 'UAE', price: 18500, departureDate: '2023-07-20', returnDate: '2023-07-27', airline: 'Emirates' },
    { city: 'Singapore', country: 'Singapore', price: 22000, departureDate: '2023-08-05', returnDate: '2023-08-12', airline: 'Singapore Airlines' },
    { city: 'Bangkok', country: 'Thailand', price: 16000, departureDate: '2023-08-10', returnDate: '2023-08-17', airline: 'Thai Airways' },
    { city: 'Colombo', country: 'Sri Lanka', price: 12500, departureDate: '2023-07-25', returnDate: '2023-08-01', airline: 'SriLankan Airlines' },
    { city: 'Kathmandu', country: 'Nepal', price: 9800, departureDate: '2023-09-05', returnDate: '2023-09-12', airline: 'Nepal Airlines' }
  ];
  
  // Filter by max price if provided
  let filteredDestinations = destinations;
  if (maxPrice) {
    filteredDestinations = destinations.filter(dest => dest.price <= maxPrice);
  }
  
  // Add IDs and origin information
  return filteredDestinations.map((dest, index) => ({
    id: `INSP${index + 1}`,
    origin,
    ...dest
  }));
}

// Other functions like getFlightPriceAnalysis, searchHotels, etc. would go here

/**
 * Export all functions as default object
 */
export default {
  searchFlights,
  getFlightInspiration,
  getToken,
  makeRequest
}; 