import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import API from '../api/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /* ================= REAL NOTIFICATION COUNT ================= */
  useEffect(() => {
    if (user?.role === 'provider') {
      API.get('/appointments/provider')
        .then((res) => {
          const pending = res.data.filter(
            (a) => a.status === 'pending'
          );
          setNotificationCount(pending.length);
        })
        .catch(() => setNotificationCount(0));
    }
  }, [user]);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">

          {/* LOGO */}
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

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {user ? (
              <>
                {/* USER LINKS */}
                {user.role !== 'provider' && (
                  <>
                    <Link
                      to="/book"
                      className="text-gray-600 hover:text-black"
                    >
                      Book Service
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="text-gray-600 hover:text-black"
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {/* PROVIDER LINKS */}
                {user.role === 'provider' && (
                  <div className="flex items-center gap-6 pl-6 border-l">
                    <Link
                      to="/provider/dashboard"
                      className="text-gray-600 hover:text-blue-600"
                    >
                      Dashboard
                    </Link>

                    {/* 🔔 NOTIFICATION BELL */}
                    <Link
                      to="/provider/dashboard"
                      className="relative"
                    >
                      <svg
                        className="w-6 h-6 text-gray-600 hover:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0a3 3 0 11-6 0"
                        />
                      </svg>

                      {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full px-1.5">
                          {notificationCount}
                        </span>
                      )}
                    </Link>
                  </div>
                )}

                {/* PROFILE */}
                <div className="flex items-center gap-4 ml-4">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
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
                  className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden border-t bg-white px-6 py-4 space-y-4 text-sm">
          {user ? (
            <>
              {user.role !== 'provider' && (
                <>
                  <Link to="/book" onClick={() => setMenuOpen(false)}>
                    Book Service
                  </Link>
                  <Link to="/my-bookings" onClick={() => setMenuOpen(false)}>
                    My Bookings
                  </Link>
                </>
              )}

              {user.role === 'provider' && (
                <>
                  <Link
                    to="/provider/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/provider/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    Notifications ({notificationCount})
                  </Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="block text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
