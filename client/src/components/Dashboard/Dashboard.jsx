// ============================================================
// components/Dashboard/Dashboard.jsx — дошка завдань (Kanban)
// Три колонки: Todo → In Progress → Done
// CRUD-операції через REST API
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { tasksAPI } from '../../services/api';
import TaskCard from './TaskCard';
import './Dashboard.css';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Поля форми додавання
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newDescription, setNewDescription] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      const response = await tasksAPI.getAll();
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Помилка завантаження завдань:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Завантаження завдань при монтуванні компонента
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /** Створення нового завдання */
  async function handleAddTask(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const response = await tasksAPI.create({
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        priority: newPriority
      });
      // Додаємо нове завдання до стану без повторного запиту
      setTasks([response.data.task, ...tasks]);
      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
    } catch (error) {
      console.error('Помилка створення завдання:', error);
    }
  }

  /** Зміна статусу завдання (перенесення між колонками) */
  async function handleStatusChange(taskId, newStatus) {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      setTasks(tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      ));
    } catch (error) {
      console.error('Помилка зміни статусу:', error);
    }
  }

  /** Видалення завдання */
  async function handleDeleteTask(taskId) {
    if (!window.confirm('Видалити це завдання?')) return;

    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Помилка видалення:', error);
    }
  }

  // Розподіл завдань за статусом
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (loading) {
    return <div className="dashboard"><p style={{ textAlign: 'center', padding: '60px' }}>⏳ Завантаження...</p></div>;
  }

  return (
    <div className="dashboard">
      {/* Заголовок із статистикою */}
      <div className="dashboard-header">
        <h1>📋 Мої завдання</h1>
        <div className="dashboard-stats">
          <div className="stat-badge">
            <span>Всього:</span>
            <span className="stat-badge-count">{tasks.length}</span>
          </div>
          <div className="stat-badge">
            <span>Виконано:</span>
            <span className="stat-badge-count">{doneTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Форма додавання нового завдання */}
      <form className="task-add-form" onSubmit={handleAddTask}>
        <input
          className="input-field"
          type="text"
          placeholder="Назва нового завдання..."
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          required
        />
        <input
          className="input-field"
          type="text"
          placeholder="Опис (необов'язково)"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          style={{ maxWidth: '250px' }}
        />
        <select
          value={newPriority}
          onChange={e => setNewPriority(e.target.value)}
        >
          <option value="low">🟢 Низький</option>
          <option value="medium">🟡 Середній</option>
          <option value="high">🔴 Високий</option>
        </select>
        <button type="submit" className="btn btn-primary">
          ＋ Додати
        </button>
      </form>

      {/* Три колонки дошки */}
      <div className="board">
        {/* Колонка: Заплановано */}
        <div className="board-column todo">
          <div className="board-column-header">
            <h3>📌 Заплановано</h3>
            <span className="column-count">{todoTasks.length}</span>
          </div>
          <div className="board-column-body">
            {todoTasks.length === 0 ? (
              <div className="board-empty">Немає завдань</div>
            ) : (
              todoTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Колонка: В роботі */}
        <div className="board-column in-progress">
          <div className="board-column-header">
            <h3>🔄 В роботі</h3>
            <span className="column-count">{inProgressTasks.length}</span>
          </div>
          <div className="board-column-body">
            {inProgressTasks.length === 0 ? (
              <div className="board-empty">Немає завдань</div>
            ) : (
              inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Колонка: Виконано */}
        <div className="board-column done">
          <div className="board-column-header">
            <h3>✅ Виконано</h3>
            <span className="column-count">{doneTasks.length}</span>
          </div>
          <div className="board-column-body">
            {doneTasks.length === 0 ? (
              <div className="board-empty">Немає завдань</div>
            ) : (
              doneTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
