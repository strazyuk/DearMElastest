import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const messageApi = {
  getMessages: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get('/api/messages', { params });
    return response.data;
  },

  getMessage: async (id) => {
    const response = await api.get(`/api/messages/${id}`);
    return response.data;
  },

  createMessage: async (messageData) => {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  },

  deleteMessage: async (id) => {
    const response = await api.delete(`/api/messages/${id}`);
    return response.data;
  },

  getQuote: async () => {
    const response = await api.get('/api/quote/');
    return response.data;
  }
};

export default api;
