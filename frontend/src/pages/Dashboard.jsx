import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useTasks from '../hooks/useTasks';
import Navbar from '../components/Navbar';

const StatCard = ({ label, value, color }) => (
  <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
    <div style={{ ...styles.statValue, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const { tasks, total, loading, fetchTasks } = useTasks();
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetchTasks({ limit: 5 });
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks.length || total > 0) {
      const pending = tasks.filter((t) => t.status === 'pending').length;
      const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
      const completed = tasks.filter((t) => t.status === 'completed').length;
      setStats({ pending, inProgress, completed });
    }
  }, [tasks, total]);

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const statusColor = { pending: '#f59e0b', 'in-progress': '#3b82f6', completed: '#10b981' };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.welcome}>
          <h1 style={styles.heading}>Welcome back, {user?.name}!</h1>
          <p style={styles.sub}>Here's a summary of your tasks.</p>
        </div>

        <div style={styles.statsGrid}>
          <StatCard label="Total Tasks" value={total} color="#4f46e5" />
          <StatCard label="Pending" value={stats.pending} color="#f59e0b" />
          <StatCard label="In Progress" value={stats.inProgress} color="#3b82f6" />
          <StatCard label="Completed" value={stats.completed} color="#10b981" />
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Recent Tasks</h2>
            <Link to="/tasks" style={styles.viewAll}>View All →</Link>
          </div>

          {loading ? (
            <div style={styles.center}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div style={styles.empty}>
              <p>No tasks yet.</p>
              <Link to="/tasks" style={styles.createLink}>Create your first task →</Link>
            </div>
          ) : (
            <div style={styles.taskList}>
              {tasks.map((t) => (
                <div key={t._id} style={styles.taskRow}>
                  <div style={styles.taskInfo}>
                    <span style={styles.taskTitle}>{t.title}</span>
                    {t.description && <span style={styles.taskDesc}>{t.description.slice(0, 60)}{t.description.length > 60 ? '...' : ''}</span>}
                  </div>
                  <div style={styles.taskMeta}>
                    <span style={{ ...styles.badge, background: priorityColor[t.priority] + '20', color: priorityColor[t.priority] }}>{t.priority}</span>
                    <span style={{ ...styles.badge, background: statusColor[t.status] + '20', color: statusColor[t.status] }}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' },
  welcome: { marginBottom: '2rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statValue: { fontSize: '2rem', fontWeight: 800 },
  statLabel: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  sectionTitle: { margin: 0, fontSize: '1.1rem', color: '#111827' },
  viewAll: { color: '#4f46e5', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  center: { textAlign: 'center', color: '#6b7280', padding: '2rem' },
  empty: { textAlign: 'center', padding: '2rem', color: '#6b7280' },
  createLink: { color: '#4f46e5', textDecoration: 'none', fontWeight: 600 },
  taskList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  taskRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' },
  taskInfo: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  taskTitle: { fontWeight: 600, color: '#111827', fontSize: '0.95rem' },
  taskDesc: { fontSize: '0.8rem', color: '#6b7280' },
  taskMeta: { display: 'flex', gap: '0.5rem' },
  badge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 600, textTransform: 'capitalize' },
};

export default Dashboard;
