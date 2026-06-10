import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import useAdmin from '../../hooks/useAdmin';

const StatCard = ({ label, value, color, icon }) => (
  <div style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}>
    <div style={styles.statTop}>
      <span style={styles.statIcon}>{icon}</span>
      <div style={{ ...styles.statValue, color }}>{value ?? '—'}</div>
    </div>
    <div style={styles.statLabel}>{label}</div>
  </div>
);

const AdminDashboard = () => {
  const { getStats, loading, error } = useAdmin();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats).catch(() => {});
  }, [getStats]);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.pageHeader}>
          <h1 style={styles.heading}>Admin Overview</h1>
          <p style={styles.sub}>Platform-wide analytics and statistics</p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.center}>Loading stats...</div>
        ) : (
          <div style={styles.statsGrid}>
            <StatCard label="Total Users" value={stats?.totalUsers} color="#4f46e5" icon="👥" />
            <StatCard label="Total Tasks" value={stats?.totalTasks} color="#0891b2" icon="📋" />
            <StatCard label="Completed" value={stats?.completedTasks} color="#10b981" icon="✅" />
            <StatCard label="Pending" value={stats?.pendingTasks} color="#f59e0b" icon="⏳" />
            <StatCard label="In Progress" value={stats?.inProgressTasks} color="#3b82f6" icon="🔄" />
          </div>
        )}

        <div style={styles.quickLinks}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.linkGrid}>
            {[
              { href: '/admin/users', label: 'Manage Users', desc: 'View, activate/deactivate, delete users', color: '#4f46e5' },
              { href: '/admin/tasks', label: 'Monitor Tasks', desc: 'View all tasks across all users', color: '#0891b2' },
              { href: '/admin/activity', label: 'Activity Logs', desc: 'Track all system activity', color: '#7c3aed' },
            ].map((item) => (
              <a key={item.href} href={item.href} style={{ ...styles.quickCard, borderTop: `4px solid ${item.color}` }}>
                <div style={{ ...styles.quickLabel, color: item.color }}>{item.label}</div>
                <div style={styles.quickDesc}>{item.desc}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  pageHeader: { marginBottom: '2rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' },
  center: { textAlign: 'center', color: '#6b7280', padding: '3rem' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' },
  statCard: { background: '#fff', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statIcon: { fontSize: '1.5rem' },
  statValue: { fontSize: '2rem', fontWeight: 800 },
  statLabel: { fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' },
  quickLinks: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  sectionTitle: { margin: '0 0 1rem', fontSize: '1.1rem', color: '#111827' },
  linkGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  quickCard: { padding: '1.25rem', borderRadius: '10px', background: '#f9fafb', textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s' },
  quickLabel: { fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' },
  quickDesc: { fontSize: '0.85rem', color: '#6b7280' },
};

export default AdminDashboard;
