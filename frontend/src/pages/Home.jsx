import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  // Guest View (Landing Page)
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-8">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Trusted by 10,000+ users
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-7xl mb-6">
                Quality Services,
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  On Demand
                </span>
              </h1>
              
              <p className="mt-6 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
                Book trusted professionals for medical consultations, salon services, and car rentals. 
                Experience seamless booking with verified providers at your fingertips.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg hover:bg-indigo-700 transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5"
                >
                  Get Started Free
                  <span>→</span>
                </Link>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-gray-900 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
                >
                  Sign In
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose from a wide range of professional services tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Medical */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg">
                  🏥
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Medical Services</h3>
                <p className="text-gray-600 mb-4">
                  Book appointments with verified doctors and specialists. Online consultations and in-person visits available.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>General Practitioners</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Specialists</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Video Consultations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Salon */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg">
                  💇
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Salon & Beauty</h3>
                <p className="text-gray-600 mb-4">
                  Professional salon services for men and women. Book your favorite stylist with ease.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Haircuts & Styling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Spa Treatments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    <span>Beauty Services</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Car Rental */}
            <div className="group relative bg-white p-8 rounded-2xl shadow-sm border-2 border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-bl-full opacity-50"></div>
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-3xl mb-5 shadow-lg">
                  🚗
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Car Rentals</h3>
                <p className="text-gray-600 mb-4">
                  Rent vehicles for your travel needs. Wide range of cars available with flexible booking.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Sedans & SUVs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Flexible Duration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    <span>Well-Maintained Fleet</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
              <p className="text-gray-600">Simple steps to book your service</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Choose Service</h3>
                <p className="text-gray-600">Browse and select from our wide range of professional services</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Pick Time Slot</h3>
                <p className="text-gray-600">Select your preferred date and time from available slots</p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Service</h3>
                <p className="text-gray-600">Receive confirmation and enjoy your scheduled service</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their service needs
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-600 shadow-xl hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              Create Free Account
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center text-gray-400 text-sm">
              <p>© 2024 ServiceHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged In View
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-lg text-gray-600">What would you like to do today?</p>
        </header>

        {user.role === 'provider' ? (
          /* Provider Dashboard Shortcuts */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              to="/provider/dashboard" 
              className="group block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-indigo-300"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-5 text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                📊
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                Dashboard
              </h2>
              <p className="text-gray-600 text-sm">
                View stats, manage bookings and handle appointment requests
              </p>
            </Link>

            <Link 
              to="/provider/add-service" 
              className="group block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-green-300"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-5 text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                +
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors mb-2">
                Add Service
              </h2>
              <p className="text-gray-600 text-sm">
                List new medical, salon, or rental services for customers
              </p>
            </Link>

            <Link 
              to="/provider/schedule" 
              className="group block p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-purple-300"
            >
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-5 text-white text-2xl font-bold shadow-md group-hover:scale-110 transition-transform">
                📅
              </div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                Schedule
              </h2>
              <p className="text-gray-600 text-sm">
                Update your availability and manage working hours
              </p>
            </Link>
          </div>
        ) : (
          /* Patient/User Shortcuts */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Link 
              to="/book" 
              className="group block p-10 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-indigo-300 hover:-translate-y-1"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-5 text-white text-3xl font-bold shadow-md group-hover:scale-110 transition-transform">
                📍
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3">
                Book a Service
              </h2>
              <p className="text-gray-600">
                Find and book trusted doctors, stylists, or car rentals near you
              </p>
            </Link>

            <Link 
              to="/my-bookings" 
              className="group block p-10 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-200 border-2 border-gray-200 hover:border-indigo-300 hover:-translate-y-1"
            >
              <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-5 text-white text-3xl font-bold shadow-md group-hover:scale-110 transition-transform">
                📅
              </div>
              <h2 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-3">
                My Appointments
              </h2>
              <p className="text-gray-600">
                View your booking history and upcoming scheduled services
              </p>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;