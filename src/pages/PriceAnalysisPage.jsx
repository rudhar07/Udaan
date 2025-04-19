import { useState } from 'react';
import amadeusService from '../services/amadeus';

function PriceAnalysisPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [priceAnalysis, setPriceAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!origin || !destination || !departureDate) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await amadeusService.getFlightPriceAnalysis(
        origin.toUpperCase(),
        destination.toUpperCase(),
        departureDate
      );
      
      setPriceAnalysis(results);
    } catch (err) {
      console.error('Error getting price analysis:', err);
      setError(err.message || 'Failed to get price analysis. Please try again.');
      setPriceAnalysis(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Popular routes for price analysis
  const popularRoutes = [
    { from: 'DEL', to: 'BOM', label: 'Delhi to Mumbai' },
    { from: 'BLR', to: 'DEL', label: 'Bangalore to Delhi' },
    { from: 'DEL', to: 'BLR', label: 'Delhi to Bangalore' },
    { from: 'BOM', to: 'GOI', label: 'Mumbai to Goa' },
    { from: 'DEL', to: 'COK', label: 'Delhi to Kochi' }
  ];
  
  // Format price as INR
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };
  
  // Calculate if the current price is a good deal
  const getPricingAdvice = () => {
    if (!priceAnalysis) return null;
    
    const { lowestPrice, medianPrice, highestPrice } = priceAnalysis;
    const priceDifference = medianPrice - lowestPrice;
    const percentageDifference = (priceDifference / medianPrice) * 100;
    
    if (percentageDifference >= 30) {
      return {
        message: 'This is a great deal! The price is significantly lower than usual.',
        color: 'text-green-600'
      };
    } else if (percentageDifference >= 15) {
      return {
        message: 'This is a good deal. The price is better than average.',
        color: 'text-green-500'
      };
    } else if (percentageDifference > 0) {
      return {
        message: 'This price is below average, but not by much.',
        color: 'text-blue-500'
      };
    } else if (percentageDifference === 0) {
      return {
        message: 'This price is average for this route.',
        color: 'text-gray-600'
      };
    } else {
      return {
        message: 'This price is higher than average. You might want to wait for a better deal.',
        color: 'text-red-500'
      };
    }
  };
  
  const advice = getPricingAdvice();
  
  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold mb-6">Flight Price Analysis</h1>
        <p className="text-gray-600 mb-6">
          Find out if you're getting a good deal on your flight. Enter your route and travel date to see how current prices compare to historical data.
        </p>
        
        <form onSubmit={handleAnalyze} className="max-w-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Origin <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                placeholder="e.g. DEL, BOM"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                maxLength={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. BOM, DEL"
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
                maxLength={3}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Departure Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#0770e3] text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Analyze Prices'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Try popular routes:</h2>
          <div className="flex flex-wrap gap-2">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setOrigin(route.from);
                  setDestination(route.to);
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-1 px-3 rounded-full transition duration-200"
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {priceAnalysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Price Analysis: {origin.toUpperCase()} to {destination.toUpperCase()}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-green-700 mb-1">Lowest Price</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(priceAnalysis.lowestPrice)}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-blue-700 mb-1">Median Price</p>
              <p className="text-2xl font-bold text-blue-600">{formatPrice(priceAnalysis.medianPrice)}</p>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-sm font-medium text-red-700 mb-1">Highest Price</p>
              <p className="text-2xl font-bold text-red-600">{formatPrice(priceAnalysis.highestPrice)}</p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold mb-2">Should you book now?</h3>
            {advice && (
              <p className={`${advice.color} font-medium`}>{advice.message}</p>
            )}
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold mb-4">Price Range Visualization</h3>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div 
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ 
                  width: `${(priceAnalysis.lowestPrice / priceAnalysis.highestPrice) * 100}%` 
                }}
              ></div>
              <div 
                className="absolute top-0 h-full w-1 bg-black"
                style={{ 
                  left: `${(priceAnalysis.medianPrice / priceAnalysis.highestPrice) * 100}%` 
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatPrice(priceAnalysis.lowestPrice)}</span>
              <span>{formatPrice(priceAnalysis.medianPrice)}</span>
              <span>{formatPrice(priceAnalysis.highestPrice)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PriceAnalysisPage; 