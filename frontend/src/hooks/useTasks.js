import { useState, useCallback } from 'react';
import api from '../api/axios';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/tasks', { params });
      setTasks(res.data.tasks);
      setTotal(res.data.total);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await api.post('/tasks', data);
    return res.data.task;
  }, []);

  const updateTask = useCallback(async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data.task;
  }, []);

  const deleteTask = useCallback(async (id) => {
    await api.delete(`/tasks/${id}`);
  }, []);

  return { tasks, total, loading, error, fetchTasks, createTask, updateTask, deleteTask };
};

export default useTasks;
