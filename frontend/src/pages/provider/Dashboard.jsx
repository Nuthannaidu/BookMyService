import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingService, setEditingService] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user._id]);

  const fetchData = () => {
    Promise.all([
      API.get('/appointments/provider'),
      API.get(`/services/${user._id}`),
    ])
      .then(([aRes, sRes]) => {
        setAppointments(aRes.data);
        setServices(sRes.data);
      })
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await API.patch(`/appointments/${id}/status`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? data : a))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  /* ================= DELETE LOGIC ================= */
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/services/${serviceId}`);
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
      alert('Service deleted successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to delete service. It might have active bookings.');
    }
  };

  /* ================= EDIT LOGIC ================= */
  const openEditModal = (service) => {
    setEditingService({ ...service }); // Create a copy to edit
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingService((prev) => ({ ...prev, [name]: value }));
  };

  // Keep this function if you ever want to re-enable editing in future, 
  // but for now, inputs using this will be read-only.
  const handleEditDetailsChange = (category, field, value) => {
    setEditingService((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [category]: {
          ...prev.details[category],
          [field]: value,
        },
      },
    }));
  };

  const saveEditedService = async (e) => {
    e.preventDefault();
    try {
      const { _id, name, category, duration, price, details } = editingService;
      
      const { data } = await API.put(`/services/${_id}`, {
        name,
        category,
        duration: Number(duration),
        price: Number(price),
        details
      });

      // Update local state
      setServices((prev) => prev.map((s) => (s._id === _id ? data : s)));
      setIsEditModalOpen(false);
      setEditingService(null);
      alert('Service updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update service');
    }
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
          
          <div className="flex gap-3">
            <Link
              to="/provider/add-service"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg"
            >
              <span className="text-xl">+</span>
              <span className="hidden sm:inline">Add Service</span>
            </Link>
            <Link
              to="/provider/schedule"
              className="inline-flex items-center gap-2 bg-white text-gray-700 border-2 border-gray-200 px-5 py-3 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <span className="text-xl">📅</span>
              <span className="hidden sm:inline">Schedule</span>
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl">💼</div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Services</p>
            <p className="text-3xl font-bold text-gray-900">{services.length}</p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">📊</div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>

          <div className="bg-white border-2 border-yellow-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">⏳</div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
            <p className="text-3xl font-bold text-yellow-600">{pending.length}</p>
          </div>

          <div className="bg-white border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">✓</div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">{completed.length}</p>
          </div>
        </div>

        {/* PENDING REQUESTS SECTION */}
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
            </div>
          ) : (
            <div className="space-y-4">
              {pending.map((a) => (
                <div key={a._id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg text-gray-900">{a.service?.name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>👤 {a.user?.name}</span>
                        <span>📅 {a.date}</span>
                        <span>⏰ {a.startTime}–{a.endTime}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => updateStatus(a._id, 'accepted')} className="bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-green-700">Accept</button>
                      <button onClick={() => updateStatus(a._id, 'rejected')} className="bg-red-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-red-700">Reject</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MY SERVICES SECTION */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Services</h2>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-900 font-semibold mb-2">No services yet</p>
              <Link to="/provider/add-service" className="text-indigo-600 font-bold hover:underline">Add your first service</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((s) => (
                <div key={s._id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all group flex flex-col h-full">
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-1">{s.name}</h3>
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-semibold uppercase">
                        {s.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>⏱ {s.duration} mins</span>
                      <span className="font-bold text-gray-900">💰 ₹{s.price}</span>
                    </div>
                  </div>

                  {/* EDIT & DELETE BUTTONS */}
                  <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => openEditModal(s)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteService(s._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* EDIT SERVICE MODAL */}
      {isEditModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Edit Service</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <form onSubmit={saveEditedService} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name (Read-Only)</label>
                <input
                  type="text"
                  name="name"
                  value={editingService.name}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none focus:ring-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={editingService.price}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    name="duration"
                    value={editingService.duration}
                    onChange={handleEditChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                    required
                  />
                </div>
              </div>

              {/* DYNAMIC DETAILS - READ ONLY */}
              {editingService.details && editingService.details[editingService.category] && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <h4 className="text-xs font-bold text-gray-500 uppercase">
                    {editingService.category.replace('_', ' ')} Details (Locked)
                  </h4>
                  
                  {Object.entries(editingService.details[editingService.category]).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={value}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-200 text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;