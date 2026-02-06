import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../../api/axios';

const AllBookings = () => {
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState(initialFilter);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/appointments/provider')
      .then((res) => setAppointments(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
      case 'accepted':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

 
  const formatTime = (time) => {
    if (!time) return '';
    const [h, m] = time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium">
      <div className="animate-pulse">Loading bookings...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
   
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          
        
          <div className="flex items-center gap-4">
            <Link 
              to="/provider/dashboard" 
              className="p-2 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {filter === 'all' ? 'All Bookings' : filter === 'completed' ? 'History' : `${filter} Bookings`}
              </h1>
              <p className="text-sm text-gray-500">Manage and track your appointments</p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all border shrink-0 ${
                  filter === f 
                    ? 'bg-black text-white border-black shadow-md transform scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="text-5xl mb-4 grayscale opacity-50">📂</div>
              <p className="text-gray-500 font-medium text-lg">No {filter} bookings found.</p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="mt-2 text-indigo-600 font-bold text-sm hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredAppointments.map((a) => (
              <div 
                key={a._id} 
                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
              >
          
                <div className="flex items-start gap-4 w-full sm:w-auto">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0 border border-gray-100">
                    {a.service?.category === 'medical' ? '🏥' : a.service?.category === 'saloon' ? '✂️' : '🚗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight truncate pr-2">
                      {a.service?.name || "Service Unavailable"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                     
                        👤 {a.user?.name || "Guest"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-50 gap-1">
                  <div className="text-left sm:text-right">
                     <p className="font-bold text-gray-900 text-sm sm:text-base">
                       {a.date}
                     </p>
               
                     <p className="text-xs sm:text-sm text-gray-500 font-medium">
                       {formatTime(a.startTime)} - {formatTime(a.endTime)}
                     </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border shadow-sm ${getStatusStyle(a.status)}`}>
                    {a.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AllBookings;