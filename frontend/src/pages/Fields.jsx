import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fieldsApi } from '../services/apiHelpers';
import StatusBadge from '../components/StatusBadge';

const Fields = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    crop_type: 'corn',
    planting_date: '',
    current_stage: 'planted',
    assigned_agent: '',
    environmental_conditions: [],
  });
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchFields();
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchFields = async () => {
    try {
      const response = await fieldsApi.getAll();
      setFields(response.data);
    } catch (err) {
      console.error('Failed to fetch fields:', err);
    } finally {
      setLoading(false);
    }
  };

   const fetchUsers = async () => {
     try {
       const response = await fetch('http://localhost:8000/api/users/', {
         headers: {
           'Authorization': `Token ${localStorage.getItem('token')}`,
         },
       });
       if (response.ok) {
         const data = await response.json();
         setUsers(data);
       }
     } catch (err) {
       console.error('Failed to fetch users:', err);
     }
   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingField) {
        await fieldsApi.update(editingField.id, formData);
      } else {
        await fieldsApi.create(formData);
      }
      fetchFields();
      setShowForm(false);
      setEditingField(null);
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save field');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      crop_type: field.crop_type,
      planting_date: field.planting_date,
      current_stage: field.current_stage,
      assigned_agent: field.assigned_agent || '',
      environmental_conditions: field.environmental_conditions || [],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    try {
      await fieldsApi.delete(id);
      fetchFields();
    } catch (err) {
      alert('Failed to delete field');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      crop_type: 'corn',
      planting_date: '',
      current_stage: 'planted',
      environmental_conditions: [],
      assigned_agent: '',
    });
  };

  const getAgentName = (agentId) => {
    const agent = users.find(u => u.id === agentId);
    return agent ? `${agent.first_name} ${agent.last_name}`.trim() || agent.username : 'Unassigned';
  };

  if (loading) {
    return <div style={styles.center}>Loading fields...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>{user?.role === 'admin' ? 'All Fields' : 'My Fields'}</h1>
        {user?.role === 'admin' && (
          <button onClick={() => { setShowForm(true); setEditingField(null); resetForm(); }} style={styles.addBtn}>
            + Add Field
          </button>
        )}
      </header>

      <main style={styles.main}>
        {showForm && (
          <div style={styles.formCard}>
            <h2>{editingField ? 'Edit Field' : 'New Field'}</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              {error && <div style={styles.error}>{error}</div>}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Crop Type *</label>
                  <select
                    value={formData.crop_type}
                    onChange={(e) => setFormData({ ...formData, crop_type: e.target.value })}
                    required
                  >
                    <option value="corn">Corn</option>
                    <option value="wheat">Wheat</option>
                    <option value="soybeans">Soybeans</option>
                    <option value="rice">Rice</option>
                    <option value="cotton">Cotton</option>
                    <option value="barley">Barley</option>
                    <option value="oats">Oats</option>
                    <option value="potatoes">Potatoes</option>
                    <option value="tomatoes">Tomatoes</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>Planting Date *</label>
                  <input
                    type="date"
                    value={formData.planting_date}
                    onChange={(e) => setFormData({ ...formData, planting_date: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Current Stage *</label>
                  <select
                    value={formData.current_stage}
                    onChange={(e) => setFormData({ ...formData, current_stage: e.target.value })}
                    required
                  >
                    <option value="planted">Planted</option>
                    <option value="growing">Growing</option>
                    <option value="ready">Ready</option>
                    <option value="harvested">Harvested</option>
                  </select>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div style={styles.formGroup}>
                  <label>Assign to Field Agent</label>
                  <select
                    value={formData.assigned_agent}
                    onChange={(e) => setFormData({ ...formData, assigned_agent: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.filter(u => u.role === 'agent').map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.first_name} {agent.last_name} ({agent.username})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={styles.formGroup}>
                <label>Environmental Conditions</label>
                <div style={styles.checkboxGroup}>
                  {['stress', 'drought', 'pest', 'disease', 'damage', 'wilting', 'none'].map((condition) => (
                    <label key={condition} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.environmental_conditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // If 'none' is selected, clear other conditions
                            if (condition === 'none') {
                              setFormData({ ...formData, environmental_conditions: ['none'] });
                            } else {
                              // Remove 'none' if it was selected and adding other conditions
                              const newConditions = formData.environmental_conditions.filter(c => c !== 'none');
                              setFormData({ ...formData, environmental_conditions: [...newConditions, condition] });
                            }
                          } else {
                            setFormData({
                              ...formData,
                              environmental_conditions: formData.environmental_conditions.filter(c => c !== condition)
                            });
                          }
                        }}
                      />
                      <span style={{ textTransform: 'capitalize', marginLeft: '0.5rem' }}>{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={styles.formActions}>
                <button type="submit" style={styles.saveBtn}>{editingField ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingField(null); }} style={styles.cancelBtn}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Crop</th>
                <th>Planted</th>
                <th>Stage</th>
                <th>Status</th>
                {user?.role === 'admin' && <th>Agent</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.id}>
                  <td><strong>{field.name}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{field.crop_type}</td>
                  <td>{new Date(field.planting_date).toLocaleDateString()}</td>
                  <td><span style={styles.stageBadge}>{field.current_stage}</span></td>
                  <td><StatusBadge status={field.status || 'active'} /></td>
                  {user?.role === 'admin' && (
                    <td>{field.agent_name || 'Unassigned'}</td>
                  )}
                  <td>
                    <Link to={`/fields/${field.id}`} style={styles.viewLink}>View</Link>
                    {user?.role === 'admin' && (
                      <>
                        {' '}
                        <button onClick={() => handleEdit(field)} style={styles.editBtn}>Edit</button>
                        {' '}
                        <button onClick={() => handleDelete(field.id)} style={styles.deleteBtn}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {fields.length === 0 && (
            <p style={styles.empty}>No fields found. {user?.role === 'admin' ? 'Add your first field!' : 'Contact an admin to get assigned to fields.'}</p>
          )}
        </div>
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
  addBtn: {
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
  formCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
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
    width: '100%',
    boxSizing: 'border-box',
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
  formActions: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
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
  tableWrapper: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    color: '#000000',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
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
  viewLink: {
    color: '#4F46E5',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  editBtn: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.75rem',
    transition: 'all 0.2s ease',
  },
  deleteBtn: {
    background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '0.375rem 0.75rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.75rem',
    transition: 'all 0.2s ease',
  },
  empty: {
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#6B7280',
    fontSize: '1rem',
  },
  checkboxGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '0.5rem 1rem',
    background: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease',
  },
};

export default Fields;
