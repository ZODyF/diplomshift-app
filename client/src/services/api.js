// ============================================================
// services/api.js — HTTP-клієнт для взаємодії з REST API
// Централізує всі запити до бекенду через axios
// ============================================================

import axios from 'axios';

// Базовий URL серверу
// У dev-режимі: http://localhost:5000/api
// У production (Render): адреса з VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Створюємо екземпляр axios із базовою конфігурацією
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// ----- Interceptor: автоматично додає JWT-токен до кожного запиту -----
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ----- Interceptor: обробка помилок авторизації -----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Якщо токен прострочений — перенаправляємо на логін
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== Auth API ====================

export const authAPI = {
  /** Реєстрація: POST /api/auth/register */
  register: (data) => api.post('/auth/register', data),

  /** Вхід: POST /api/auth/login */
  login: (data) => api.post('/auth/login', data),

  /** Профіль: GET /api/auth/me */
  getProfile: () => api.get('/auth/me')
};

// ==================== Tasks API ====================

export const tasksAPI = {
  /** Список завдань (з фільтрами): GET /api/tasks */
  getAll: (params) => api.get('/tasks', { params }),

  /** Одне завдання: GET /api/tasks/:id */
  getById: (id) => api.get(`/tasks/${id}`),

  /** Створення: POST /api/tasks */
  create: (data) => api.post('/tasks', data),

  /** Оновлення: PUT /api/tasks/:id */
  update: (id, data) => api.put(`/tasks/${id}`, data),

  /** Видалення: DELETE /api/tasks/:id */
  delete: (id) => api.delete(`/tasks/${id}`)
};

// ==================== Events API (Календар) ====================

export const eventsAPI = {
  /** Усі події за місяць: GET /api/events?month=2026-06 */
  getByMonth: (month) => api.get('/events', { params: { month } }),

  /** Усі події за день: GET /api/events?date=2026-06-08 */
  getByDate: (date) => api.get('/events', { params: { date } }),

  /** Одна подія: GET /api/events/:id */
  getById: (id) => api.get(`/events/${id}`),

  /** Створення: POST /api/events */
  create: (data) => api.post('/events', data),

  /** Оновлення: PUT /api/events/:id */
  update: (id, data) => api.put(`/events/${id}`, data),

  /** Видалення: DELETE /api/events/:id */
  delete: (id) => api.delete(`/events/${id}`)
};

export default api;
