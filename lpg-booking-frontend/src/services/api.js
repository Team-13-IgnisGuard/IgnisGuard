import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lpg_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch global error structures
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Session expired
      if (error.response.status === 401) {
        localStorage.removeItem('lpg_token');
        localStorage.removeItem('lpg_user');
        // Let the application redirect via state trigger if necessary
        window.dispatchEvent(new Event('auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
