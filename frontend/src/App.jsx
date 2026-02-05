import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Booking from './pages/patient/Booking';
import MyBookings from './pages/patient/MyBookings';

import Dashboard from './pages/provider/Dashboard';
import ScheduleManager from './pages/provider/ScheduleManager';
import AddService from './pages/provider/AddService';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />

        <Route
          path="/book"
          element={user ? <Booking /> : <Navigate to="/login" />}
        />

        <Route
          path="/my-bookings"
          element={user ? <MyBookings /> : <Navigate to="/login" />}
        />

        <Route
          path="/provider/dashboard"
          element={
            user?.role === 'provider' ? (
              <Dashboard />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/provider/add-service"
          element={
            user?.role === 'provider' ? (
              <AddService />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/provider/schedule"
          element={
            user?.role === 'provider' ? (
              <ScheduleManager />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;
