import axios from 'axios';

// Survey360 uses a separate backend running on port 8002
const SURVEY360_API_URL = 'http://localhost:8002/api';

const survey360Api = axios.create({
  baseURL: SURVEY360_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
survey360Api.interceptors.request.use((config) => {
  const authData = localStorage.getItem('survey360-auth');
  if (authData) {
    try {
      const { state } = JSON.parse(authData);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Failed to parse auth data');
    }
  }
  return config;
});

// Response interceptor for error handling
survey360Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('survey360-auth');
      window.location.href = '/solutions/survey360/login';
    }
    return Promise.reject(error);
  }
);

export default survey360Api;
