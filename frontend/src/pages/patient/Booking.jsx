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
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- Helper: Format Time to AM/PM ---------------- */
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

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
    setBlockedSlots([]);

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
      `Confirm booking for ${selectedService.name} on ${date} at ${formatTime(selectedSlot)}?`
    );
    if (!ok) return;

    try {
      await API.post('/appointments', {
        providerId: selectedService.providerId,
        serviceId: selectedService._id,
        date,
        startTime: selectedSlot,
      });

      setBlockedSlots((prev) => [...prev, selectedSlot]);
      setSelectedSlot('');

      setMessage({ type: 'success', text: 'Booking request sent successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Booking failed',
      });
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      medical: '🏥',
      saloon: '✂️',
      car_rental: '🚗',
    };
    return icons[category] || '✨';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">
        Loading services...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* ---------------- HEADER ---------------- */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {!selectedCategory
              ? 'What service do you need?'
              : !selectedService
              ? `Select a ${selectedCategory.replace('_', ' ')} Service`
              : 'Finalize Your Booking'}
          </h1>
          <p className="mt-2 text-gray-500">
            {!selectedCategory
              ? 'Choose a category to get started.'
              : !selectedService
              ? 'Browse highly rated professionals near you.'
              : 'Select a date and time slot that works for you.'}
          </p>
        </div>

        {/* ---------------- STEP 1: CATEGORY ---------------- */}
        {!selectedCategory && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 animate-fadeIn">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="group bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-4"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(cat)}
                </span>
                <span className="font-bold text-gray-900 capitalize text-lg">
                  {cat.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* ---------------- STEP 2: SERVICES ---------------- */}
        {selectedCategory && !selectedService && (
          <div className="animate-fadeIn">
            <button
              onClick={() => setSelectedCategory('')}
              className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              ← Back to Categories
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {services
                .filter((s) => s.category === selectedCategory)
                .map((s) => (
                  <button
                    key={s._id}
                    onClick={() => setSelectedService(s)}
                    className="flex flex-col text-left bg-white p-6 rounded-2xl border border-gray-200 hover:border-black hover:shadow-md transition-all group h-full"
                  >
                    <div className="flex justify-between items-start w-full mb-2">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {s.name}
                      </h3>
                      <span className="bg-gray-100 text-gray-900 text-xs font-bold px-2 py-1 rounded">
                        ₹{s.price}
                      </span>
                    </div>
                    <div className="mt-auto">
                       <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                         <span>⏱</span> {s.duration} mins
                       </p>
                       <p className="text-xs text-gray-400 font-medium">
                         By {s.providerName}
                       </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* ---------------- STEP 3: DATE & SLOTS ---------------- */}
        {selectedService && (
          <div className="animate-fadeIn">
            <button
              onClick={() => {
                setSelectedService(null);
                setDate('');
                setSlots([]);
                setSelectedSlot('');
                setBlockedSlots([]);
                setMessage(null);
              }}
              className="mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              ← Back to Services
            </button>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              {/* Service Summary Card */}
              <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedService.name}</h2>
                  <p className="text-sm text-gray-500 mt-1 capitalize">
                    {selectedService.category.replace('_', ' ')} • {selectedService.duration} mins • Provider: {selectedService.providerName}
                  </p>
                </div>
                <div className="text-3xl font-bold text-gray-900">₹{selectedService.price}</div>
              </div>

              <div className="p-8 space-y-8">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    1. Select Date
                  </label>
                  <input
                    type="date"
                    className="w-full sm:w-auto p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition text-gray-700 font-medium bg-white shadow-sm"
                    min={new Date().toISOString().split('T')[0]}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Slots Grid */}
                {date && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                      2. Select Time
                    </label>

                    {loadingSlots ? (
                      <div className="py-10 text-center text-gray-400 animate-pulse bg-gray-50 rounded-xl">
                        Checking availability...
                      </div>
                    ) : slots.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {slots.map((slot) => {
                          const isBlocked = blockedSlots.includes(slot.startTime);
                          const isSelected = selectedSlot === slot.startTime;

                          return (
                            <button
                              key={slot.startTime}
                              disabled={isBlocked}
                              onClick={() => !isBlocked && setSelectedSlot(slot.startTime)}
                              className={`py-3 px-2 rounded-lg text-sm font-bold transition-all duration-200 border
                                ${
                                  isBlocked
                                    ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed decoration-slice'
                                    : isSelected
                                    ? 'bg-black text-white border-black shadow-lg transform scale-105'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-md'
                                }`}
                            >
                              {formatTime(slot.startTime)}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-xl text-center border border-dashed border-gray-300">
                        <p className="text-gray-500">No slots available for this date.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={bookService}
                    disabled={!selectedSlot}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                      selectedSlot
                        ? 'bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {selectedSlot 
                      ? `Confirm Booking for ${formatTime(selectedSlot)}` 
                      : 'Select a time slot to continue'}
                  </button>
                </div>

                {/* Status Message */}
                {message && (
                  <div
                    className={`p-4 rounded-xl text-center font-medium border ${
                      message.type === 'success'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {message.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;