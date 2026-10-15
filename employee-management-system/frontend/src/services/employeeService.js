import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const credentials = sessionStorage.getItem('emsCredentials');
  if (credentials) config.headers.Authorization = `Basic ${credentials}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.endsWith('/auth/login')) {
      sessionStorage.removeItem('emsCredentials');
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

// Turns any axios error into { message, fieldErrors } for the UI.
export function parseError(err) {
  if (err.response) {
    const data = err.response.data || {};
    if (err.response.status === 401 && err.config?.url?.endsWith('/auth/login')) {
      return {
        message: data.message || data.detail || 'Invalid username or password.',
        fieldErrors: {},
      };
    }
    return {
      message: data.message || data.detail || `Request failed (${err.response.status})`,
      fieldErrors: data.fieldErrors || {},
    };
  }
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
    return {
      message: 'The backend request timed out. Check that the API is running on port 8080.',
      fieldErrors: {},
    };
  }
  return {
    message: 'Cannot reach the backend at http://localhost:8080. Start the API and check that the browser can access it.',
    fieldErrors: {},
  };
}

export const getEmployees = (params) =>
  api.get('/employees', { params }).then((r) => r.data);

export const getEmployee = (id) => api.get(`/employees/${id}`).then((r) => r.data);

export const createEmployee = (payload) => api.post('/employees', payload).then((r) => r.data);

export const updateEmployee = (id, payload) =>
  api.put(`/employees/${id}`, payload).then((r) => r.data);

export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export const getSummary = () => api.get('/employees/summary').then((r) => r.data);

export const getDepartments = () => api.get('/employees/departments').then((r) => r.data);

export const login = async (username, password) => {
  sessionStorage.removeItem('emsCredentials');
  await api.post('/auth/login', { username, password });
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  sessionStorage.setItem('emsCredentials', btoa(binary));
};

export const exportEmployees = (params) =>
  api.get('/employees/export', { params, responseType: 'blob' }).then((r) => r.data);

export const listDepartments = () => api.get('/departments').then((r) => r.data);
export const createDepartment = (name) => api.post('/departments', { name }).then((r) => r.data);
export const updateDepartment = (id, name) => api.put(`/departments/${id}`, { name }).then((r) => r.data);
export const deleteDepartment = (id) => api.delete(`/departments/${id}`);
