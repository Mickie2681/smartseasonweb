import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi } from '../services/apiHelpers';
import StatusBadge from '../components/StatusBadge';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div style={styles.center}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={{color: 'white', background: 'none', WebkitTextFillColor: 'white'}}>SmartSeason Dashboard</h1>
        <div>
          <span style={styles.user}>{user?.first_name || user?.username} ({user?.role})</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.statsGrid}>
          <div style={styles.card}>
            <h3 style={{color: '#000000'}}>Total Fields</h3>
            <p style={styles.bigNumber}>{stats?.total_fields || 0}</p>
          </div>

          <div style={styles.card}>
            <h3 style={{color: '#000000'}}>By Status</h3>
            <div style={styles.statusList}>
              {Object.entries(stats?.by_status || {}).map(([status, count]) => (
                <div key={status} style={styles.statusItem}>
                  <StatusBadge status={status} />
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{color: '#000000'}}>By Stage</h3>
            <div style={styles.stageList}>
              {Object.entries(stats?.by_stage || {}).map(([stage, count]) => (
                <div key={stage} style={styles.stageItem}>
                  <span style={styles.stageBadge}>{stage.replace('_', ' ').toUpperCase()}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.card}>
            <h3 style={{color: '#000000'}}>By Crop</h3>
            <div style={styles.cropList}>
              {Object.entries(stats?.by_crop || {}).map(([crop, count]) => (
                <div key={crop} style={styles.cropItem}>
                  <span>{crop}</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.recent}>
          <h2 style={{color: '#000000'}}>Recent Updates</h2>
          {stats?.recent_updates?.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Agent</th>
                  <th>Stage</th>
                  <th>Notes</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_updates.map((update) => (
                  <tr key={update.id}>
                    <td>{update.field_name}</td>
                    <td>{update.agent_name || update.agent?.username}</td>
                    <td><StatusBadge status={update.stage} /></td>
                    <td style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={update.notes || ''}>
                      {update.notes || '-'}
                    </td>
                    <td>{new Date(update.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No recent updates.</p>
          )}
        </section>

        {user?.role === 'admin' && (
          <section style={styles.actions}>
            <h2 style={{color: '#000000'}}>Admin Actions</h2>
            <div style={styles.buttonGroup}>
              <button onClick={() => navigate('/fields')} style={styles.primaryBtn}>
                Manage Fields
              </button>
              <button onClick={() => navigate('/register')} style={styles.secondaryBtn}>
                Add New User
              </button>
            </div>
          </section>
        )}

        {user?.role === 'agent' && (
          <section style={styles.actions}>
            <h2 style={{color: '#000000'}}>Your Actions</h2>
            <div style={styles.buttonGroup}>
              <button onClick={() => navigate('/fields')} style={styles.primaryBtn}>
                My Fields
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F9FAFB 0%, #E0E7FF 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
    color: 'white',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  user: {
    marginRight: '1rem',
    fontWeight: '500',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  main: {
    padding: '2rem',
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    boxSizing: 'border-box',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.125rem',
    color: '#6B7280',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    transition: 'all 0.3s ease',
    color: '#000000',
  },
  bigNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    margin: 0,
  },
   statusList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#000000',
  },
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #F3F4F6',
    color: '#000000',
  },
  stageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#000000',
  },
  stageItem: {
    display: 'flex',
    justifyContent: 'space-between',
    textTransform: 'capitalize',
    padding: '0.5rem 0',
    borderBottom: '1px solid #F3F4F6',
    color: '#000000',
  },
  stageBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    color: '#3730A3',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  cropList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  cropItem: {
    display: 'flex',
    justifyContent: 'space-between',
    textTransform: 'capitalize',
    padding: '0.5rem 0',
    borderBottom: '1px solid #F3F4F6',
    color: '#000000',
  },
  recent: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    marginBottom: '2rem',
    color: '#000000',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    marginTop: '1rem',
    color: '#000000',
  },
  actions: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    color: '#000000',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  primaryBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
  },
  secondaryBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
  },
};

export default Dashboard;
