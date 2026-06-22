// ============================================================
// components/Layout/Header.jsx — верхня панель навігації
// Відображає бренд, посилання та кнопку виходу
// ============================================================

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout } = useAuth();

  // Перша літера імені для аватара
  const initial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <header className="header">
      {/* Бренд */}
      <NavLink to="/" className="header-brand">
        <span className="header-brand-icon">⏱️</span>
        <h2>DiplomShift</h2>
      </NavLink>

      {/* Навігація */}
      <nav className="header-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
          end
        >
          📅 Календар
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => `header-nav-link ${isActive ? 'active' : ''}`}
        >
          📋 Завдання
        </NavLink>
      </nav>

      {/* Користувач + вихід */}
      <div className="header-right">
        <div className="header-user">
          <div className="header-avatar">{initial}</div>
          <span>{user?.username}</span>
        </div>
        <button className="header-logout" onClick={logout}>
          Вийти
        </button>
      </div>
    </header>
  );
}
