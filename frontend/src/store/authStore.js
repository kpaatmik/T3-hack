import { create } from 'zustand';
import api from '../utils/axios';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting login with:', credentials);
      const { data } = await api.post('/token/', credentials);
      console.log('Token response:', data);
      
      if (!data.access || !data.refresh) {
        throw new Error('Invalid token response from server');
      }

      localStorage.setItem('token', data.access);
      localStorage.setItem('refresh', data.refresh);
      
      console.log('Fetching user profile...');
      const userResponse = await api.get('/users/profile/');
      console.log('User profile response:', userResponse.data);

      set({
        user: userResponse.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('Login successful, current state:', get());
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message ||
                         error.message ||
                         'An error occurred during login';
      
      set({
        user: null,
        isAuthenticated: false,
        error: errorMessage,
        isLoading: false,
      });
      throw error; // Propagate the error to handle it in the component
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    set({ 
      user: null, 
      isAuthenticated: false,
      error: null,
    });
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Attempting registration with:', userData);
      const response = await api.post('/users/register/', userData);
      console.log('Registration response:', response.data);

      await useAuthStore.getState().login({
        username: userData.username,
        password: userData.password,
      });
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.message ||
                         error.message ||
                         'An error occurred during registration';
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error; // Propagate the error to handle it in the component
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found during checkAuth');
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null,
      });
      return;
    }

    try {
      console.log('Checking authentication status...');
      const userResponse = await api.get('/users/profile/');
      console.log('User profile response during checkAuth:', userResponse.data);

      set({
        user: userResponse.data,
        isAuthenticated: true,
        error: null,
      });
      console.log('Authentication check successful, current state:', get());
    } catch (error) {
      console.error('Authentication check error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh');
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null,
      });
      throw error; // Propagate the error to handle it in the component
    }
  },
}));

export default useAuthStore;
