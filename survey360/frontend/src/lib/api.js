import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('survey360-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (email, password, name) => api.post('/auth/register', { email, password, name }),
  me: () => api.get('/auth/me'),
};

// Organizations API
export const orgAPI = {
  list: () => api.get('/organizations'),
  create: (data) => api.post('/organizations', data),
  get: (id) => api.get(`/organizations/${id}`),
  update: (id, data) => api.put(`/organizations/${id}`, data),
};

// Surveys API
export const surveyAPI = {
  list: (orgId) => api.get(`/surveys?org_id=${orgId}`),
  get: (id) => api.get(`/surveys/${id}`),
  create: (data) => api.post('/surveys', data),
  update: (id, data) => api.put(`/surveys/${id}`, data),
  delete: (id) => api.delete(`/surveys/${id}`),
  publish: (id) => api.post(`/surveys/${id}/publish`),
  duplicate: (id, name) => api.post(`/surveys/${id}/duplicate`, { name }),
};

// Responses API
export const responseAPI = {
  list: (surveyId, params) => api.get(`/surveys/${surveyId}/responses`, { params }),
  get: (surveyId, responseId) => api.get(`/surveys/${surveyId}/responses/${responseId}`),
  submit: (surveyId, data) => api.post(`/surveys/${surveyId}/responses`, data),
  export: (surveyId, format) => api.get(`/surveys/${surveyId}/export?format=${format}`, { responseType: 'blob' }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: (orgId) => api.get(`/dashboard/stats?org_id=${orgId}`),
  getRecentActivity: (orgId, limit = 10) => api.get(`/dashboard/activity?org_id=${orgId}&limit=${limit}`),
};

export default api;
