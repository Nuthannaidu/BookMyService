import { useEffect, useState } from 'react';
import API from '../../api/axios';

const Booking = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState(null);

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [blockedSlots, setBlockedSlots] = useState([]); // ✅ NEW
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Load Services ---------------- */
  useEffect(() => {
    API.get('/services')
      .then((res) => {
        const flat = res.data.flatMap((p) =>
          p.services.map((s) => ({
            ...s,
            providerId: p._id,
            providerName: p.name,
          }))
        );

        setServices(flat);
        setCategories([...new Set(flat.map((s) => s.category))]);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- Load Slots ---------------- */
  useEffect(() => {
    if (!selectedService || !date) return;

    setLoadingSlots(true);
    setSlots([]);
    setSelectedSlot('');
    setBlockedSlots([]); // reset for new date

    API.get('/appointments/availability', {
      params: {
        providerId: selectedService.providerId,
        serviceId: selectedService._id,
        date,
      },
    })
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedService, date]);

  /* ---------------- Book Slot ---------------- */
  const bookService = async () => {
    if (!selectedSlot) return;

    const ok = window.confirm(
      `Confirm booking for ${selectedService.name} on ${date} at ${selectedSlot}?`
    );
    if (!ok) return;

    try {
      await API.post('/appointments', {
        providerId: selectedService.providerId,
        serviceId: selectedService._id,
        date,
        startTime: selectedSlot,
      });

      // ✅ Optimistic UI block
      setBlockedSlots((prev) => [...prev, selectedSlot]);
      setSelectedSlot('');

      setMessage({ type: 'success', text: 'Booking request sent!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Booking failed',
      });
    }
  };

  /* ---------------- Icons ---------------- */
  const getCategoryIcon = (category) => {
    const icons = {
      medical: '🏥',
      saloon: '💇',
      car_rental: '🚗',
    };
    return icons[category] || '✨';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading services...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* ---------------- HEADER ---------------- */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            {!selectedCategory
              ? 'Choose Category'
              : !selectedService
              ? 'Select Service'
              : 'Book Appointment'}
          </h1>
        </div>

        {/* ---------------- STEP 1: CATEGORY ---------------- */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="bg-white p-8 rounded-2xl border-2 hover:border-indigo-500 transition"
              >
                <div className="text-5xl mb-3">{getCategoryIcon(cat)}</div>
                <div className="font-bold capitalize">{cat.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        )}

        {/* ---------------- STEP 2: SERVICES ---------------- */}
        {selectedCategory && !selectedService && (
          <>
            <button
              onClick={() => setSelectedCategory('')}
              className="mb-6 text-gray-600 font-semibold"
            >
              ← Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services
                .filter((s) => s.category === selectedCategory)
                .map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedService(s)}
                    className="bg-white p-6 rounded-2xl border-2 hover:border-indigo-500 transition text-left"
                  >
                    <h3 className="font-bold text-lg">{s.name}</h3>
                    <p className="text-sm text-gray-500">
                      {s.duration} mins • ₹{s.price}
                    </p>
                    <p className="text-xs mt-2">By {s.providerName}</p>
                  </button>
                ))}
            </div>
          </>
        )}

        {/* ---------------- STEP 3: DATE & SLOTS ---------------- */}
        {selectedService && (
          <>
            <button
              onClick={() => {
                setSelectedService(null);
                setDate('');
                setSlots([]);
                setSelectedSlot('');
                setBlockedSlots([]);
              }}
              className="mb-6 text-gray-600 font-semibold"
            >
              ← Back
            </button>

            <div className="bg-white rounded-2xl border-2 p-8 shadow-lg">

              {/* Date */}
              <input
                type="date"
                className="border p-3 rounded-lg mb-6"
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              {/* Slots */}
              {date && (
                <>
                  {loadingSlots ? (
                    <p>Loading slots...</p>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                      {slots.map((slot) => {
                        const isBlocked = blockedSlots.includes(slot.startTime);
                        const isSelected = selectedSlot === slot.startTime;

                        return (
                          <button
                            key={slot.startTime}
                            disabled={isBlocked}
                            onClick={() =>
                              !isBlocked && setSelectedSlot(slot.startTime)
                            }
                            className={`relative border-2 rounded-xl py-3 text-sm font-bold transition
                              ${
                                isBlocked
                                  ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                                  : 'bg-white border-gray-200 hover:border-indigo-400'
                              }`}
                          >
                            {isBlocked && (
                              <span className="absolute top-1 right-1 text-xs">
                                ⏳
                              </span>
                            )}
                            {slot.startTime}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p>No slots available</p>
                  )}
                </>
              )}

              {/* Book Button */}
              <button
                onClick={bookService}
                disabled={!selectedSlot}
                className={`w-full py-4 rounded-xl font-bold transition ${
                  selectedSlot
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirm Booking
              </button>

              {/* Message */}
              {message && (
                <div
                  className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;
