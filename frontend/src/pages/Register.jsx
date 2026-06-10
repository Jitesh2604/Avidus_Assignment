import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.role);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <span style={styles.logo}>TaskFlow</span>
        </div>
        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.sub}>Get started with TaskFlow</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required style={styles.input} placeholder="John Doe" />

          <label style={styles.label}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={styles.input} placeholder="you@example.com" />

          <label style={styles.label}>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required style={styles.input} placeholder="Min 6 characters" />

          <label style={styles.label}>Account Type</label>
          <select name="role" value={form.role} onChange={handleChange} style={styles.select}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.footerLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', padding: '1rem' },
  card: { background: '#fff', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' },
  logoRow: { textAlign: 'center', marginBottom: '1rem' },
  logo: { fontSize: '1.5rem', fontWeight: 800, color: '#4f46e5' },
  heading: { margin: '0 0 0.25rem', fontSize: '1.5rem', color: '#111827', textAlign: 'center' },
  sub: { margin: '0 0 1.5rem', color: '#6b7280', textAlign: 'center', fontSize: '0.9rem' },
  error: { background: '#fee2e2', color: '#dc2626', padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { fontSize: '0.85rem', fontWeight: 600, color: '#374151' },
  input: { padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  select: { padding: '0.6rem 0.85rem', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  btn: { marginTop: '0.5rem', padding: '0.75rem', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#6b7280' },
  footerLink: { color: '#4f46e5', fontWeight: 600, textDecoration: 'none' },
};

export default Register;
