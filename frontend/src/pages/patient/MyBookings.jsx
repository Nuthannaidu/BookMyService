import { useEffect, useState } from 'react';
import API from '../../api/axios';

const MyBookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [error, setError] = useState('');

  // Reschedule State
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [targetAppointment, setTargetAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  // ✅ Fetch appointments & normalize IDs (INTERNAL ONLY)
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

  // ✅ Fetch slots when reschedule date changes
  useEffect(() => {
    if (
      newDate &&
      targetAppointment?.providerId &&
      targetAppointment?.serviceId
    ) {
      fetchSlots(
        targetAppointment.providerId,
        targetAppointment.serviceId,
        newDate
      );
    }
  }, [newDate, targetAppointment]);

  // ✅ Correct slot fetch (API RETURNS ARRAY)
  const fetchSlots = async (providerId, serviceId, date) => {
    setLoadingSlots(true);
    try {
      const { data } = await API.get('/appointments/availability', {
        params: { providerId, serviceId, date },
      });
      setAvailableSlots(data); // IMPORTANT FIX
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

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-1">Manage your schedule and history.</p>
          </div>

          <div className="bg-white p-1 rounded-xl border flex">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'upcoming'
                  ? 'bg-black text-white'
                  : 'text-gray-500'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold ${
                activeTab === 'history'
                  ? 'bg-black text-white'
                  : 'text-gray-500'
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

        {/* Appointment List */}
        <div className="space-y-4">
          {displayList.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed">
              No {activeTab} appointments found.
            </div>
          ) : (
            displayList.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-2xl p-5 border shadow-sm grid md:grid-cols-12 gap-6 items-center"
              >
                <div className="md:col-span-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                    {a.service?.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {a.service?.name}
                    </h3>
                  </div>
                </div>

                <div className="md:col-span-3">
                  <div className="text-gray-700">📅 {a.date}</div>
                  <div className="text-sm text-gray-500">
                    ⏰ {a.startTime} - {a.endTime}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(
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
                        className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelBooking(a._id)}
                        className="px-4 py-2 text-xs font-bold text-red-600 border rounded-lg"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {isRescheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <h3 className="font-bold text-lg">Reschedule Appointment</h3>
            </div>

            <div className="p-6 space-y-4">
              <input
                type="date"
                className="w-full p-3 border rounded-xl"
                min={new Date().toISOString().split('T')[0]}
                value={newDate}
                onChange={(e) => {
                  setNewDate(e.target.value);
                  setNewSlot('');
                }}
              />

              {loadingSlots ? (
                <div className="text-center text-sm text-gray-400">
                  Checking availability...
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.startTime}
                      onClick={() => setNewSlot(slot.startTime)}
                      className={`py-2 text-xs font-bold rounded-lg border ${
                        newSlot === slot.startTime
                          ? 'bg-black text-white'
                          : 'bg-white'
                      }`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setIsRescheduleModalOpen(false)}
                className="flex-1 py-3 border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                disabled={!newSlot}
                className="flex-1 py-3 bg-black text-white rounded-xl disabled:bg-gray-300"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
