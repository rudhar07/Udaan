# Udaan - Travel Booking Platform

A comprehensive travel platform built with React, allowing users to search for flights, hotels, view detailed information, and save favorites. Compare prices across multiple booking systems to find the best deals.

## Features

- **Flight Search**: Search for flights with customizable parameters (origin, destination, dates, passengers, cabin class)
- **Flight Results**: View and filter flight results with sorting options
- **Hotel Price Comparison**: Compare hotel prices across 70+ booking systems to find the best deals
- **Hotel Search**: Search for hotels with customizable parameters (location, dates, guests, rooms)
- **Favorites**: Save and manage favorite flights and hotels
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable viewing in any environment
- **User-friendly Interface**: Modern UI with responsive design
- **Price Alerts**: Get notified when prices change for your saved searches
- **Well-structured Codebase**: Modular components and clean architecture

## Technology Stack

- **Frontend**: React.js with Functional Components and Hooks
- **State Management**: React Context API
- **Routing**: React Router
- **UI Framework**: Tailwind CSS
- **Theming**: Dark mode support with Tailwind and CSS custom properties
- **API Integration**: 
  - Amadeus API for flights (with fallback to mock data)
  - Hotellook API for hotel price comparison
- **Environment Variables**: Vite environment variables

## Project Structure

```
udaan/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context providers
│   │   ├── ThemeContext.jsx # Theme management context
│   │   └── ...              # Other contexts
│   ├── pages/           # Page components
│   │   ├── FavoritesPage.jsx         # Saved favorites
│   │   ├── FlightInspirationPage.jsx # Flight inspiration
│   │   ├── HotelBookingPage.jsx      # Hotel booking and comparison
│   │   └── ...                       # Other pages
│   ├── services/        # API services
│   │   ├── amadeus.js   # Flight search service
│   │   ├── hotels.js    # Hotel price comparison service
│   │   └── ...          # Other services
│   ├── App.jsx          # Main App component with routing
│   └── main.jsx         # Application entry point
├── .env                 # Environment variables
├── .gitignore           # Git ignore file
├── package.json         # Project dependencies
├── README.md            # Project documentation
└── vite.config.js       # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/udaan.git
   cd udaan
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   # Amadeus API for Flights
   VITE_AMADEUS_API_KEY=your_api_key_here
   VITE_AMADEUS_API_SECRET=your_api_secret_here
   VITE_AMADEUS_API_URL=https://test.api.amadeus.com/v1
   
   # Hotellook API for Hotel Comparison
   VITE_HOTELLOOK_API_TOKEN=your_token_here
   VITE_HOTELLOOK_PARTNER_ID=your_partner_id_here
   
   # App Configuration
   VITE_APP_NAME=Udaan
   VITE_APP_DESCRIPTION=Your one-stop solution for travel bookings
   VITE_APP_VERSION=1.0.0
   
   # Feature Flags
   VITE_ENABLE_MOCK_DATA=false
   VITE_ENABLE_ANALYTICS=false
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

1. **Flight Booking**:
   - Enter origin, destination, dates, and other parameters on the home page
   - Browse through flight results, sort and filter based on preferences
   - View detailed flight information including layovers, amenities, and pricing

2. **Hotel Booking**:
   - Navigate to the Hotels page
   - Enter location, check-in/check-out dates, and number of guests
   - Browse hotel results with price comparisons from multiple booking sites
   - View detailed hotel information including amenities, reviews, and room options
   - Click "Compare Prices" to see the best deals from various booking platforms

3. **Favorites**:
   - Click the heart icon on any flight or hotel card to save it to favorites
   - Navigate to the favorites page to view and manage saved items

4. **Theme Toggle**:
   - Click the sun/moon icon in the header to switch between light and dark modes
   - The app remembers your preference for future visits
   - If no preference is set, the app defaults to your system's theme preference

## Hotel Price Comparison

The hotel price comparison feature allows users to:

- Compare prices for the same hotel across multiple booking platforms
- Save up to 60% by finding the best available deals
- See verified reviews aggregated from multiple sources
- Filter hotels by price, star rating, amenities, and more
- View transparent pricing with no hidden fees

## Environment Variables

- `VITE_AMADEUS_API_KEY`: API key for Amadeus
- `VITE_AMADEUS_API_SECRET`: API secret for Amadeus
- `VITE_AMADEUS_API_URL`: Base URL for Amadeus API
- `VITE_HOTELLOOK_API_TOKEN`: API token for Hotellook
- `VITE_HOTELLOOK_PARTNER_ID`: Partner ID for Hotellook
- `VITE_APP_NAME`: Application name
- `VITE_APP_DESCRIPTION`: Application description
- `VITE_APP_VERSION`: Application version
- `VITE_ENABLE_MOCK_DATA`: Toggle for using mock data instead of real API
- `VITE_ENABLE_ANALYTICS`: Toggle for analytics integration
