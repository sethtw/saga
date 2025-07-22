import axios from 'axios';

/**
 * @file api.ts
 * @description This file configures and exports an Axios instance for making
 * HTTP requests to the backend API.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api; 