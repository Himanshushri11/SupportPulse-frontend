import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Alert } from '../components/common/Alert';
import { KeyRound, Mail, Phone, Eye, EyeOff, ArrowRight, Loader2, RefreshCw } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithEmailOtp, loginWithPhoneOtp } = useAuth();

  const [tab, setTab] = useState('password'); // 'password' | 'email-otp' | 'phone-otp'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    setOtpSent(false);
    setError('');
    setSuccessMsg('');
    setFormData((prev) => ({ ...prev, otp: '' }));
  };

  // Submit Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both your email address and password');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await login(formData.email, formData.password);
    setIsLoading(false);

    if (res.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Request Email OTP
  const handleRequestEmailOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address to receive a login code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.requestEmailLoginOtp(formData.email);
      setIsLoading(false);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(res.message || 'Verification code sent to your email.');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to dispatch verification code');
    }
  };

  // Verify Email OTP Login
  const handleVerifyEmailOtpLogin = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await loginWithEmailOtp(formData.email, formData.otp);
    setIsLoading(false);

    if (res.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Invalid or expired verification code');
    }
  };

  // Request Phone OTP
  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault();
    if (!formData.phone) {
      setError('Please enter your registered phone number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.requestPhoneLoginOtp(formData.phone);
      setIsLoading(false);
      setOtpSent(true);
      setCountdown(60);
      setSuccessMsg(res.message || 'Verification code sent to your phone.');
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to dispatch verification code');
    }
  };

  // Verify Phone OTP Login
  const handleVerifyPhoneOtpLogin = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await loginWithPhoneOtp(formData.phone, formData.otp);
    setIsLoading(false);

    if (res.success) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } else {
      setError(res.error || 'Invalid or expired verification code');
    }
  };

  return (
    <AuthLayout
      title="Sign in to SupportPulse"
      subtitle="Access your support tickets, customer queues, and conversation history."
    >
      {/* Login Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl mb-6 border border-slate-800">
        <button
          type="button"
          onClick={() => handleTabChange('password')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            tab === 'password'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Password</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('email-otp')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            tab === 'email-otp'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email OTP</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('phone-otp')}
          className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            tab === 'phone-otp'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Phone OTP</span>
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} className="mb-5" />}

      {/* 1. Password Login Form */}
      {tab === 'password' && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-sky-400 hover:text-sky-300 transition"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in with Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* 2. Email OTP Login Form */}
      {tab === 'email-otp' && (
        <form onSubmit={otpSent ? handleVerifyEmailOtpLogin : handleRequestEmailOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              disabled={otpSent}
              value={formData.email}
              onChange={handleChange}
              placeholder="name@company.com"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
            />
          </div>

          {otpSent && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  6-Digit Email Code
                </label>
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleRequestEmailOtp}
                  className="text-xs text-sky-400 hover:text-sky-300 disabled:text-slate-500 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <input
                type="text"
                name="otp"
                maxLength={6}
                required
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-lg font-mono tracking-widest text-center text-sky-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : otpSent ? (
              <>
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Send One-Time Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* 3. Phone OTP Login Form */}
      {tab === 'phone-otp' && (
        <form onSubmit={otpSent ? handleVerifyPhoneOtpLogin : handleRequestPhoneOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Phone Number (with Country Code)
            </label>
            <input
              type="tel"
              name="phone"
              required
              disabled={otpSent}
              value={formData.phone}
              onChange={handleChange}
              placeholder="+919876543210"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 transition"
            />
          </div>

          {otpSent && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  6-Digit SMS Code
                </label>
                <button
                  type="button"
                  disabled={countdown > 0 || isLoading}
                  onClick={handleRequestPhoneOtp}
                  className="text-xs text-sky-400 hover:text-sky-300 disabled:text-slate-500 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3 h-3 ${countdown > 0 ? 'animate-spin' : ''}`} />
                  <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
                </button>
              </div>
              <input
                type="text"
                name="otp"
                maxLength={6}
                required
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-lg font-mono tracking-widest text-center text-sky-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : otpSent ? (
              <>
                <span>Verify & Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Send One-Time Code</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Switch to Register footer */}
      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-sky-400 hover:text-sky-300 transition">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
