import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fieldsApi, updatesApi } from '../services/apiHelpers';
import StatusBadge from '../components/StatusBadge';

const FieldDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [field, setField] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateData, setUpdateData] = useState({
    stage: 'planted',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchField();
    fetchHistory();
  }, [id]);

  const fetchField = async () => {
    try {
      const response = await fieldsApi.get(id);
      setField(response.data);
    } catch (err) {
      console.error('Failed to fetch field:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await updatesApi.getHistory(id);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch updates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await updatesApi.create({
        field: id,
        ...updateData,
      });
      setShowUpdateForm(false);
      fetchField();
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit update');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={styles.center}>Loading field details...</div>;
  }

  if (!field) {
    return <div style={styles.center}>Field not found.</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/fields')} style={styles.backBtn}>← Back to Fields</button>
        <h1>{field.name}</h1>
        <div style={{ width: '100px' }}></div></header>

      <main style={styles.main}>
        <div style={styles.infoGrid}>
          <div style={styles.card}>
            <h3>Crop Type</h3>
            <p style={styles.value}>{field.crop_type}</p>
          </div>
          <div style={styles.card}>
            <h3>Planting Date</h3>
            <p style={styles.value}>{new Date(field.planting_date).toLocaleDateString()}</p>
          </div>
          <div style={styles.card}>
            <h3>Current Stage</h3>
            <p style={styles.value}><span style={styles.stageBadge}>{field.current_stage}</span></p>
          </div>
          <div style={styles.card}>
            <h3>Status</h3>
            <p style={styles.value}><StatusBadge status={field.status || 'active'} /></p>
          </div>
          <div style={styles.card}>
            <h3>Assigned Agent</h3>
            <p style={styles.value}>{field.agent_name || 'Unassigned'}</p>
          </div>
          <div style={styles.card}>
            <h3>Days Since Planting</h3>
            <p style={styles.value}>{field.days_since_planting} days</p>
          </div>
          <div style={styles.card}>
            <h3>Environmental Conditions</h3>
            <p style={styles.value}>
              {field.environmental_conditions && field.environmental_conditions.length > 0 ? (
                <span>
                  {field.environmental_conditions.map((condition, idx) => (
                    <span key={idx} style={{
                      ...styles.conditionBadge,
                      background: condition === 'none' ? '#4CAF50' : '#ff9800'
                    }}>
                      {condition}
                    </span>
                  ))}
                </span>
              ) : (
                <span style={{ color: '#999' }}>None</span>
              )}
            </p>
          </div>
        </div>

        {user?.role === 'agent' && field.assigned_agent === user.id && (
          <section style={styles.updateSection}>
            <div style={styles.sectionHeader}>
              <h2>Submit Update</h2>
              {!showUpdateForm && (
                <button onClick={() => setShowUpdateForm(true)} style={styles.primaryBtn}>
                  + New Update
                </button>
              )}
            </div>

            {showUpdateForm && (
              <form onSubmit={handleUpdateSubmit} style={styles.updateForm}>
                {error && <div style={styles.error}>{error}</div>}
                <div style={styles.formGroup}>
                  <label>Current Stage *</label>
                  <select
                    value={updateData.stage}
                    onChange={(e) => setUpdateData({ ...updateData, stage: e.target.value })}
                    required
                  >
                    <option value="planted">Planted</option>
                    <option value="growing">Growing</option>
                    <option value="ready">Ready</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label>Notes / Observations</label>
                  <textarea
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    rows="4"
                    placeholder="Describe field conditions, any issues, etc."
                  />
                </div>
                <div style={styles.formActions}>
                  <button type="submit" disabled={submitting} style={styles.saveBtn}>
                    {submitting ? 'Submitting...' : 'Submit Update'}
                  </button>
                  <button type="button" onClick={() => setShowUpdateForm(false)} style={styles.cancelBtn}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        <section style={styles.historySection}>
          <h2>Update History</h2>
          {history.length > 0 ? (
            <div style={styles.timeline}>
              {history.map((update) => (
                <div key={update.id} style={styles.timelineItem}>
                  <div style={styles.timelineHeader}>
                    <strong>{update.agent_name || update.agent?.username}</strong>
                    <span style={styles.date}>{new Date(update.created_at).toLocaleString()}</span>
                  </div>
                  <p><strong>Stage: </strong> <StatusBadge status={update.stage} /></p>
                  {update.notes && <p style={styles.notes}>{update.notes}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No updates recorded yet.</p>
          )}
        </section>
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
  backBtn: {
    background: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '0.5rem 1rem',
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
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    color: '#000000',
  },
  value: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1F2937',
    marginTop: '0.5rem',
  },
  stageBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
    color: '#3730A3',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  updateSection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    marginBottom: '2rem',
    color: '#000000',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  primaryBtn: {
    padding: '0.625rem 1.25rem',
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
  },
  updateForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginTop: '1.5rem',
    padding: '1.5rem',
    background: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
  },
  formGroup: {
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
  select: {
    padding: '0.75rem 1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    background: 'white',
    cursor: 'pointer',
  },
  textarea: {
    padding: '0.75rem 1rem',
    border: '2px solid #E5E7EB',
    borderRadius: '8px',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    fontFamily: 'inherit',
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  saveBtn: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
  },
  cancelBtn: {
    padding: '0.75rem 1.5rem',
    background: '#9CA3AF',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'all 0.2s ease',
  },
  error: {
    color: '#991B1B',
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
  },
  historySection: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    color: '#000000',
  },
  timeline: {
    marginTop: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  timelineItem: {
    padding: '1.25rem',
    borderLeft: '4px solid #4F46E5',
    background: '#F9FAFB',
    borderRadius: '0 12px 12px 0',
    borderTop: '1px solid #E5E7EB',
    borderRight: '1px solid #E5E7EB',
    borderBottom: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
    alignItems: 'center',
  },
  date: {
    color: '#6B7280',
    fontSize: '0.875rem',
  },
  notes: {
    marginTop: '0.75rem',
    color: '#374151',
    whiteSpace: 'pre-wrap',
    padding: '0.75rem',
    background: 'white',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
  },
  conditionBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginRight: '0.5rem',
    color: 'white',
    textTransform: 'capitalize',
    letterSpacing: '0.025em',
  },
};

export default FieldDetail;
