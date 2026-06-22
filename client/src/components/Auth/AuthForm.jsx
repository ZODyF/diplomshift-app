// ============================================================
// components/Auth/AuthForm.jsx — форма реєстрації та входу
// Перемикається між режимами login/register одною кнопкою
// ============================================================

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AuthForm.css';

export default function AuthForm() {
  const { login, register } = useAuth();

  // Режим форми: 'login' або 'register'
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isLogin = mode === 'login';

  /** Обробка зміни полів форми */
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Очищуємо помилку при редагуванні
  }

  /** Відправка форми */
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        // Валідація на стороні клієнта
        if (formData.username.length < 3) {
          setError('Ім\'я користувача — мінімум 3 символи');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Пароль — мінімум 6 символів');
          setLoading(false);
          return;
        }
        await register(formData.username, formData.email, formData.password);
      }
    } catch (err) {
      // Відображаємо повідомлення з бекенду або загальну помилку
      const message = err.response?.data?.error || 'Сталася помилка. Спробуйте ще раз.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  /** Перемикання між login та register */
  function toggleMode() {
    setMode(isLogin ? 'register' : 'login');
    setError('');
    setFormData({ username: '', email: '', password: '' });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Логотип */}
        <div className="auth-logo">
          <span className="auth-logo-icon">⏱️</span>
          <h1>TimeFlow</h1>
        </div>
        <p className="auth-subtitle">
          {isLogin ? 'Увійдіть у свій акаунт' : 'Створіть новий акаунт'}
        </p>

        {/* Повідомлення про помилку */}
        {error && <div className="auth-error">{error}</div>}

        {/* Форма */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Поле username — тільки при реєстрації */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="auth-username">Ім'я користувача</label>
              <input
                id="auth-username"
                className="input-field"
                type="text"
                name="username"
                placeholder="Введіть ім'я"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              className="input-field"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Пароль</label>
            <input
              id="auth-password"
              className="input-field"
              type="password"
              name="password"
              placeholder="Мінімум 6 символів"
              value={formData.password}
              onChange={handleChange}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? '⏳ Зачекайте...' : isLogin ? 'Увійти' : 'Зареєструватися'}
          </button>
        </form>

        {/* Перемикач режиму */}
        <div className="auth-toggle">
          {isLogin ? 'Немає акаунту?' : 'Вже маєте акаунт?'}
          <button type="button" onClick={toggleMode}>
            {isLogin ? 'Зареєструватися' : 'Увійти'}
          </button>
        </div>
      </div>
    </div>
  );
}
