import { useState, useCallback } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';

// Auth Hooks (simple version - context handles the actual state)
export const useAuthActions = () => {
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
      toast.success('Registration successful! Please login.');
      return response.data;
    } catch (err) {
      let errorMsg = 'Registration failed';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginRequest = useCallback(async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      toast.success('Login successful!');
      return response.data;
    } catch (err) {
      let errorMsg = 'Login failed';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { register, loginRequest, loading, error };
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
      toast.success('Image analyzed successfully!');
      return response.data;
    } catch (err) {
      let errorMsg = 'Image analysis failed';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
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
  const [items, setItems] = useState([]);

  const getHistory = useCallback(async (email, search = '', dateFrom = '', dateTo = '') => {
    setLoading(true);
    setError('');
    try {
      const params = { email };
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await api.get('/history', { params });
      setItems(response.data);
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to fetch history';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
      setItems([]);
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
      toast.success('Detection deleted successfully');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to delete item';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getHistory, deleteItem, items, loading, error };
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
      let errorMsg = 'Failed to fetch profile';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.put('/profile/update', data);
      toast.success('Profile updated successfully!');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to update profile';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      }
      setError(errorMsg);
      toast.error(errorMsg);
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
  const [stats, setStats] = useState(null);

  const getStats = useCallback(async (email) => {
    if (!email) {
      setError('Email is required');
      return null;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.get('/stats', { params: { email } });
      setStats(response.data);
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to fetch stats';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(e => e.msg).join(', ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Stats fetch error:', err);
      setStats(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getStats, stats, loading, error };
};

export const useSubscription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getSubscriptionStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/subscription/status');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to fetch subscription status';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentOrder = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/orders', payload);
      toast.success(response.data.message || 'Payment order submitted');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to submit payment order';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/orders/me');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to fetch orders';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getSubscriptionStatus, createPaymentOrder, getMyOrders, loading, error };
};

export const useAdminOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getOrders = useCallback(async (status = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (status) params.status = status;
      const response = await api.get('/admin/orders', { params });
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to fetch admin orders';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reviewOrder = useCallback(async (orderId, payload) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.patch(`/admin/orders/${orderId}/review`, payload);
      toast.success(response.data.message || 'Order reviewed');
      return response.data;
    } catch (err) {
      let errorMsg = 'Failed to review order';
      if (err.response?.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { getOrders, reviewOrder, loading, error };
};
