import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Alert } from '../components/common/Alert';
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authApi.forgotPassword(email.trim());
      setIsLoading(false);
      navigate('/reset-password', {
        state: {
          email: email.trim(),
          message:
            'If an account is associated with that email, a password reset code has been dispatched.',
        },
      });
    } catch (err) {
      setIsLoading(false);
      // For security, proceed to reset password page or display standard message
      navigate('/reset-password', {
        state: {
          email: email.trim(),
          message:
            'If an account is associated with that email, a password reset code has been dispatched.',
        },
      });
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send a 6-digit verification code to reset your account password."
    >
      <div className="flex items-center justify-center mb-6">
        <div className="w-14 h-14 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/30">
          <KeyRound className="w-7 h-7" />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending code...</span>
            </>
          ) : (
            <>
              <span>Send Reset OTP</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <Link to="/login" className="text-xs font-medium text-slate-400 hover:text-white transition">
          &larr; Remember your password? Sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
