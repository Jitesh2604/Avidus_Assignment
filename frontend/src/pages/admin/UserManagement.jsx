import { useEffect, useState, useCallback } from 'react';
import Navbar from '../../components/Navbar';
import useAdmin from '../../hooks/useAdmin';

const UserManagement = () => {
  const { getUsers, updateUserStatus, deleteUser, loading, error } = useAdmin();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ status: '', role: '' });
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.role) params.role = filters.role;
      const data = await getUsers(params);
      setUsers(data.users);
      setTotal(data.total);
    } catch {}
  }, [filters, getUsers]);

  useEffect(() => { load(); }, [load]);

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Set ${user.name}'s account to ${newStatus}?`)) return;
    try {
      await updateUserStatus(user._id, newStatus);
      showToast(`User ${newStatus === 'active' ? 'activated' : 'deactivated'}.`);
      load();
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This will also delete all their tasks.`)) return;
    try {
      await deleteUser(user._id);
      showToast('User deleted.');
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
            <h1 style={styles.heading}>User Management</h1>
            <p style={styles.sub}>{total} user{total !== 1 ? 's' : ''} registered</p>
          </div>
        </div>

        <div style={styles.filters}>
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} style={styles.filterSelect}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filters.role} onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))} style={styles.filterSelect}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {loading ? (
          <div style={styles.center}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={styles.empty}>No users found.</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.thead}>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Joined</th>
                  <th style={styles.th}>Last Login</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={styles.tr}>
                    <td style={styles.td}><strong>{u.name}</strong></td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}>{u.role}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={u.status === 'active' ? styles.badgeActive : styles.badgeInactive}>{u.status}</span>
                    </td>
                    <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
                    <td style={styles.td}>
                      <div style={styles.actionGroup}>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleStatusToggle(u)}
                            style={u.status === 'active' ? styles.deactivateBtn : styles.activateBtn}
                          >
                            {u.status === 'active' ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDelete(u)} style={styles.deleteBtn}>Delete</button>
                        )}
                      </div>
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
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  heading: { margin: 0, fontSize: '1.75rem', color: '#111827' },
  sub: { margin: '0.25rem 0 0', color: '#6b7280' },
  filters: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  filterSelect: { padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' },
  center: { textAlign: 'center', color: '#6b7280', padding: '3rem' },
  empty: { textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#fff', borderRadius: '12px' },
  tableWrap: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#f9fafb' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' },
  tr: { borderBottom: '1px solid #f3f4f6' },
  td: { padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#374151', verticalAlign: 'middle' },
  actionGroup: { display: 'flex', gap: '0.4rem' },
  activateBtn: { padding: '0.3rem 0.6rem', background: '#d1fae5', color: '#065f46', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  deactivateBtn: { padding: '0.3rem 0.6rem', background: '#fef3c7', color: '#92400e', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  deleteBtn: { padding: '0.3rem 0.6rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 },
  badgeAdmin: { padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#fee2e2', color: '#dc2626' },
  badgeUser: { padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#ede9fe', color: '#7c3aed' },
  badgeActive: { padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#d1fae5', color: '#065f46' },
  badgeInactive: { padding: '0.2rem 0.5rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, background: '#f3f4f6', color: '#6b7280' },
  toast: { position: 'fixed', bottom: '1.5rem', right: '1.5rem', background: '#1e1b4b', color: '#fff', padding: '0.75rem 1.25rem', borderRadius: '8px', zIndex: 300, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
};

export default UserManagement;
