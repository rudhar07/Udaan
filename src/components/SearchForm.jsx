import { useState } from "react";

function SearchForm({ onSearch }) {
  const [tripType, setTripType] = useState("return"); // "return" or "oneway"
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    departure: "",
    return: "",
    passengers: 1,
    cabinClass: "economy",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleTripTypeChange = (type) => {
    setTripType(type);
    if (type === "oneway") {
      setFormData((prev) => ({ ...prev, return: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate origin/destination fields (must be 3-letter IATA airport codes)
    if (!formData.from) {
      newErrors.from = "Origin is required";
    } else if (!/^[A-Z]{3}$/.test(formData.from.toUpperCase())) {
      newErrors.from = "Please enter a valid 3-letter airport code (e.g. DEL, BOM)";
    }
    
    if (!formData.to) {
      newErrors.to = "Destination is required";
    } else if (!/^[A-Z]{3}$/.test(formData.to.toUpperCase())) {
      newErrors.to = "Please enter a valid 3-letter airport code (e.g. DEL, BOM)";
    }
    
    if (formData.from && formData.to && formData.from.toUpperCase() === formData.to.toUpperCase()) {
      newErrors.to = "Origin and destination cannot be the same";
    }
    
    // Validate departure date
    if (!formData.departure) {
      newErrors.departure = "Departure date is required";
    }
    
    // Validate return date for round trips
    if (tripType === "return" && !formData.return) {
      newErrors.return = "Return date is required for round trips";
    }
    
    // Validate that return date is after departure date
    if (formData.departure && formData.return && tripType === "return") {
      const departureDate = new Date(formData.departure);
      const returnDate = new Date(formData.return);
      
      if (returnDate < departureDate) {
        newErrors.return = "Return date must be after departure date";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Format the data for API
    const searchData = {
      ...formData,
      tripType,
      from: formData.from.toUpperCase(),
      to: formData.to.toUpperCase(),
    };
    
    console.log("Searching flights with:", searchData);
    
    // Call the onSearch prop if provided
    if (onSearch) {
      onSearch(searchData);
    }
  };

  return (
    <div className="bg-white rounded-xl">
      {/* Trip Type Toggle */}
      <div className="flex mb-6 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => handleTripTypeChange("return")}
          className={`py-2 px-6 font-medium rounded-lg transition-all duration-300 ${
            tripType === "return"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          Return
        </button>
        <button
          type="button"
          onClick={() => handleTripTypeChange("oneway")}
          className={`py-2 px-6 font-medium rounded-lg transition-all duration-300 ${
            tripType === "oneway"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-200"
          }`}
        >
          One way
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-700 mb-1">From</label>
            <div className="relative">
              <input 
                name="from" 
                value={formData.from} 
                onChange={handleChange} 
                placeholder="Airport code (e.g., DEL)" 
                className={`w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.from ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                } group-hover:border-indigo-300`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </span>
            </div>
            {errors.from && <p className="text-red-600 text-xs mt-1 animate-pulse">{errors.from}</p>}
          </div>
          
          <div className="relative group">
            <label className="block text-xs font-medium text-slate-700 mb-1">To</label>
            <div className="relative">
              <input 
                name="to" 
                value={formData.to} 
                onChange={handleChange} 
                placeholder="Airport code (e.g., BOM)" 
                className={`w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.to ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                } group-hover:border-indigo-300`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </span>
            </div>
            {errors.to && <p className="text-red-600 text-xs mt-1 animate-pulse">{errors.to}</p>}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-xs font-medium text-slate-700 mb-1">Departure date</label>
            <div className="relative">
              <input 
                type="date" 
                name="departure" 
                value={formData.departure} 
                onChange={handleChange} 
                className={`w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                  errors.departure ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                } group-hover:border-indigo-300`}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
              </span>
            </div>
            {errors.departure && <p className="text-red-600 text-xs mt-1 animate-pulse">{errors.departure}</p>}
          </div>
          
          {tripType === "return" && (
            <div className="group">
              <label className="block text-xs font-medium text-slate-700 mb-1">Return date</label>
              <div className="relative">
                <input 
                  type="date" 
                  name="return" 
                  value={formData.return} 
                  onChange={handleChange}
                  className={`w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                    errors.return ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
                  } group-hover:border-indigo-300`}
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </span>
              </div>
              {errors.return && <p className="text-red-600 text-xs mt-1 animate-pulse">{errors.return}</p>}
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-xs font-medium text-slate-700 mb-1">Cabin class</label>
            <div className="relative">
              <select 
                name="cabinClass" 
                value={formData.cabinClass} 
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all group-hover:border-indigo-300"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business Class</option>
                <option value="first">First Class</option>
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                </svg>
              </span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </span>
            </div>
          </div>
          
          <div className="group">
            <label className="block text-xs font-medium text-slate-700 mb-1">Passengers</label>
            <div className="relative">
              <input 
                type="number" 
                name="passengers" 
                value={formData.passengers} 
                onChange={handleChange} 
                min="1"
                max="9" 
                className="w-full p-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all group-hover:border-indigo-300"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <div className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"></path>
            </svg>
            Search flights
          </div>
        </button>

        <div className="text-center text-sm text-slate-500 mt-4">
          Popular destinations: DEL, BOM, GOI, BLR, CCU, HYD
        </div>
      </form>
    </div>
  );
}

export default SearchForm;
