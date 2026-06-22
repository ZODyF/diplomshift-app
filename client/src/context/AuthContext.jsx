// ============================================================
// context/AuthContext.jsx — глобальний стан автентифікації
// Зберігає дані користувача та JWT-токен через React Context
// ============================================================

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * Провайдер автентифікації.
 * Обгортає додаток і надає доступ до user, token, login, register, logout
 * через хук useAuth().
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // При першому рендері — перевіряємо збережений токен
  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authAPI.getProfile();
        setUser(response.data.user);
      } catch {
        // Токен невалідний — очищуємо
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [token]);

  /** Реєстрація нового користувача */
  async function register(username, email, password) {
    const response = await authAPI.register({ username, email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return response.data;
  }

  /** Вхід існуючого користувача */
  async function login(email, password) {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: newUser } = response.data;

    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);

    return response.data;
  }

  /** Вихід — очищення токена та стану */
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для доступу до контексту автентифікації.
 * Використання: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
