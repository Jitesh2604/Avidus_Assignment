import { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import useAdmin from '../../hooks/useAdmin';

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const statusColor = { pending: '#f59e0b', 'in-progress': '#3b82f6', completed: '#10b981' };

const TaskMonitoring = () => {
  const { getAllTasks, deleteAnyTask, loading, error } = useAdmin();
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      const data = await getAllTasks(params);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch {}
  }, [filters, getAllTasks]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteAnyTask(task._id);
      showToast('Task deleted.');
      load();
    } catch (err) {
      showToast(err.message);
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      {toast && <div style={styles.toast}>{toast}</div>}
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Task Monitoring</h1>
            <p style={styles.sub}>{total} task{total !== 1 ? 's' : ''} across all users</p>
          </div>
        </div>

        <div style={styles.filters}>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} style={styles.filterSelect}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))} style={styles.filterSelect}>
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.center}>Loading...</div>
        ) : tasks.length === 0 ? (
          <div style={styles.empty}>No tasks found.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Priority</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Created</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.taskTitle}>{t.title}</div>
                      {t.description && <div style={styles.taskDesc}>{t.description.slice(0, 60)}...</div>}
                    </td>
                    <td style={styles.td}>
                      <div style={styles.ownerName}>{t.owner?.name || 'Unknown'}</div>
                      <div style={styles.ownerEmail}>{t.owner?.email || ''}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: statusColor[t.status] + '20', color: statusColor[t.status] }}>{t.status}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, background: priorityColor[t.priority] + '20', color: priorityColor[t.priority] }}>{t.priority}</span>
                    </td>
                    <td style={styles.td}>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td style={styles.td}>{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleDelete(t)} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' },
  header: { marginBottom: '1.5rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  filterSelect: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  center: { textAlign: 'center', color: '#6b7280', padding: '3rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#fff', borderRadius: '12px' },
  tableWrap: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  thead: { background: '#f9fafb' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#374151', verticalAlign: 'middle' },
  taskTitle: { fontWeight: 600, color: '#111827' },
  taskDesc: { fontSize: '0.78rem', color: '#9ca3af', marginTop: '0.15rem' },
  ownerName: { fontWeight: 600 },
  ownerEmail: { fontSize: '0.78rem', color: '#9ca3af' },
  badge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600, textTransform: 'capitalize' },
  deleteBtn: { padding: '0.3rem 0.7rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1e1b4b', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 300, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
};

export default TaskMonitoring;
