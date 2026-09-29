/**
 * Centralized API & Real-time Socket configuration for SupportPulse
 *
 * Production environment variables:
 * - VITE_API_URL: e.g. https://supportpulse-backend.onrender.com
 * - VITE_SOCKET_URL: e.g. https://supportpulse-backend.onrender.com
 *
 * Automatically normalizes trailing slashes and '/api' paths so that:
 * - API requests always point cleanly to <BACKEND_URL>/api
 * - Socket.IO always connects to root <BACKEND_URL>
 */

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return url.trim().replace(/\/+$/, '');
};

// Base backend URL without trailing slash (e.g. "https://supportpulse-backend.onrender.com")
const envApiUrl = normalizeUrl(import.meta.env.VITE_API_URL);
const envSocketUrl = normalizeUrl(import.meta.env.VITE_SOCKET_URL);

// In local dev without env vars, fallback to empty string (which uses Vite dev proxy)
export const BACKEND_URL = envApiUrl || '';

// Centralized API Base URL for all Axios/REST endpoints
export const API_BASE_URL = BACKEND_URL
  ? (BACKEND_URL.endsWith('/api') ? BACKEND_URL : `${BACKEND_URL}/api`)
  : '/api';

// Centralized Socket.IO URL (connects to the server root)
export const SOCKET_URL = envSocketUrl
  || (BACKEND_URL ? BACKEND_URL.replace(/\/api$/, '') : '')
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:5000'
      : 'https://supportpulse-backend.onrender.com');
