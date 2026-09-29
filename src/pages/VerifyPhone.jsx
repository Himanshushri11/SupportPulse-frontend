import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Alert } from '../components/common/Alert';
import { Smartphone, RefreshCw, ArrowRight, Loader2 } from 'lucide-react';

export const VerifyPhone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyPhone } = useAuth();

  const [phone, setPhone] = useState(() => {
    return (
      location.state?.phone ||
      sessionStorage.getItem('pending_verify_phone') ||
      ''
    );
  });

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(location.state?.message || '');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please provide your registered phone number');
      return;
    }
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await verifyPhone(phone, otp);
    setIsLoading(false);

    if (res.success) {
      // Clear pending session storage
      sessionStorage.removeItem('pending_verify_email');
      sessionStorage.removeItem('pending_verify_phone');

      navigate('/dashboard', {
        state: {
          notification: 'Phone number verified successfully! Welcome to SupportPulse.',
        },
      });
    } else {
      setError(res.error || 'Failed to verify phone OTP. Please check the code.');
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;

    if (!phone) {
      setError('Please enter your phone number to resend OTP');
      return;
    }

    setIsResending(true);
    setError('');

    try {
      const res = await authApi.resendOtp(phone, 'PHONE_VERIFICATION');
      setIsResending(false);
      setCountdown(60);
      setSuccessMsg(res.message || 'A fresh SMS verification code has been dispatched.');
    } catch (err) {
      setIsResending(false);
      setError(err.response?.data?.message || 'Failed to resend verification code');
    }
  };

  return (
    <AuthLayout
      title="Verify your phone"
      subtitle="Enter the 6-digit confirmation code sent to your phone via SMS."
    >
      <div className="flex items-center justify-center mb-6">
        <div className="w-14 h-14 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center border border-indigo-500/30">
          <Smartphone className="w-7 h-7" />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} className="mb-5" />}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Phone Number (with Country Code)
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-slate-300">
              6-Digit SMS Code
            </label>
            <button
              type="button"
              disabled={countdown > 0 || isResending}
              onClick={handleResend}
              className="text-xs text-sky-400 hover:text-sky-300 disabled:text-slate-500 flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
              <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-3 text-2xl font-mono tracking-widest text-center text-indigo-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Confirm & Verify Phone</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <Link to="/dashboard" className="text-xs font-medium text-slate-400 hover:text-white transition">
          Skip for now &rarr; Go to Dashboard
        </Link>
      </div>
    </AuthLayout>
  );
};
