// ============================================================
// components/Calendar/DayPanel.jsx — бокова панель дня
// Показує всі події вибраного дня + форма додавання нової події
// Підтримує швидке додавання існуючих завдань до дня
// ============================================================

import { useState } from 'react';
import EventCard from './EventCard';

/** Попередньо визначені кольори для подій (як у Supershift) */
const EVENT_COLORS = [
  '#4A90D9', // синій
  '#2ecc71', // зелений
  '#e74c3c', // червоний
  '#f39c12', // жовтий
  '#9b59b6', // фіолетовий
  '#1abc9c', // бірюзовий
  '#e67e22', // помаранчевий
  '#3498db', // блакитний
];

/** Назви днів тижня українською */
const WEEKDAY_NAMES = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];

/** Назви місяців у родовому відмінку */
const MONTH_NAMES_GEN = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

/** Кольори пріоритетів завдань */
const PRIORITY_COLORS = {
  high: '#e74c3c',
  medium: '#f39c12',
  low: '#2ecc71'
};

export default function DayPanel({ date, events, userTasks = [], onClose, onAddEvent, onEditEvent, onDeleteEvent }) {
  const [showForm, setShowForm] = useState(false);
  const [showTaskPicker, setShowTaskPicker] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Поля форми
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState(EVENT_COLORS[0]);
  const [type, setType] = useState('event');
  const [taskId, setTaskId] = useState(null);

  const dateObj = new Date(date + 'T00:00:00');
  const dayOfWeek = WEEKDAY_NAMES[dateObj.getDay()];
  const dayNum = dateObj.getDate();
  const monthName = MONTH_NAMES_GEN[dateObj.getMonth()];

  /** Скидання форми */
  function resetForm() {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setColor(EVENT_COLORS[0]);
    setType('event');
    setTaskId(null);
    setEditingEvent(null);
    setShowForm(false);
    setShowTaskPicker(false);
  }

  /** Відкриття форми для редагування */
  function handleEdit(event) {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description || '');
    setStartTime(event.start_time ? event.start_time.slice(0, 5) : '');
    setEndTime(event.end_time ? event.end_time.slice(0, 5) : '');
    setColor(event.color || EVENT_COLORS[0]);
    setType(event.type || 'event');
    setTaskId(event.task_id || null);
    setShowForm(true);
    setShowTaskPicker(false);
  }

  /** Швидке додавання завдання з Kanban-дошки до цього дня */
  function handlePickTask(task) {
    const eventData = {
      title: task.title,
      description: task.description || null,
      event_date: date,
      start_time: null,
      end_time: null,
      color: PRIORITY_COLORS[task.priority] || EVENT_COLORS[0],
      type: 'task',
      task_id: task.id
    };
    onAddEvent(eventData);
    setShowTaskPicker(false);
  }

  /** Обробка відправлення форми */
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const eventData = {
      title: title.trim(),
      description: description.trim() || null,
      event_date: date,
      start_time: startTime || null,
      end_time: endTime || null,
      color,
      type,
      task_id: taskId
    };

    if (editingEvent) {
      await onEditEvent(editingEvent.id, eventData);
    } else {
      await onAddEvent(eventData);
    }

    resetForm();
  }

  /** Видалення із підтвердженням */
  function handleDelete(eventId) {
    if (!window.confirm('Видалити цю подію?')) return;
    onDeleteEvent(eventId);
  }

  // Сортування: спочатку з часом (за start_time), потім без часу
  const sortedEvents = [...events].sort((a, b) => {
    if (a.start_time && b.start_time) return a.start_time.localeCompare(b.start_time);
    if (a.start_time && !b.start_time) return -1;
    if (!a.start_time && b.start_time) return 1;
    return 0;
  });

  // Фільтруємо завдання, які ще не додані до цього дня
  const existingTaskIds = new Set(events.filter(e => e.task_id).map(e => e.task_id));
  const availableTasks = userTasks.filter(t => !existingTaskIds.has(t.id));

  return (
    <div className="day-panel">
      {/* Заголовок */}
      <div className="day-panel-header">
        <div className="day-panel-title">
          📅 {dayNum} {monthName} ({dayOfWeek})
        </div>
        <button className="day-panel-close" onClick={onClose} title="Закрити">
          ✕
        </button>
      </div>

      <div className="day-panel-halves">
        {/* UPPER HALF: 50% */}
        <div className="day-panel-half">
          <div className="day-panel-half-header">Події дня та нова подія</div>
          
          <div className="day-panel-half-scroll">
            {sortedEvents.length === 0 ? (
              <div className="day-panel-empty" style={{ minHeight: 'unset', padding: '16px 24px' }}>
                Немає подій на цей день
              </div>
            ) : (
              <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sortedEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="day-panel-half-form">
            <form className="event-form" onSubmit={handleSubmit} style={{ margin: 0, padding: '16px 24px', borderTop: '1px solid var(--color-border)' }}>
              <input
                className="input-field"
                type="text"
                placeholder="Назва події..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />

              <div className="event-form-row" style={{ margin: '12px 0' }}>
                <input
                  className="input-field"
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  placeholder="Початок"
                  style={{ padding: '8px' }}
                />
                <input
                  className="input-field"
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  placeholder="Кінець"
                  style={{ padding: '8px' }}
                />
              </div>

              {/* Вибір кольору */}
              <div className="color-picker-row" style={{ marginBottom: '12px' }}>
                {EVENT_COLORS.map(c => (
                  <div
                    key={c}
                    className={`color-swatch ${color === c ? 'active' : ''}`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                    title={c}
                  />
                ))}
              </div>

              <div className="event-form-actions">
                {editingEvent && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={resetForm}>
                    Скасувати
                  </button>
                )}
                <button type="submit" className="btn btn-primary btn-sm" style={{ width: editingEvent ? 'auto' : '100%' }}>
                  {editingEvent ? '💾 Зберегти' : '＋ Додати подію'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LOWER HALF: 50% */}
        <div className="day-panel-half">
          <div className="day-panel-half-header">Додати завдання</div>
          <div className="day-panel-half-scroll">
            {availableTasks.length === 0 ? (
              <div className="day-panel-empty" style={{ minHeight: 'unset', padding: '16px 24px' }}>
                Немає доступних завдань
              </div>
            ) : (
              <div className="task-picker-list" style={{ maxHeight: 'none', padding: '16px 24px', margin: 0, border: 'none', background: 'transparent' }}>
                {availableTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-picker-item"
                    onClick={() => handlePickTask(task)}
                  >
                    <div
                      className="task-picker-dot"
                      style={{ backgroundColor: PRIORITY_COLORS[task.priority] || '#4A90D9' }}
                    />
                    <div className="task-picker-info">
                      <div className="task-picker-name">{task.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
