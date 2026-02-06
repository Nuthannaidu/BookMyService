import { useEffect, useState } from 'react';
import API from '../../api/axios';

const MyBookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');

  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    API.get('/appointments/my')
      .then((res) => {
        const normalized = res.data.map((a) => ({
          ...a,
          providerId: a.provider?._id || a.provider,
          serviceId: a.service?._id,
        }));
        setAppointments(normalized);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load appointments');
        setLoading(false);
      });
  };

  useEffect(() => {
    if (newDate && targetAppointment?.providerId && targetAppointment?.serviceId) {
      fetchSlots(targetAppointment.providerId, targetAppointment.serviceId, newDate);
    }
  }, [newDate, targetAppointment]);

  const fetchSlots = async (providerId, serviceId, date) => {
    setLoadingSlots(true);
    try {
      const { data } = await API.get('/appointments/availability', {
        params: { providerId, serviceId, date },
      });
      setAvailableSlots(data);
    } catch (err) {
      console.error('Slot fetch failed', err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const cancelBooking = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await API.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'cancelled' } : a))
      );
    } catch {
      alert('Unable to cancel appointment.');
    }
  };

  const handleRescheduleClick = (appointment) => {
    setTargetAppointment(appointment);
    setNewDate('');
    setNewSlot('');
    setAvailableSlots([]);
    setIsRescheduleModalOpen(true);
  };

  const confirmReschedule = async () => {
    if (!newDate || !newSlot) return;
    try {
      await API.patch(`/appointments/${targetAppointment._id}`, {
        date: newDate,
        startTime: newSlot,
      });
      setIsRescheduleModalOpen(false);
      fetchAppointments();
    } catch {
      alert('Failed to reschedule. Please try again.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'accepted':
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200 opacity-75';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getDateParts = (dateString) => {
    if (!dateString) return { month: '---', day: '--' };
    const date = new Date(dateString);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate(),
    };
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const upcoming = appointments.filter((a) =>
    ['pending', 'confirmed', 'accepted'].includes(a.status)
  );
  const history = appointments.filter((a) =>
    ['cancelled', 'completed', 'rejected'].includes(a.status)
  );

  const displayList = activeTab === 'upcoming' ? upcoming : history;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading bookings...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">Manage your schedule and history.</p>
          </div>

          <div className="bg-white p-1 rounded-xl border flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'upcoming' ? 'bg-black text-white' : 'text-gray-500'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'history' ? 'bg-black text-white' : 'text-gray-500'
              }`}
            >
              History
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 border">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {displayList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              No {activeTab} appointments found.
            </div>
          ) : (
            displayList.map((a) => {
              const { month, day } = getDateParts(a.date);

              return (
                <div
                  key={a._id}
                  className="bg-white rounded-2xl p-5 border shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-4 flex items-center gap-5">
                    <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded-xl p-3 min-w-[70px]">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{month}</span>
                      <span className="text-2xl font-extrabold text-gray-900 leading-none">{day}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">
                        {a.service?.name || "Unknown Service"}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        by {a.provider?.name || "Provider"}
                      </p>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                      {formatTime(a.startTime)} - {formatTime(a.endTime)}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <span
                      className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold border capitalize ${getStatusStyle(
                        a.status
                      )}`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <div className="md:col-span-3 flex justify-end gap-3">
                    {['pending', 'accepted', 'confirmed'].includes(a.status) && (
                      <>
                        <button
                          onClick={() => handleRescheduleClick(a)}
                          className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          Reschedule
                        </button>
                        <button
                          onClick={() => cancelBooking(a._id)}
                          className="px-4 py-2 text-xs font-bold text-red-600 border border-gray-200 hover:bg-red-50 hover:border-red-100 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">Reschedule Appointment</h3>
              <p className="text-sm text-gray-500 mt-1">Select a new date and time.</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Select New Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    setNewSlot('');
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Available Slots</label>
                {loadingSlots ? (
                  <div className="text-center text-sm text-gray-400 py-4 bg-gray-50 rounded-lg">
                    Checking availability...
                  </div>
                ) : newDate && availableSlots.length === 0 ? (
                  <div className="text-center text-sm text-gray-400 py-4 bg-gray-50 rounded-lg">
                    No slots available for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.startTime}
                        onClick={() => setNewSlot(slot.startTime)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                          newSlot === slot.startTime
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {formatTime(slot.startTime)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex gap-3 bg-gray-50">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="flex-1 py-3 font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!newSlot}
                className="flex-1 py-3 font-bold text-white bg-black rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;