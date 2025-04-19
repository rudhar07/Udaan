import { Link, Outlet } from 'react-router-dom';

function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#0770e3] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">Udaan</h1>
            <span className="text-sm">✈️</span>
          </Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:underline font-medium">Flights</Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-sm hover:underline">Sign In</button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-12 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Udaan</h3>
              <p className="text-sm text-gray-300">Your one-stop solution for flight bookings.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-sm text-gray-300 hover:text-white">Flight Search</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-300 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-sm text-gray-300 hover:text-white">FAQs</a></li>
                <li><a href="#" className="text-sm text-gray-300 hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-sm text-gray-300">© {new Date().getFullYear()} Udaan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout; 