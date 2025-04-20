import { Link, Outlet } from 'react-router-dom';
import { useFlightContext } from '../context/FlightContext';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

/**
 * Layout - Main layout component for the application
 * Includes header, navigation, main content area, and footer
 */
function Layout() {
  const { favorites } = useFlightContext();
  const { currentUser, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // App name from environment variables
  const appName = import.meta.env.VITE_APP_NAME || 'Udaan';

  // Handle clicks outside of the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle Google sign in
  const handleSignIn = () => {
    login();
  };

  // Handle sign out
  const handleSignOut = () => {
    logout();
    setDropdownOpen(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 transition hover:scale-105">
            <span className="text-3xl">✈️</span>
            <h1 className="text-2xl font-bold tracking-tight">{appName}</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="py-2 px-4 rounded-full hover:bg-white/20 transition-all font-medium">Flights</Link>
            <Link to="/hotels" className="py-2 px-4 rounded-full hover:bg-white/20 transition-all font-medium">Hotels</Link>
            <Link to="/favorites" className="py-2 px-4 rounded-full hover:bg-white/20 transition-all font-medium flex items-center">
              Favorites
              {favorites.length > 0 && (
                <span className="ml-2 bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 py-1 pl-1 pr-3 rounded-full transition-all"
                >
                  <img 
                    src={currentUser.photoURL} 
                    alt={currentUser.displayName} 
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="font-medium text-sm">{currentUser.displayName?.split(' ')[0]}</span>
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{currentUser.displayName}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 py-2 px-5 rounded-full text-sm font-medium transition-all"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero Section with Background Image */}
      <div className="relative bg-cover bg-center h-64 overflow-hidden" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 to-black/50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-4xl md:text-5xl font-bold tracking-tight text-center drop-shadow-lg">
            Discover the World <br />
            <span className="text-2xl md:text-3xl font-light">One Flight at a Time</span>
          </h2>
        </div>
      </div>
      
      {/* Main Content with Negative Margin for Overlap */}
      <main className="max-w-7xl mx-auto p-4 relative -mt-16">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white mt-12 py-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <h3 className="text-xl font-semibold mb-5 flex items-center">
                <span className="text-2xl mr-2">✈️</span> {appName}
              </h3>
              <p className="text-slate-300">Your one-stop solution for flight bookings with the best prices guaranteed.</p>
              <p className="text-xs text-slate-400 mt-2">Version: {import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-5 border-b border-indigo-600 pb-2 inline-block">Services</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                  Flight Search
                </Link></li>
                <li><Link to="/hotels" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                  Hotel Booking
                </Link></li>
                <li><Link to="/favorites" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                  Favorite Flights
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-5 border-b border-indigo-600 pb-2 inline-block">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
                  Help Center
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                  Contact Us
                </a></li>
                <li><a href="#" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                  FAQs
                </a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8">
            <p className="text-center text-slate-400">&copy; {new Date().getFullYear()} {appName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 