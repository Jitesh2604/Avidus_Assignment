import { useEffect, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskModal from '../components/TaskModal';
import useTasks from '../hooks/useTasks';

const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const statusColor = { pending: '#f59e0b', 'in-progress': '#3b82f6', completed: '#10b981' };

const Tasks = () => {
  const { tasks, total, loading, error, fetchTasks, createTask, updateTask, deleteTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState('');

  const load = useCallback(() => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.priority) params.priority = filters.priority;
    fetchTasks(params);
  }, [filters, fetchTasks]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSave = async (data) => {
    if (editTask) {
      await updateTask(editTask._id, data);
      showToast('Task updated!');
    } else {
      await createTask(data);
      showToast('Task created!');
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(id);
    try {
      await deleteTask(id);
      showToast('Task deleted.');
      load();
    } catch {
      showToast('Failed to delete task.');
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditTask(null); setShowModal(true); };
  const openEdit = (t) => { setEditTask(t); setShowModal(true); };

  return (
    <div style={styles.page}>
      <Navbar />
      {toast && <div style={styles.toast}>{toast}</div>}

      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>My Tasks</h1>
            <p style={styles.sub}>{total} task{total !== 1 ? 's' : ''} total</p>
          </div>
          <button onClick={openCreate} style={styles.createBtn}>+ New Task</button>
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
          <div style={styles.empty}>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No tasks found.</p>
            <button onClick={openCreate} style={styles.createBtnSm}>Create your first task</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {tasks.map((t) => (
              <div key={t._id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={{ ...styles.badge, background: priorityColor[t.priority] + '20', color: priorityColor[t.priority] }}>{t.priority}</span>
                  <span style={{ ...styles.badge, background: statusColor[t.status] + '20', color: statusColor[t.status] }}>{t.status}</span>
                </div>
                <h3 style={styles.cardTitle}>{t.title}</h3>
                {t.description && <p style={styles.cardDesc}>{t.description.slice(0, 100)}{t.description.length > 100 ? '...' : ''}</p>}
                {t.dueDate && <p style={styles.dueDate}>Due: {new Date(t.dueDate).toLocaleDateString()}</p>}
                <div style={styles.cardActions}>
                  <button onClick={() => openEdit(t)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(t._id)} disabled={deleting === t._id} style={styles.deleteBtn}>
                    {deleting === t._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TaskModal task={editTask} onSave={handleSave} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  createBtn: { padding: '0.6rem 1.2rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' },
  createBtnSm: { padding: '0.5rem 1rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  filterSelect: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' },
  center: { textAlign: 'center', color: '#6b7280', padding: '4rem' },
  empty: { textAlign: 'center', padding: '4rem', color: '#6b7280' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  cardTop: { display: 'flex', gap: '0.5rem' },
  cardTitle: { margin: 0, fontSize: '1rem', color: '#111827', fontWeight: 700 },
  cardDesc: { margin: 0, fontSize: '0.85rem', color: '#6b7280' },
  dueDate: { margin: 0, fontSize: '0.8rem', color: '#9ca3af' },
  cardActions: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' },
  editBtn: { flex: 1, padding: '0.4rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  deleteBtn: { flex: 1, padding: '0.4rem', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 },
  badge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600, textTransform: 'capitalize' },
  toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1e1b4b', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 300, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
};

export default Tasks;
