import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('supportpulse_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('supportpulse_access_token') || null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('supportpulse_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('supportpulse_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // Token might be invalid or expired; interceptor handles refresh or cleans up
          if (err.response?.status === 401 && !localStorage.getItem('supportpulse_refresh_token')) {
            clearSession();
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const saveSession = (tokens, userData) => {
    if (tokens?.accessToken) {
      localStorage.setItem('supportpulse_access_token', tokens.accessToken);
      setAccessToken(tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      localStorage.setItem('supportpulse_refresh_token', tokens.refreshToken);
    }
    if (userData) {
      localStorage.setItem('supportpulse_user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('supportpulse_access_token');
    localStorage.removeItem('supportpulse_refresh_token');
    localStorage.removeItem('supportpulse_user');
    setAccessToken(null);
    setUser(null);
  };

  // Password Login
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        saveSession(res.data.tokens, res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Invalid credentials';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Email OTP Login
  const loginWithEmailOtp = async (email, otp) => {
    setError(null);
    try {
      const res = await authApi.verifyEmailLoginOtp(email, otp);
      if (res.success && res.data) {
        saveSession(res.data.tokens, res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Verification failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Phone OTP Login
  const loginWithPhoneOtp = async (phone, otp) => {
    setError(null);
    try {
      const res = await authApi.verifyPhoneLoginOtp(phone, otp);
      if (res.success && res.data) {
        saveSession(res.data.tokens, res.data.user);
        return { success: true, user: res.data.user };
      }
      throw new Error(res.message || 'Verification failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Register
  const register = async (formData) => {
    setError(null);
    try {
      const res = await authApi.register(formData);
      return {
        success: true,
        message: res.message,
        user: res.data?.user,
      };
    } catch (err) {
      let message = err.response?.data?.message || err.message || 'Registration failed';
      if (err.response?.data?.errors?.length) {
        message = err.response.data.errors.map((e) => e.message).join('. ');
      }
      setError(message);
      return { success: false, error: message };
    }
  };

  // Verify Email OTP
  const verifyEmail = async (email, otp) => {
    setError(null);
    try {
      const res = await authApi.verifyEmailOtp(email, otp);
      if (res.success) {
        if (user && user.email === email) {
          const updated = { ...user, isEmailVerified: true };
          setUser(updated);
          localStorage.setItem('supportpulse_user', JSON.stringify(updated));
        }
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Email verification failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Email verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Verify Phone OTP
  const verifyPhone = async (phone, otp) => {
    setError(null);
    try {
      const res = await authApi.verifyPhoneOtp(phone, otp);
      if (res.success) {
        if (user && user.phone === phone) {
          const updated = { ...user, isPhoneVerified: true };
          setUser(updated);
          localStorage.setItem('supportpulse_user', JSON.stringify(updated));
        }
        return { success: true, message: res.message };
      }
      throw new Error(res.message || 'Phone verification failed');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Phone verification failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  // Logout
  const logout = async () => {
    const refreshToken = localStorage.getItem('supportpulse_refresh_token');
    try {
      await authApi.logout(refreshToken);
    } catch (e) {
      // Ignored
    } finally {
      clearSession();
    }
  };

  const clearError = useCallback(() => setError(null), []);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!accessToken && !!user,
    role: user?.role || 'CUSTOMER',
    isLoading,
    error,
    login,
    loginWithEmailOtp,
    loginWithPhoneOtp,
    register,
    verifyEmail,
    verifyPhone,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
