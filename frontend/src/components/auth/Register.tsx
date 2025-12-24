import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Register: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    } else if (displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register(email, password, displayName);
      toast.success('Account created successfully! 🎉');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Failed to create account. Please try again.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use. Please try logging in instead.';
        setErrors({ email: errorMessage });
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
        setErrors({ email: errorMessage });
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
        setErrors({ password: errorMessage });
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join our crypto tracking community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="text-sm font-medium text-gray-300 block mb-2">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                if (errors.displayName) setErrors({ ...errors, displayName: '' });
              }}
              placeholder="e.g., John Crypto"
              className={`w-full bg-gray-700 border ${
                errors.displayName ? 'border-red-500' : 'border-gray-600'
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 ${
                errors.displayName ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              required
            />
            {errors.displayName && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.displayName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-300 block mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="you@example.com"
              className={`w-full bg-gray-700 border ${
                errors.email ? 'border-red-500' : 'border-gray-600'
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 ${
                errors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              required
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="Min. 6 characters"
              className={`w-full bg-gray-700 border ${
                errors.password ? 'border-red-500' : 'border-gray-600'
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 ${
                errors.password ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              required
            />
            {errors.password && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 block mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              placeholder="Re-enter your password"
              className={`w-full bg-gray-700 border ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
              } rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'focus:ring-red-500' : 'focus:ring-blue-500'
              }`}
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating account...
              </>
            ) : (
              <>
                <CheckCircle size={18} className="mr-2" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-700">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
