import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('user');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    experience: '',
    bio: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Validation Logic ---
  const validate = () => {
    const newErrors = {};

    if (form.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (role === 'provider') {
      if (!form.specialization.trim()) newErrors.specialization = 'Specialization is required.';
      if (!form.experience || form.experience < 0) newErrors.experience = 'Valid experience years required.';
      if (form.bio.trim().length < 10) newErrors.bio = 'Bio must be at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);

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
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Styled Components ---
  const InputIcon = ({ children }) => (
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
      {children}
    </div>
  );

  const getInputClass = (fieldName) => `
    appearance-none w-full pl-10 pr-4 py-3 border rounded-xl 
    focus:outline-none focus:ring-2 transition-all duration-200
    ${
      errors[fieldName]
        ? 'border-red-300 focus:ring-red-200 focus:border-red-500 bg-red-50'
        : 'border-gray-200 focus:ring-black focus:border-black bg-gray-50 focus:bg-white'
    }
  `;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-white">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
            Create Account
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Start your journey with BookMyServices
          </p>
        </div>

        {/* Server Error Message */}
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {serverError}
          </div>
        )}

        {/* Role Toggle Switch */}
        <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
          <button
            type="button"
            onClick={() => { setRole('user'); setErrors({}); }}
            className={`w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              role === 'user'
                ? 'bg-white text-gray-900 shadow-md transform scale-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm a Customer
          </button>
          <button
            type="button"
            onClick={() => { setRole('provider'); setErrors({}); }}
            className={`w-1/2 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
              role === 'provider'
                ? 'bg-white text-gray-900 shadow-md transform scale-100'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            I'm a Provider
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Name Field */}
          <div>
            <div className="relative">
              <InputIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </InputIcon>
              <input
                name="name"
                placeholder="Full Name"
                className={getInputClass('name')}
                value={form.name}
                onChange={handleChange}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-red-500 pl-1">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <div className="relative">
              <InputIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </InputIcon>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                className={getInputClass('email')}
                value={form.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <div className="relative">
              <InputIcon>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </InputIcon>
              <input
                name="password"
                type="password"
                placeholder="Password (Min 6 chars)"
                className={getInputClass('password')}
                value={form.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>}
          </div>

          {/* Provider Specific Fields */}
          {role === 'provider' && (
            <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 animate-fadeIn">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-6 w-1 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Professional Profile
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Specialization */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="relative">
                    <InputIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </InputIcon>
                    <input
                      name="specialization"
                      placeholder="Specialization"
                      className={getInputClass('specialization')}
                      value={form.specialization}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.specialization && <p className="mt-1 text-xs text-red-500 pl-1">{errors.specialization}</p>}
                </div>

                {/* Experience */}
                <div className="col-span-2 sm:col-span-1">
                  <div className="relative">
                    <InputIcon>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </InputIcon>
                    <input
                      name="experience"
                      type="number"
                      placeholder="Years Exp."
                      className={getInputClass('experience')}
                      value={form.experience}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.experience && <p className="mt-1 text-xs text-red-500 pl-1">{errors.experience}</p>}
                </div>
              </div>

              {/* Bio */}
              <div>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <textarea
                    name="bio"
                    placeholder="Short professional bio..."
                    rows="3"
                    className={`${getInputClass('bio')} pl-10`} // Custom padding for textarea
                    value={form.bio}
                    onChange={handleChange}
                  />
                </div>
                {errors.bio && <p className="mt-1 text-xs text-red-500 pl-1">{errors.bio}</p>}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-xl text-white transition-all duration-200 shadow-lg transform ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-black hover:bg-gray-800 hover:-translate-y-1 hover:shadow-xl'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Account...
              </span>
            ) : (
              'Register Now'
            )}
          </button>

          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-gray-900 hover:text-black hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;