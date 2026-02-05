import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-2xl font-extrabold tracking-tight text-black">
              BookMy<span className="text-blue-600">Services</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-8 text-sm font-medium">
            {user ? (
              <>
                {/* USER LINKS (only if NOT provider) */}
                {user.role !== 'provider' && (
                  <>
                    <Link
                      to="/book"
                      className="text-gray-600 hover:text-black transition-colors"
                    >
                      Book Service
                    </Link>

                    <Link
                      to="/my-bookings"
                      className="text-gray-600 hover:text-black transition-colors"
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {/* PROVIDER LINKS */}
                {user.role === 'provider' && (
                  <div className="flex items-center gap-6 pl-6 border-l border-gray-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Provider Mode
                    </span>
                    <Link
                      to="/provider/dashboard"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                  </div>
                )}

                {/* USER PROFILE + LOGOUT */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-gray-900 hover:text-blue-600 font-semibold px-4"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                >
                  Register / Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;