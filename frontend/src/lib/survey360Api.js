import axios from 'axios';

// Survey360 uses the main backend's /api/survey360 routes
// In browser context, use window location origin or the REACT_APP_BACKEND_URL
const getApiBase = () => {
  // For production/preview, use the same origin
  if (typeof window !== 'undefined' && window.location.hostname.includes('preview.emergentagent.com')) {
    return window.location.origin;
  }
  return process.env.REACT_APP_BACKEND_URL || '';
};

const SURVEY360_API_URL = `${getApiBase()}/api/survey360`;

const survey360Api = axios.create({
  baseURL: SURVEY360_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
survey360Api.interceptors.request.use((config) => {
  // Get token from auth-storage (the main auth store)
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Failed to parse auth data:', e);
    }
  }
  return config;
});

// Response interceptor for error handling
survey360Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect on 401 if it's not a public endpoint
      // Don't redirect on public pages like pricing that may optionally fetch user data
      const isPublicPage = window.location.pathname.includes('/pricing') || 
                           window.location.pathname.includes('/demo') ||
                           window.location.pathname.includes('/help');
      if (!isPublicPage) {
        localStorage.removeItem('survey360-auth');
        window.location.href = '/solutions/survey360/login';
      }
    }
    return Promise.reject(error);
  }
);

export default survey360Api;
