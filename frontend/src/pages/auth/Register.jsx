import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user'); // Moved role to separate state for easier toggling
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    bio: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role,
        providerProfile:
          role === 'provider'
            ? {
                specialization: form.specialization,
                experience: form.experience,
                bio: form.bio,
              }
            : undefined,
      };

      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition bg-white";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Join us to book or provide services
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Role Toggle Switch */}
        <div className="bg-gray-100 p-1 rounded-lg flex relative">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none ${
              role === 'user'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => setRole('provider')}
            className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none ${
              role === 'provider'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm a Provider
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              className={inputClass}
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className={inputClass}
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className={inputClass}
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Provider Specific Fields with Animation */}
          {role === 'provider' && (
            <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Professional Profile
                </span>
              </div>

              <div>
                <label className={labelClass}>Specialization</label>
                <input
                  name="specialization"
                  placeholder="e.g. Dentist, Plumber, Barber"
                  className={inputClass}
                  value={form.specialization}
                  onChange={handleChange}
                  required={role === 'provider'}
                />
              </div>

              <div>
                <label className={labelClass}>Experience (Years)</label>
                <input
                  name="experience"
                  type="number"
                  placeholder="e.g. 5"
                  className={inputClass}
                  value={form.experience}
                  onChange={handleChange}
                  required={role === 'provider'}
                />
              </div>

              <div>
                <label className={labelClass}>Bio / Description</label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your services..."
                  rows="3"
                  className={inputClass}
                  value={form.bio}
                  onChange={handleChange}
                  required={role === 'provider'}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white transition-all shadow-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5'
            }`}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>

          <div className="text-center mt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;