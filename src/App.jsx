import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import SearchForm from './components/SearchForm.jsx';
import DestinationCard from './components/DestinationCard.jsx';
import FlightResults from './components/FlightResults.jsx';
import Layout from './components/Layout.jsx';

// Sample destination data
const popularDestinations = [
  {
    id: 1,
    name: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
    price: 5500,
    currency: '₹',
    timeframe: 'round trip'
  },
  {
    id: 2,
    name: 'Mumbai',
    image: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7',
    price: 3200,
    currency: '₹',
    timeframe: 'round trip'
  },
  {
    id: 3,
    name: 'Delhi',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5',
    price: 4100,
    currency: '₹',
    timeframe: 'round trip'
  }
];

// Home page content
function HomePage() {
  const navigate = useNavigate();
  
  const handleSearch = (params) => {
    // Navigate to flight results page with search params
    const searchQueryString = new URLSearchParams({
      from: params.from,
      to: params.to,
      departure: params.departure,
      return: params.return || '',
      passengers: params.passengers,
      cabinClass: params.cabinClass,
      tripType: params.tripType
    }).toString();
    
    navigate(`/flight-results?${searchQueryString}`);
  };
  
  return (
    <div>
      <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Find your perfect flight</h2>
        <SearchForm onSearch={handleSearch} />
      </div>
      
      {/* Popular Destinations */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Popular destinations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {popularDestinations.map(destination => (
            <DestinationCard key={destination.id} destination={destination} />
          ))}
        </div>
      </section>
    </div>
  );
}

// Results page that takes search params from URL
function FlightResultsPage() {
  const [searchParams, setSearchParams] = useState(null);
  
  // Extract search params from URL on component mount
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {
      from: urlParams.get('from'),
      to: urlParams.get('to'),
      departure: urlParams.get('departure'),
      return: urlParams.get('return'),
      passengers: parseInt(urlParams.get('passengers')),
      cabinClass: urlParams.get('cabinClass'),
      tripType: urlParams.get('tripType')
    };
    
    setSearchParams(params);
  }, []);
  
  return (
    <div>
      {searchParams ? (
        <FlightResults searchParams={searchParams} />
      ) : (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0770e3]"></div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="flight-results" element={<FlightResultsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
