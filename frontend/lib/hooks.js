import { useState, useCallback } from 'react';
import api from '@/lib/api';

// Auth Hooks
export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const register = useCallback(async (firstName, lastName, email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/register', {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      const { tokens, user } = response.data;
      localStorage.setItem('token', tokens.access);
      localStorage.setItem('user', JSON.stringify(user));
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return { register, login, logout, loading, error };
};

// Detection Hooks
export const useDetection = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeImage = useCallback(async (file, email) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);

      const response = await api.post('/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Image analysis failed';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyzeImage, loading, error };
};

// History Hooks
export const useHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getHistory = useCallback(async (email, search = '', dateFrom = '', dateTo = '') => {
    setLoading(true);
    setError('');
    try {
      const params = { email };
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('/history', { params });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch history';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteItem = useCallback(async (itemId) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.delete(`/history/${itemId}`);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete item';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getHistory, deleteItem, loading, error };
};

// Profile Hooks
export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getProfile = useCallback(async (email) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/profile', { params: { email } });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch profile';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (email, firstName, lastName, password) => {
    setLoading(true);
    setError('');
    try {
      const data = { email };
      if (firstName) data.first_name = firstName;
      if (lastName) data.last_name = lastName;
      if (password) data.password = password;

      const response = await api.put('/profile/update', data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update profile';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getProfile, updateProfile, loading, error };
};

// Stats Hooks
export const useStats = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getStats = useCallback(async (email) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/stats', { params: { email } });
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch stats';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getStats, loading, error };
};
