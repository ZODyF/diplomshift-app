// ============================================================
// App.jsx — кореневий компонент додатку
// Маршрутизація між сторінками, захист приватних маршрутів
// ============================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import AuthForm from './components/Auth/AuthForm';
import Calendar from './components/Calendar/Calendar';
import Dashboard from './components/Dashboard/Dashboard';
import './App.css';

/**
 * Обгортка для захищених маршрутів.
 * Якщо користувач не авторизований — перенаправляє на /login.
 */
function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', color: 'var(--color-text-secondary)'
      }}>
        ⏳ Завантаження...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/**
 * Обгортка для публічних маршрутів (login/register).
 * Якщо вже авторизований — перенаправляє на головну.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

/** Основний layout для авторизованих сторінок */
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/diplom.github.io">
      <AuthProvider>
        <Routes>
          {/* Публічний маршрут — форма входу */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthForm />
              </PublicRoute>
            }
          />

          {/* Захищені маршрути */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Calendar />
                </AppLayout>
              </PrivateRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </PrivateRoute>
            }
          />

          {/* Будь-який інший URL → головна */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
