import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Adding token to request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response received for:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('Response error for:', error.config?.url, error.response?.status);
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Attempting to refresh token...');

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          console.log('No refresh token found');
          throw new Error('No refresh token');
        }

        const { data } = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken,
        });
        console.log('Token refresh successful');

        localStorage.setItem('token', data.access);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        console.log('Retrying original request with new token');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
