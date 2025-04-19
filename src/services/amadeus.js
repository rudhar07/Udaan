/**
 * Amadeus API Service (Mock)
 * Provides flight search functionality with mock data
 */

/**
 * Mock flight search that returns simulated flight data
 */
export async function searchFlights(params) {
  console.log('Searching flights with params:', params);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock flight data based on search parameters
  return generateMockFlights(params);
}

/**
 * Generate mock flight data based on search parameters
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
  
  // Airlines with their codes
  const airlines = [
    { code: 'AI', name: 'Air India' },
    { code: '6E', name: 'IndiGo' },
    { code: 'UK', name: 'Vistara' },
    { code: 'SG', name: 'SpiceJet' },
    { code: 'I5', name: 'AirAsia India' },
    { code: 'G8', name: 'GoAir' }
  ];
  
  // Generate a random number of flights (5-10)
  const numFlights = 5 + Math.floor(Math.random() * 6);
  const flights = [];
  
  // Parse the departure date
  const departureDate = new Date(departure);
  
  for (let i = 0; i < numFlights; i++) {
    // Select random airline
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    
    // Generate random departure time (between 6AM and 9PM)
    const departureHour = 6 + Math.floor(Math.random() * 15);
    const departureMinute = Math.floor(Math.random() * 60);
    const departureTime = `${String(departureHour).padStart(2, '0')}:${String(departureMinute).padStart(2, '0')}`;
    
    // Generate random flight duration (1-5 hours)
    const durationHours = 1 + Math.floor(Math.random() * 4);
    const durationMinutes = Math.floor(Math.random() * 60);
    
    // Calculate arrival time
    const arrivalHour = (departureHour + durationHours) % 24;
    const arrivalMinute = (departureMinute + durationMinutes) % 60;
    const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(arrivalMinute).padStart(2, '0')}`;
    
    // Generate random price within range
    const basePrice = basePriceRange.min + Math.floor(Math.random() * (basePriceRange.max - basePriceRange.min));
    const price = Math.round(basePrice * priceMultiplier);
    
    // Random number of stops (0-2, with higher probability for direct flights)
    const stopsProbability = Math.random();
    let stops = 0;
    if (stopsProbability > 0.6) stops = 1;
    if (stopsProbability > 0.9) stops = 2;
    
    flights.push({
      id: `FL-${1000 + i}`,
      airline: airline.name,
      logo: '✈️',
      departureTime,
      arrivalTime,
      departureAirport: from,
      arrivalAirport: to,
      duration: `${durationHours}h ${durationMinutes}m`,
      stops,
      price,
      currency: 'INR',
      bookingLink: `https://www.skyscanner.com/transport/flights/${from}/${to}`,
    });
  }
  
  // Sort flights by price by default
  return flights.sort((a, b) => a.price - b.price);
}

export default {
  searchFlights
}; 