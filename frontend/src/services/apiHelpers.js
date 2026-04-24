import api from './api';

export const fieldsApi = {
  getAll: () => api.get('/fields/'),
  get: (id) => api.get(`/fields/${id}/`),
  create: (data) => api.post('/fields/', data),
  update: (id, data) => api.put(`/fields/${id}/`, data),
  delete: (id) => api.delete(`/fields/${id}/`),
};

export const updatesApi = {
  create: (data) => api.post('/updates/', data),
  getHistory: (fieldId) => api.get(`/updates/history/${fieldId}/`),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/'),
};

export const authApi = {
  login: (username, password) => api.post('/auth/', { username, password }),
  register: (userData) => api.post('/register/', userData),
  profile: () => api.get('/profile/'),
};
