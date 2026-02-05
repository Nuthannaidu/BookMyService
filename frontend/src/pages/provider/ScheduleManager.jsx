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

const defaultWeek = DAYS.map((d) => ({
  dayOfWeek: d.value,
  enabled: false,
  startTime: '09:00',
  endTime: '17:00',
}));

const ScheduleManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [week, setWeek] = useState(defaultWeek);
  const [unavailableDates, setUnavailableDates] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    API.get(`/services/${user._id}`).then((res) => setServices(res.data));
  }, [user._id]);

  const toggleDay = (index) => {
    const copy = [...week];
    copy[index].enabled = !copy[index].enabled;
    setWeek(copy);
  };

  const updateTime = (index, field, value) => {
    const copy = [...week];
    copy[index][field] = value;
    setWeek(copy);
  };

  const saveSchedule = async () => {
    const workingHours = week
      .filter((d) => d.enabled)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        startTime: d.startTime,
        endTime: d.endTime,
      }));

    try {
      await API.post('/appointments/schedule', {
        serviceId,
        workingHours,
        unavailableDates: unavailableDates
          ? unavailableDates.split(',').map((d) => d.trim())
          : [],
      });
      setMessage('Schedule saved successfully!');
    } catch {
      setMessage('Failed to save schedule. Please try again.');
    }
  };

  const hasWorkingDay = week.some((d) => d.enabled);

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md border border-gray-200 p-6">

        {/* HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Manage Availability</h1>
            <p className="text-sm text-gray-500">
              Set weekly working hours for each service
            </p>
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
          >
            <option value="">Select Service</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name} ({s.duration} min)
              </option>
            ))}
          </select>
        </div>

        {/* BODY */}
        {serviceId ? (
          <>
            <div className="space-y-3">
              {week.map((d, i) => (
                <div
                  key={d.dayOfWeek}
                  className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-md border ${
                    d.enabled
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 w-full sm:w-1/3">
                    <input
                      type="checkbox"
                      checked={d.enabled}
                      onChange={() => toggleDay(i)}
                      className="w-4 h-4 accent-black"
                    />
                    <span className={`text-sm font-medium ${
                      d.enabled ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {DAYS[i].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-2/3 justify-end">
                    <input
                      type="time"
                      disabled={!d.enabled}
                      value={d.startTime}
                      onChange={(e) => updateTime(i, 'startTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="time"
                      disabled={!d.enabled}
                      value={d.endTime}
                      onChange={(e) => updateTime(i, 'endTime', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* HOLIDAYS */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Block Dates (Holidays)
              </label>
              <input
                type="text"
                placeholder="YYYY-MM-DD, YYYY-MM-DD"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                value={unavailableDates}
                onChange={(e) => setUnavailableDates(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate dates with commas
              </p>
            </div>

            {/* SAVE BUTTON */}
            <div className="mt-6">
              <button
                onClick={saveSchedule}
                disabled={!hasWorkingDay}
                className={`w-full py-2.5 rounded-md font-semibold transition ${
                  hasWorkingDay
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Save Schedule
              </button>
            </div>

            {message && (
              <div className={`mt-4 text-sm text-center ${
                message.includes('success')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}>
                {message}
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 text-center text-gray-500 text-sm border border-dashed border-gray-300 rounded-md py-10">
            Select a service to configure its schedule
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleManager;
