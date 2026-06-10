import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to={isAdmin ? '/admin' : '/dashboard'} style={styles.brandLink}>
          TaskFlow
        </Link>
      </div>

      <div style={styles.links}>
        {user && !isAdmin && (
          <>
            <Link to="/dashboard" style={isActive('/dashboard') ? styles.activeLink : styles.link}>Dashboard</Link>
            <Link to="/tasks" style={isActive('/tasks') ? styles.activeLink : styles.link}>My Tasks</Link>
          </>
        )}

        {isAdmin && (
          <>
            <Link to="/admin" style={isActive('/admin') && location.pathname === '/admin' ? styles.activeLink : styles.link}>Overview</Link>
            <Link to="/admin/users" style={isActive('/admin/users') ? styles.activeLink : styles.link}>Users</Link>
            <Link to="/admin/tasks" style={isActive('/admin/tasks') ? styles.activeLink : styles.link}>All Tasks</Link>
            <Link to="/admin/activity" style={isActive('/admin/activity') ? styles.activeLink : styles.link}>Activity</Link>
          </>
        )}
      </div>

      <div style={styles.userInfo}>
        {user && (
          <>
            <span style={styles.userName}>{user.name}</span>
            <span style={isAdmin ? styles.badgeAdmin : styles.badgeUser}>{user.role}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '60px', background: '#1e1b4b', color: '#fff', position: 'sticky', top: 0, zIndex: 100 },
  brand: { fontWeight: 700, fontSize: '1.25rem' },
  brandLink: { color: '#a5b4fc', textDecoration: 'none' },
  links: { display: 'flex', gap: '1rem' },
  link: { color: '#c7d2fe', textDecoration: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem' },
  activeLink: { color: '#fff', textDecoration: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.9rem', background: '#4338ca' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontSize: '0.9rem', color: '#e0e7ff' },
  badgeAdmin: { fontSize: '0.7rem', background: '#dc2626', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 700 },
  badgeUser: { fontSize: '0.7rem', background: '#059669', color: '#fff', padding: '0.1rem 0.5rem', borderRadius: '20px', textTransform: 'uppercase', fontWeight: 700 },
  logoutBtn: { padding: '0.35rem 0.85rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
};

export default Navbar;
