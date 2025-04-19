import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import SearchForm from './components/SearchForm.jsx';
import DestinationCard from './components/DestinationCard.jsx';
import FlightResults from './components/FlightResults.jsx';
import Layout from './components/Layout.jsx';
import FlightInspirationPage from './pages/FlightInspirationPage.jsx';
import HotelSearchPage from './pages/HotelSearchPage.jsx';
import PointsOfInterestPage from './pages/PointsOfInterestPage.jsx';
import PriceAnalysisPage from './pages/PriceAnalysisPage.jsx';
import AirlineRoutesPage from './pages/AirlineRoutesPage.jsx';

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
  const [searchParams, setSearchParams] = useState(null);
  const [showResults, setShowResults] = useState(false);
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
        <h2 className="text-xl font-semibold mb-6">Find your perfect trip</h2>
        <SearchForm onSearch={handleSearch} />
      </div>
      
      {/* Featured Services */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold mb-6">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <h3 className="text-lg font-semibold mb-2">Flight Inspiration</h3>
            <p className="text-gray-600 mb-4">Discover where you can fly to from your location.</p>
            <Link to="/flight-inspiration" className="text-[#0770e3] font-medium hover:underline">Explore destinations</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <h3 className="text-lg font-semibold mb-2">Hotel Search</h3>
            <p className="text-gray-600 mb-4">Find the perfect accommodation for your trip.</p>
            <Link to="/hotels" className="text-[#0770e3] font-medium hover:underline">Search hotels</Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200">
            <h3 className="text-lg font-semibold mb-2">Price Analysis</h3>
            <p className="text-gray-600 mb-4">Analyze flight prices and find the best time to book.</p>
            <Link to="/price-analysis" className="text-[#0770e3] font-medium hover:underline">Check prices</Link>
          </div>
        </div>
      </section>
      
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
          <Route path="flight-inspiration" element={<FlightInspirationPage />} />
          <Route path="hotels" element={<HotelSearchPage />} />
          <Route path="points-of-interest" element={<PointsOfInterestPage />} />
          <Route path="price-analysis" element={<PriceAnalysisPage />} />
          <Route path="airline-routes" element={<AirlineRoutesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
