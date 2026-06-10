import { useState, useCallback } from 'react';
import api from '../api/axios';

const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (fn) => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const msg = err.response?.data?.message || 'Request failed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(() => request(async () => {
    const res = await api.get('/admin/stats');
    return res.data.stats;
  }), [request]);

  const getUsers = useCallback((params = {}) => request(async () => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  }), [request]);

  const updateUserStatus = useCallback((id, status) => request(async () => {
    const res = await api.patch(`/admin/users/${id}/status`, { status });
    return res.data.user;
  }), [request]);

  const deleteUser = useCallback((id) => request(async () => {
    await api.delete(`/admin/users/${id}`);
  }), [request]);

  const getAllTasks = useCallback((params = {}) => request(async () => {
    const res = await api.get('/admin/tasks', { params });
    return res.data;
  }), [request]);

  const deleteAnyTask = useCallback((id) => request(async () => {
    await api.delete(`/admin/tasks/${id}`);
  }), [request]);

  const getActivityLogs = useCallback((params = {}) => request(async () => {
    const res = await api.get('/admin/activity-logs', { params });
    return res.data;
  }), [request]);

  return {
    loading,
    error,
    getStats,
    getUsers,
    updateUserStatus,
    deleteUser,
    getAllTasks,
    deleteAnyTask,
    getActivityLogs,
  };
};

export default useAdmin;
