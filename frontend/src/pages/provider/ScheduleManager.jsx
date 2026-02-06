import { useEffect, useState } from 'react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const DAYS = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

const ScheduleManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  
  // State: structure is { 0: [{startTime, endTime}], 1: [...], ... }
  const [schedule, setSchedule] = useState({}); 
  const [unavailableDates, setUnavailableDates] = useState('');
  const [message, setMessage] = useState('');

  // 1. Fetch Services List
  useEffect(() => {
    API.get(`/services/${user._id}`).then((res) => setServices(res.data));
  }, [user._id]);

  // 2. Fetch & Populate Schedule when Service ID changes
  useEffect(() => {
    if (!serviceId) return;
    
    const fetchSchedule = async () => {
      try {
        // Initialize empty structure first
        const formattedSchedule = {};
        DAYS.forEach(d => formattedSchedule[d.value] = []);

        // Call the new backend endpoint
        const { data } = await API.get(`/appointments/schedule/${serviceId}`);

        // Populate the structure with incoming data
        if (data.workingHours && Array.isArray(data.workingHours)) {
          data.workingHours.forEach(shift => {
            // Ensure the day array exists before pushing
            if (formattedSchedule[shift.dayOfWeek]) {
              formattedSchedule[shift.dayOfWeek].push({
                startTime: shift.startTime,
                endTime: shift.endTime
              });
            }
          });
        }

        setSchedule(formattedSchedule);
        
        // Convert array ["2024-01-01", "2024-02-02"] -> String "2024-01-01, 2024-02-02"
        setUnavailableDates(
          data.unavailableDates ? data.unavailableDates.join(', ') : ''
        );

      } catch (err) {
        console.error("Failed to load schedule", err);
      }
    };

    fetchSchedule();
  }, [serviceId]);

  /* ==================== HANDLERS ==================== */

  const addShift = (dayValue) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: [...prev[dayValue], { startTime: '09:00', endTime: '12:00' }]
    }));
  };

  const removeShift = (dayValue, shiftIndex) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: prev[dayValue].filter((_, i) => i !== shiftIndex)
    }));
  };

  const updateShift = (dayValue, shiftIndex, field, value) => {
    setSchedule(prev => {
      const dayShifts = [...prev[dayValue]];
      dayShifts[shiftIndex] = { ...dayShifts[shiftIndex], [field]: value };
      return { ...prev, [dayValue]: dayShifts };
    });
  };

  const saveSchedule = async () => {
    // Convert State Object -> Backend Array
    const workingHours = [];
    Object.entries(schedule).forEach(([dayVal, shifts]) => {
      shifts.forEach(shift => {
        workingHours.push({
          dayOfWeek: Number(dayVal),
          startTime: shift.startTime,
          endTime: shift.endTime
        });
      });
    });

    try {
      await API.post('/appointments/schedule', {
        serviceId,
        workingHours,
        // Convert String -> Array
        unavailableDates: unavailableDates 
          ? unavailableDates.split(',').map(d => d.trim()) 
          : [],
      });
      setMessage({ type: 'success', text: 'Schedule updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save schedule.' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-white border-b border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Availability</h1>
            <p className="text-gray-500 mt-1">Select a service to view or edit its schedule.</p>
          </div>
          <select
            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none bg-gray-50 font-medium"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="">Select Service...</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>

        {serviceId ? (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* DAYS LIST */}
            <div className="space-y-4">
              {DAYS.map((day) => {
                const dayShifts = schedule[day.value] || [];
                const isActive = dayShifts.length > 0;

                return (
                  <div key={day.value} className={`border rounded-xl p-4 transition-all ${isActive ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      
                      {/* Day Label & Add Button */}
                      <div className="w-full sm:w-32 pt-2 flex flex-row sm:flex-col justify-between items-center sm:items-start">
                        <span className={`font-bold ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>{day.label}</span>
                        <button 
                          onClick={() => addShift(day.value)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition"
                        >
                          + Add Shift
                        </button>
                      </div>

                      {/* Shifts Container */}
                      <div className="flex-1 space-y-3">
                        {dayShifts.length === 0 && (
                          <div className="text-sm text-gray-400 italic pt-2">No working hours (Day Off)</div>
                        )}

                        {dayShifts.map((shift, index) => (
                          <div key={index} className="flex items-center gap-3 animate-fadeIn">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1.5 border border-gray-200">
                              <input
                                type="time"
                                value={shift.startTime}
                                onChange={(e) => updateShift(day.value, index, 'startTime', e.target.value)}
                                className="bg-transparent text-sm font-medium focus:outline-none w-24 text-center"
                              />
                              <span className="text-gray-400">-</span>
                              <input
                                type="time"
                                value={shift.endTime}
                                onChange={(e) => updateShift(day.value, index, 'endTime', e.target.value)}
                                className="bg-transparent text-sm font-medium focus:outline-none w-24 text-center"
                              />
                            </div>
                            
                            <button 
                              onClick={() => removeShift(day.value, index)}
                              className="text-gray-400 hover:text-red-600 transition p-1"
                              title="Remove this shift"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* HOLIDAYS */}
            <div className="bg-red-50 p-5 rounded-xl border border-red-100">
              <label className="block text-sm font-bold text-red-900 mb-2">Block Specific Dates</label>
              <input
                type="text"
                placeholder="2024-12-25, 2024-01-01"
                className="w-full p-3 border border-red-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                value={unavailableDates}
                onChange={(e) => setUnavailableDates(e.target.value)}
              />
            </div>

            {/* SAVE BUTTON */}
            <button
              onClick={saveSchedule}
              className="w-full py-4 rounded-xl font-bold text-lg bg-black text-white hover:bg-gray-800 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Update Schedule
            </button>

            {message && (
               <div className={`p-4 rounded-lg text-center font-medium ${
                 message.type === 'success' ? 'bg-green-50 text-green-700' : 
                 message.type === 'info' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
               }`}>
                 {message.text}
               </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-gray-400">Please select a service above.</div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;