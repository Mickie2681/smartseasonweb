import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Extract error message from various possible formats
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.non_field_errors) {
          setError(errorData.non_field_errors[0]);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else if (typeof errorData === 'string') {
          setError(errorData);
        } else {
          setError('Login failed. Please check your credentials.');
        }
      } else {
        setError('Network error. Is the backend running?');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>SmartSeason Login</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <p style={styles.footer}>
            Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
          </p>
        </form>
        <div style={styles.demo}>
          <p><strong>Demo Credentials:</strong></p>
          <p>Admin: admin / admin123</p>
          <p>Agent: agent / agent123</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #E0E7FF 0%, #F9FAFB 50%, #ECFDF5 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '100%',
    maxWidth: '420px',
    border: '1px solid #E5E7EB',
  },
  title: {
    textAlign: 'center',
    marginBottom: '2rem',
    background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontSize: '2rem',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  button: {
    padding: '0.875rem',
    background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
  },
  error: {
    color: '#991B1B',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#6B7280',
    fontSize: '0.875rem',
  },
  link: {
    color: '#4F46E5',
    textDecoration: 'none',
    fontWeight: '600',
  },
  demo: {
    marginTop: '1.5rem',
    padding: '1rem',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #E0E7FF 100%)',
    borderRadius: '12px',
    fontSize: '0.875rem',
    color: '#374151',
    border: '1px solid #E5E7EB',
  },
};

export default Login;
