import { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import useAdmin from '../../hooks/useAdmin';

const actionColor = {
  USER_LOGIN: '#3b82f6',
  USER_LOGOUT: '#6b7280',
  USER_REGISTER: '#10b981',
  TASK_CREATED: '#4f46e5',
  TASK_UPDATED: '#f59e0b',
  TASK_DELETED: '#ef4444',
  USER_STATUS_UPDATED: '#f97316',
  USER_DELETED: '#dc2626',
};

const actionIcon = {
  USER_LOGIN: '🔑',
  USER_LOGOUT: '👋',
  USER_REGISTER: '🎉',
  TASK_CREATED: '➕',
  TASK_UPDATED: '✏️',
  TASK_DELETED: '🗑️',
  USER_STATUS_UPDATED: '🔄',
  USER_DELETED: '❌',
};

const ActivityLogs = () => {
  const { getActivityLogs, loading, error } = useAdmin();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ action: '' });

  const load = useCallback(async () => {
    try {
      const params = { limit: 100 };
      if (filters.action) params.action = filters.action;
      const data = await getActivityLogs(params);
      setLogs(data.logs);
      setTotal(data.total);
    } catch {}
  }, [filters, getActivityLogs]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Activity Logs</h1>
            <p style={styles.sub}>{total} log{total !== 1 ? 's' : ''} recorded</p>
          </div>
        </div>

        <div style={styles.filters}>
          <select value={filters.action} onChange={(e) => setFilters({ action: e.target.value })} style={styles.filterSelect}>
            <option value="">All Actions</option>
            <option value="USER_LOGIN">Login</option>
            <option value="USER_REGISTER">Register</option>
            <option value="TASK_CREATED">Task Created</option>
            <option value="TASK_UPDATED">Task Updated</option>
            <option value="TASK_DELETED">Task Deleted</option>
            <option value="USER_STATUS_UPDATED">Status Updated</option>
            <option value="USER_DELETED">User Deleted</option>
          </select>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.center}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={styles.empty}>No activity logs found.</div>
        ) : (
          <div style={styles.logList}>
            {logs.map((log) => (
              <div key={log._id} style={styles.logItem}>
                <div style={styles.logLeft}>
                  <span style={styles.logIcon}>{actionIcon[log.action] || '📌'}</span>
                  <div>
                    <div style={styles.logDesc}>{log.description}</div>
                    <div style={styles.logMeta}>
                      <span style={styles.logUser}>{log.user?.name || 'Unknown'}</span>
                      <span style={styles.logDot}>•</span>
                      <span style={styles.logEmail}>{log.user?.email || ''}</span>
                      {log.ipAddress && (
                        <>
                          <span style={styles.logDot}>•</span>
                          <span style={styles.logIp}>{log.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div style={styles.logRight}>
                  <span style={{ ...styles.actionBadge, background: (actionColor[log.action] || '#6b7280') + '15', color: actionColor[log.action] || '#6b7280' }}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                  <div style={styles.logTime}>{new Date(log.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', background: '#f8fafc' },
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem' },
  header: { marginBottom: '1.5rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  filterSelect: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  center: { textAlign: 'center', color: '#6b7280', padding: '3rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#fff', borderRadius: '12px' },
  logList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  logItem: { background: '#fff', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', flexWrap: 'wrap', gap: '0.5rem' },
  logLeft: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem' },
  logIcon: { fontSize: '1.25rem', lineHeight: 1, marginTop: '0.1rem' },
  logDesc: { fontWeight: 600, color: '#111827', fontSize: '0.9rem' },
  logMeta: { display: 'flex', gap: '0.4rem', alignItems: 'center', marginTop: '0.2rem', flexWrap: 'wrap' },
  logUser: { fontSize: '0.8rem', fontWeight: 600, color: '#4f46e5' },
  logEmail: { fontSize: '0.8rem', color: '#9ca3af' },
  logIp: { fontSize: '0.8rem', color: '#9ca3af' },
  logDot: { color: '#d1d5db', fontSize: '0.8rem' },
  logRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' },
  actionBadge: { fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700, letterSpacing: '0.03em' },
  logTime: { fontSize: '0.78rem', color: '#9ca3af' },
};

export default ActivityLogs;
