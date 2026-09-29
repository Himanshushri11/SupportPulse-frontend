import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Alert } from '../components/common/Alert';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, Check, X } from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMsg] = useState(location.state?.message || '');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  // Password criteria validation
  const password = formData.newPassword;
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&_\-#]/.test(password);
  const passwordsMatch = password && password === formData.confirmPassword;
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Please provide the account email address');
      return;
    }

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit reset code');
      return;
    }

    if (!isPasswordValid) {
      setError('Please meet all password security requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });

      setIsLoading(false);
      navigate('/login', {
        state: {
          notification:
            res.message ||
            'Password reset successfully! Please sign in with your new password.',
        },
      });
    } catch (err) {
      setIsLoading(false);
      setError(
        err.response?.data?.message ||
          'Failed to reset password. Please check the code and try again.'
      );
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Enter the 6-digit reset code from your email and choose a strong new password."
    >
      <div className="flex items-center justify-center mb-6">
        <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/30">
          <Lock className="w-7 h-7" />
        </div>
      </div>

      {infoMsg && <Alert type="info" message={infoMsg} className="mb-5" />}
      {error && <Alert type="error" message={error} onClose={() => setError('')} className="mb-5" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            6-Digit Reset Code
          </label>
          <input
            type="text"
            name="otp"
            required
            maxLength={6}
            value={formData.otp}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                otp: e.target.value.replace(/\D/g, ''),
              }))
            }
            placeholder="123456"
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xl font-mono tracking-widest text-center text-emerald-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="newPassword"
              required
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-time Password Strength Criteria */}
        {password.length > 0 && (
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
            <div className="text-slate-400 font-semibold mb-1">Password requirements:</div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div className={`flex items-center space-x-1.5 ${hasLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>8+ Characters</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasUpper ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>1 Uppercase Letter</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasLower ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>1 Lowercase Letter</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasNumber ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>1 Number</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-slate-500'}`}>
                {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>1 Special (@$!%*?&_-#)</span>
              </div>
              <div className={`flex items-center space-x-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
                {passwordsMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                <span>Passwords Match</span>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !isPasswordValid || !passwordsMatch || formData.otp.length !== 6}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center space-x-2 transition shadow-lg shadow-blue-600/20 mt-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating password...</span>
            </>
          ) : (
            <>
              <span>Reset Password & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-800 text-center">
        <Link to="/login" className="text-xs font-medium text-slate-400 hover:text-white transition">
          &larr; Cancel and return to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};
