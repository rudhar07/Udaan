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
    <div className="bg-white rounded-lg">
      {/* Trip Type Toggle */}
      <div className="flex mb-4 border-b">
        <button
          type="button"
          onClick={() => handleTripTypeChange("return")}
          className={`py-2 px-4 font-medium ${
            tripType === "return"
              ? "text-[#0770e3] border-b-2 border-[#0770e3]"
              : "text-gray-500"
          }`}
        >
          Return
        </button>
        <button
          type="button"
          onClick={() => handleTripTypeChange("oneway")}
          className={`py-2 px-4 font-medium ${
            tripType === "oneway"
              ? "text-[#0770e3] border-b-2 border-[#0770e3]"
              : "text-gray-500"
          }`}
        >
          One way
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
            <input 
              name="from" 
              value={formData.from} 
              onChange={handleChange} 
              placeholder="Airport code (e.g., DEL)" 
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3] pl-10 ${
                errors.from ? "border-red-500" : ""
              }`}
            />
            <span className="absolute left-3 top-8 text-gray-400">🛫</span>
            {errors.from && <p className="text-red-500 text-xs mt-1">{errors.from}</p>}
          </div>
          
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
            <input 
              name="to" 
              value={formData.to} 
              onChange={handleChange} 
              placeholder="Airport code (e.g., BOM)" 
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3] pl-10 ${
                errors.to ? "border-red-500" : ""
              }`}
            />
            <span className="absolute left-3 top-8 text-gray-400">🛬</span>
            {errors.to && <p className="text-red-500 text-xs mt-1">{errors.to}</p>}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Departure date</label>
            <input 
              type="date" 
              name="departure" 
              value={formData.departure} 
              onChange={handleChange} 
              className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3] ${
                errors.departure ? "border-red-500" : ""
              }`}
            />
            {errors.departure && <p className="text-red-500 text-xs mt-1">{errors.departure}</p>}
          </div>
          
          {tripType === "return" && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Return date</label>
              <input 
                type="date" 
                name="return" 
                value={formData.return} 
                onChange={handleChange}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3] ${
                  errors.return ? "border-red-500" : ""
                }`}
              />
              {errors.return && <p className="text-red-500 text-xs mt-1">{errors.return}</p>}
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cabin class</label>
            <select 
              name="cabinClass" 
              value={formData.cabinClass} 
              onChange={handleChange}
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]"
            >
              <option value="economy">Economy</option>
              <option value="premium">Premium Economy</option>
              <option value="business">Business Class</option>
              <option value="first">First Class</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Passengers</label>
            <input 
              type="number" 
              name="passengers" 
              value={formData.passengers} 
              onChange={handleChange} 
              min="1"
              max="9" 
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#0770e3]" 
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-[#0770e3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-200"
        >
          Search flights
        </button>
      </form>
    </div>
  );
}

export default SearchForm;
