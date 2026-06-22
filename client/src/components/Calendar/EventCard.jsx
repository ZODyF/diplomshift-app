// ============================================================
// components/Calendar/EventCard.jsx — картка однієї події
// Відображає назву, час, тип, кольоровий маркер та кнопки дій
// ============================================================

/**
 * Форматує об'єкт часу для відображення (HH:MM)
 */
function formatTime(timeStr) {
  if (!timeStr) return null;
  // timeStr може бути "HH:MM:SS" або "HH:MM"
  return timeStr.slice(0, 5);
}

const TYPE_LABELS = {
  event: 'Подія',
  task: 'Завдання',
  reminder: 'Нагадування'
};

const TYPE_ICONS = {
  event: '📅',
  task: '📋',
  reminder: '🔔'
};

export default function EventCard({ event, onEdit, onDelete }) {
  const startTime = formatTime(event.start_time);
  const endTime = formatTime(event.end_time);

  const timeDisplay = startTime
    ? (endTime ? `${startTime} — ${endTime}` : startTime)
    : null;

  return (
    <div className="event-card">
      {/* Кольорова полоска зліва */}
      <div
        className="event-card-color"
        style={{ backgroundColor: event.color || '#4A90D9' }}
      />

      {/* Контент */}
      <div className="event-card-content">
        <div className="event-card-title">{event.title}</div>

        {timeDisplay && (
          <div className="event-card-time">
            🕐 {timeDisplay}
          </div>
        )}

        {event.description && (
          <div className="event-card-desc">{event.description}</div>
        )}

        <span className={`event-card-type ${event.type}`}>
          {TYPE_ICONS[event.type]} {TYPE_LABELS[event.type] || event.type}
        </span>
      </div>

      {/* Кнопки дій */}
      <div className="event-card-actions">
        <button
          className="event-action-btn"
          onClick={() => onEdit(event)}
          title="Редагувати"
        >
          ✎
        </button>
        <button
          className="event-action-btn delete"
          onClick={() => onDelete(event.id)}
          title="Видалити"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
