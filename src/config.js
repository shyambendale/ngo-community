import axios from 'axios';

// Your new Express + MongoDB server.
// You can override it with VITE_API_URL in a .env file at the React project root.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Sends the login token with every request so the server knows who is calling.
// It is set up here because every file in src/api imports this config.
const getToken = () => {
  const direct = localStorage.getItem('token');
  if (direct && direct !== 'dummy-token') return direct;
  try {
    const saved = JSON.parse(localStorage.getItem('user') || 'null');
    return saved?.token || null;
  } catch {
    return null;
  }
};

if (!axios.__ngoAuthInterceptor) {
  axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  axios.__ngoAuthInterceptor = true;
}

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  NGO: 'ngo'
};

export const NGO_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

export const REQUIREMENT_STATUS = {
  OPEN: 'open',
  FULFILLED: 'fulfilled',
  CLOSED: 'closed'
};
