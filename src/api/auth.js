import { apiClient } from './client';

export const authApi = {
  // Register a new customer
  register: async (payload) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
  },

  // Password Login
  login: async (payload) => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  // Email OTP Login
  requestEmailLoginOtp: async (email) => {
    const response = await apiClient.post('/auth/request-email-login-otp', { email });
    return response.data;
  },

  verifyEmailLoginOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-email-login-otp', { email, otp });
    return response.data;
  },

  // Phone OTP Login
  requestPhoneLoginOtp: async (phone) => {
    const response = await apiClient.post('/auth/request-phone-login-otp', { phone });
    return response.data;
  },

  verifyPhoneLoginOtp: async (phone, otp) => {
    const response = await apiClient.post('/auth/verify-phone-login-otp', { phone, otp });
    return response.data;
  },

  // Email & Phone Verification
  verifyEmailOtp: async (email, otp) => {
    const response = await apiClient.post('/auth/verify-email-otp', { email, otp });
    return response.data;
  },

  verifyPhoneOtp: async (phone, otp) => {
    const response = await apiClient.post('/auth/verify-phone-otp', { phone, otp });
    return response.data;
  },

  // Resend OTP
  resendOtp: async (identifier, purpose) => {
    const response = await apiClient.post('/auth/resend-otp', { identifier, purpose });
    return response.data;
  },

  // Forgot & Reset Password
  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (payload) => {
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },

  // Current User & Logout
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (refreshToken) => {
    try {
      const response = await apiClient.post('/auth/logout', { refreshToken });
      return response.data;
    } catch (e) {
      // Even if network fails, client logout will clear storage
      return { success: true };
    }
  },
};
