// import React, { useState } from 'react';
// import axios from 'axios';

// const FlightSearch = ({ onSearch }) => {
//     const [from, setFrom] = useState('');
//     const [to, setTo] = useState('');
//     const [date, setDate] = useState('');

//     const handleSearch = async () => {
//         const response = await axios.get(`https://api.travelpayouts.com/v2/prices/latest`, {
//             params: {
//                 token: 'YOUR_API_KEY',
//                 origin: from,
//                 destination: to,
//                 departure_date: date,
//             },
//         });
//         onSearch(response.data);
//     };

//     return (
//         <div>
//             <input
//                 type="text"
//                 placeholder="From (e.g., JFK)"
//                 value={from}
//                 onChange={(e) => setFrom(e.target.value)}
//             />
//             <input
//                 type="text"
//                 placeholder="To (e.g., LAX)"
//                 value={to}
//                 onChange={(e) => setTo(e.target.value)}
//             />
//             <input
//                 type="date"
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//             />
//             <button onClick={handleSearch}>Search Flights</button>
//         </div>
//     );
// };

// export default FlightSearch;

//  yaha 
