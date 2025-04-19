import React from 'react';

function DestinationCard({ destination }) {
  const {
    name = 'Destination',
    image = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    price = 0,
    currency = '₹',
    timeframe = 'round trip'
  } = destination || {};

  return (
    <div className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
      {/* Image with overlay gradient */}
      <div className="aspect-video relative">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition duration-500 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="absolute bottom-0 left-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-1">{name}</h3>
        <p className="font-medium">
          from <span className="text-lg">{currency} {price.toLocaleString()}</span>
        </p>
        <p className="text-sm opacity-80">{timeframe}</p>
      </div>
    </div>
  );
}

export default DestinationCard; 