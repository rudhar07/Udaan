import React from 'react';

function FlightCard({ flight }) {
  // Default values in case flight object is not complete
  const {
    airline = 'Airline',
    logo = '✈️',
    departureTime = '00:00',
    arrivalTime = '00:00',
    departureAirport = 'DEP',
    arrivalAirport = 'ARR',
    duration = '0h 0m',
    stops = 0,
    price = 0,
    currency = 'INR',
    bookingLink = '#'
  } = flight || {};

  // Format stops text
  const stopsText = stops === 0 
    ? 'Direct' 
    : stops === 1 
      ? '1 stop' 
      : `${stops} stops`;
      
  // Handle booking click
  const handleBookingClick = () => {
    window.open(bookingLink, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="mr-3 text-2xl">{logo}</div>
          <div className="text-sm font-medium">{airline}</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#0770e3]">
            {currency} {price.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">per person</div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{departureTime}</span>
          <span className="text-sm text-gray-500">{departureAirport}</span>
        </div>
        
        <div className="flex-1 mx-4">
          <div className="relative">
            <div className="border-t border-gray-300 mx-2"></div>
            <div className="absolute inset-x-0 top-0 flex justify-center -mt-1">
              <div className="bg-white px-2 text-xs text-gray-500">{duration}</div>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-center mt-1">
              <div className="bg-white px-2 text-xs text-gray-500">{stopsText}</div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{arrivalTime}</span>
          <span className="text-sm text-gray-500">{arrivalAirport}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <button 
          onClick={handleBookingClick}
          className="w-full bg-[#0770e3] hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200"
        >
          Select and book this flight
        </button>
        <p className="text-xs text-center mt-2 text-gray-500">
          You'll be redirected to the booking site
        </p>
      </div>
    </div>
  );
}

export default FlightCard; 