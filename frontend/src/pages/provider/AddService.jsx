import { useState } from 'react';
import API from '../../api/axios';

const CATEGORY_OPTIONS = [
  { label: 'Medical', value: 'medical', icon: '🏥' },
  { label: 'Saloon', value: 'saloon', icon: '💇' },
  { label: 'Car Rental', value: 'car_rental', icon: '🚗' },
];

const AddService = () => {
  const [form, setForm] = useState({
    name: '',
    category: '',
    duration: '',
    price: '',
    details: {},
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetailChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      details: {
        ...prev.details,
        [section]: {
          ...prev.details[section],
          [field]: value,
        },
      },
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/services', {
        name: form.name,
        category: form.category,
        duration: Number(form.duration),
        price: Number(form.price),
        details: form.details,
      });
      setMessage('Service published successfully!');
      setForm({ name: '', category: '', duration: '', price: '', details: {} });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add service');
    }
  };

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none text-sm bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-700 mb-1';

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md border border-gray-200 p-6">

        {/* HEADER */}
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-900">Add New Service</h1>
          <p className="text-sm text-gray-500 mt-1">
            Provide details to list your service
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">

          {/* SERVICE NAME */}
          <div>
            <label className={labelClass}>Service Name</label>
            <input
              name="name"
              placeholder="e.g. General Consultation"
              className={inputClass}
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className={labelClass}>Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setForm({ ...form, category: c.value, details: {} })
                  }
                  className={`border rounded-md py-2 text-xs font-semibold transition ${
                    form.category === c.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg">{c.icon}</div>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC DETAILS */}
          {form.category && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-3">
              <p className="text-xs font-bold text-gray-600 uppercase">
                {form.category.replace('_', ' ')} details
              </p>

              {form.category === 'medical' && (
                <>
                  <input
                    placeholder="Specialization"
                    className={inputClass}
                    onChange={(e) =>
                      handleDetailChange('medical', 'specialization', e.target.value)
                    }
                    required
                  />
                  <select
                    className={inputClass}
                    defaultValue=""
                    onChange={(e) =>
                      handleDetailChange('medical', 'consultationType', e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Consultation Type
                    </option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </>
              )}

              {form.category === 'saloon' && (
                <>
                  <select
                    className={inputClass}
                    defaultValue=""
                    onChange={(e) =>
                      handleDetailChange('saloon', 'gender', e.target.value)
                    }
                    required
                  >
                    <option value="" disabled>
                      Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                  <input
                    placeholder="Service Type"
                    className={inputClass}
                    onChange={(e) =>
                      handleDetailChange('saloon', 'serviceType', e.target.value)
                    }
                    required
                  />
                </>
              )}

              {form.category === 'car_rental' && (
                <>
                  <input
                    placeholder="Vehicle Model"
                    className={inputClass}
                    onChange={(e) =>
                      handleDetailChange('carRental', 'vehicleType', e.target.value)
                    }
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className={inputClass}
                      defaultValue=""
                      onChange={(e) =>
                        handleDetailChange('carRental', 'transmission', e.target.value)
                      }
                      required
                    >
                      <option value="" disabled>
                        Transmission
                      </option>
                      <option value="manual">Manual</option>
                      <option value="automatic">Automatic</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      placeholder="Seats"
                      className={inputClass}
                      onChange={(e) =>
                        handleDetailChange(
                          'carRental',
                          'seats',
                          Number(e.target.value)
                        )
                      }
                      required
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* DURATION & PRICE */}
          <div className="grid grid-cols-2 gap-3">
            <input
              name="duration"
              type="number"
              placeholder="Duration (mins)"
              className={inputClass}
              value={form.duration}
              onChange={handleChange}
              required
            />
            <input
              name="price"
              type="number"
              placeholder="Price (₹)"
              className={inputClass}
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 rounded-md font-semibold hover:bg-indigo-700 transition"
          >
            Publish Service
          </button>
        </form>

        {message && (
          <div className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddService;
