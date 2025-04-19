# Udaan - Flight Booking Application

A modern flight search and booking application built with React, allowing users to search for flights, view detailed flight information, and save favorites.

## Features

- **Flight Search**: Search for flights with customizable parameters (origin, destination, dates, passengers, cabin class)
- **Flight Results**: View and filter flight results with sorting options
- **Favorites**: Save and manage favorite flights
- **User-friendly Interface**: Modern UI with responsive design
- **Well-structured Codebase**: Modular components and clean architecture

## Technology Stack

- **Frontend**: React.js with Functional Components and Hooks
- **State Management**: React Context API
- **Routing**: React Router
- **UI Framework**: Tailwind CSS
- **API Integration**: Amadeus API (with fallback to mock data)
- **Environment Variables**: Vite environment variables

## Project Structure

```
udaan/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context providers
│   ├── pages/           # Page components
│   ├── services/        # API services
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

3. Create a `.env` file in the root directory with your API keys (see `.env.example`):
   ```
   VITE_AMADEUS_API_KEY=your_api_key_here
   VITE_AMADEUS_API_SECRET=your_api_secret_here
   VITE_AMADEUS_API_URL=https://test.api.amadeus.com/v1
   VITE_APP_NAME=Udaan
   VITE_ENABLE_MOCK_DATA=true
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

1. **Search for Flights**: Enter origin, destination, dates, and other parameters on the home page
2. **View Results**: Browse through flight results, sort and filter based on preferences
3. **Save Favorites**: Click the heart icon on any flight card to save it to favorites
4. **View Favorites**: Navigate to the favorites page to view and manage saved flights

## Best Practices Implemented

- **Component Reusability**: Common UI elements are extracted into reusable components
- **Proper State Management**: Using Context API for global state
- **Environment Variables**: API keys and configuration stored in env variables
- **Form Validation**: Input validation with error messages
- **Responsive Design**: Mobile-first approach with Tailwind
- **Code Documentation**: JSDoc comments and well-structured code
- **Error Handling**: Proper error states and user feedback

## Environment Variables

- `VITE_AMADEUS_API_KEY`: API key for Amadeus
- `VITE_AMADEUS_API_SECRET`: API secret for Amadeus
- `VITE_AMADEUS_API_URL`: Base URL for Amadeus API
- `VITE_APP_NAME`: Application name
- `VITE_APP_DESCRIPTION`: Application description
- `VITE_APP_VERSION`: Application version
- `VITE_ENABLE_MOCK_DATA`: Toggle for using mock data instead of real API
