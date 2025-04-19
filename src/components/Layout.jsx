import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-5 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3 transition hover:scale-105">
            <span className="text-3xl">✈️</span>
            <h1 className="text-2xl font-bold tracking-tight">Udaan</h1>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="py-2 px-4 rounded-full hover:bg-white/20 transition-all font-medium">Flights</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white/10 hover:bg-white/20 py-2 px-5 rounded-full text-sm font-medium transition-all">Sign In</button>
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
                <span className="text-2xl mr-2">✈️</span> Udaan
              </h3>
              <p className="text-slate-300">Your one-stop solution for flight bookings with the best prices guaranteed.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-5 border-b border-indigo-600 pb-2 inline-block">Services</h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-slate-300 hover:text-white flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                  Flight Search
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
            <p className="text-center text-slate-400">&copy; {new Date().getFullYear()} Udaan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 