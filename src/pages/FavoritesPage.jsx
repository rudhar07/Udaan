import { useFlightContext } from '../context/FlightContext';
import { useAuth } from '../context/AuthContext';
import FlightCard from '../components/FlightCard.jsx';

/**
 * FavoritesPage - Displays user's favorite flights
 * 
 * Uses FlightContext to retrieve and manage favorites
 */
function FavoritesPage() {
  const { favorites, removeFromFavorites, loadingFavorites } = useFlightContext();
  const { currentUser, login } = useAuth();

  
  const handleSignIn = () => {
    login();
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-700 to-blue-600 text-white rounded-xl p-6 mb-6 shadow-lg">
        <h1 className="text-2xl font-bold">Your Favorite Flights</h1>
        {currentUser && (
          <p className="text-indigo-100 mt-1">
            {favorites.length} {favorites.length === 1 ? 'flight' : 'flights'} saved
          </p>
        )}
      </div>

      {/* Content */}
      {!currentUser ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-500 mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Sign in to view favorites</h2>
          <p className="text-slate-600 mb-6">
            Please sign in with your Google account to save and view your favorite flights across devices.
          </p>
          <button 
            onClick={handleSignIn}
            className="inline-flex items-center justify-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="#FFF"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      ) : loadingFavorites ? (
        <div className="bg-white rounded-xl shadow-md p-10 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 animate-pulse">Loading your favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="space-y-6">
          {favorites.map(flight => (
            <div key={flight.id} className="relative">
              <FlightCard flight={flight} />
              <button 
                onClick={() => removeFromFavorites(flight.id)}
                className="absolute top-3 right-3 bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-full"
                aria-label="Remove from favorites"
                title="Remove from favorites"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-500 mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">No favorites yet</h2>
          <p className="text-slate-600 mb-6">
            When you find flights you like, save them here for easy comparison.
          </p>
          <a 
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
            Search for flights
          </a>
        </div>
      )}
    </div>
  );
}

export default FavoritesPage; 