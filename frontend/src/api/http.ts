import axios from 'axios';

console.log('[http] VITE_API_URL =', import.meta.env.VITE_API_URL);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
