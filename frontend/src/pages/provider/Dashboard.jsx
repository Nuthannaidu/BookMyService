import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      API.get('/appointments/provider'),
      API.get(`/services/${user._id}`),
    ])
      .then(([aRes, sRes]) => {
        setAppointments(aRes.data);
        setServices(sRes.data);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  const updateStatus = async (id, status) => {
    const { data } = await API.patch(`/appointments/${id}/status`, { status });
    setAppointments((prev) =>
      prev.map((a) => (a._id === id ? data : a))
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pending = appointments.filter((a) => a.status === 'pending');
  const accepted = appointments.filter((a) => a.status === 'accepted');
  const completed = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Provider'}
            </h1>
            <p className="text-gray-600">Manage your services and appointments</p>
          </div>
          
          {/* QUICK ACTIONS - Desktop */}
          <div className="hidden md:flex gap-3">
            <Link
              to="/provider/add-service"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <span className="text-xl">+</span>
              <span>Add Service</span>
            </Link>

            <Link
              to="/provider/schedule"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
            >
              <span className="text-xl">📅</span>
              <span>Manage Schedule</span>
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">
                💼
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
            <p className="text-3xl font-bold text-gray-900">{services.length}</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                ✓
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completed.length}</p>
          </div>
        </div>

        {/* QUICK ACTIONS - Mobile */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          <Link
            to="/provider/add-service"
            className="flex flex-col items-center justify-center gap-2 bg-indigo-600 text-white p-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200 shadow-lg"
          >
            <span className="text-2xl">+</span>
            <span className="text-sm">Add Service</span>
          </Link>

          <Link
            to="/provider/schedule"
            className="flex flex-col items-center justify-center gap-2 bg-white text-gray-700 border-2 border-gray-200 p-4 rounded-xl font-semibold hover:border-indigo-300 transition-all duration-200"
          >
            <span className="text-2xl">📅</span>
            <span className="text-sm">Schedule</span>
          </Link>
        </div>

        {/* PENDING REQUESTS */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
            {pending.length > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-bold">
                {pending.length} New
              </span>
            )}
          </div>

          {pending.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-3">✅</div>
              <p className="text-gray-600 font-medium">All caught up!</p>
              <p className="text-sm text-gray-500 mt-1">No pending requests at the moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((a) => (
                <div
                  key={a._id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {a.service?.name}
                        </h3>
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-bold uppercase">
                          New
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">👤</span>
                          <span className="font-medium">{a.user?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">📅</span>
                          <span>{a.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">⏰</span>
                          <span>{a.startTime}–{a.endTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => updateStatus(a._id, 'accepted')}
                        className="flex-1 lg:flex-initial bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => updateStatus(a._id, 'rejected')}
                        className="flex-1 lg:flex-initial bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY SERVICES */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
            <Link
              to="/provider/add-service"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
            >
              <span>+</span>
              <span>Add New</span>
            </Link>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-900 font-semibold mb-2">No services yet</p>
              <p className="text-sm text-gray-500 mb-4">Get started by adding your first service</p>
              <Link
                to="/provider/add-service"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all duration-200"
              >
                <span>+</span>
                <span>Add Service</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <div
                  key={s._id}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                        {s.name}
                      </h3>
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase">
                        {s.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span>⏱</span>
                        <span className="font-medium">{s.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>💰</span>
                        <span className="font-bold text-gray-900">₹{s.price}</span>
                      </div>
                    </div>

                    <Link
                      to="/provider/schedule"
                      className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-semibold mt-2 group-hover:gap-2 transition-all"
                    >
                      <span>Set Schedule</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;