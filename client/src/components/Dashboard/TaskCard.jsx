// ============================================================
// components/Dashboard/TaskCard.jsx — картка одного завдання
// Відображає назву, пріоритет, дедлайн та кнопки дій
// ============================================================

import { useMemo } from 'react';

/**
 * Визначає наступний та попередній статуси для кнопок переміщення.
 * todo → in_progress → done (і назад)
 */
const STATUS_FLOW = {
  todo: { next: 'in_progress', nextLabel: 'Розпочати ▶' },
  in_progress: { next: 'done', prev: 'todo', nextLabel: 'Завершити ✓', prevLabel: '◀ Назад' },
  done: { prev: 'in_progress', prevLabel: '◀ Повернути' }
};

export default function TaskCard({ task, onStatusChange, onDelete }) {
  const flow = STATUS_FLOW[task.status];

  // Форматування дедлайну
  const deadlineInfo = useMemo(() => {
    if (!task.deadline) return null;

    const deadline = new Date(task.deadline);
    const now = new Date();
    const isOverdue = deadline < now && task.status !== 'done';

    return {
      text: deadline.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      isOverdue
    };
  }, [task.deadline, task.status]);

  return (
    <div className="task-card">
      {/* Пріоритет */}
      <div className="task-card-top">
        <span className={`task-priority ${task.priority}`}>
          {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}{' '}
          {task.priority}
        </span>
        {task.category_name && (
          <span
            style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: '4px',
              background: task.category_color ? `${task.category_color}20` : 'rgba(74,144,217,0.1)',
              color: task.category_color || 'var(--color-accent)',
              fontWeight: 500
            }}
          >
            {task.category_name}
          </span>
        )}
      </div>

      {/* Назва */}
      <div className="task-card-title">{task.title}</div>

      {/* Опис (якщо є) */}
      {task.description && (
        <div className="task-card-desc">{task.description}</div>
      )}

      {/* Дедлайн + кнопки дій */}
      <div className="task-card-footer">
        <div className={`task-card-deadline ${deadlineInfo?.isOverdue ? 'overdue' : ''}`}>
          {deadlineInfo && (
            <>📅 {deadlineInfo.text}{deadlineInfo.isOverdue && ' ⚠️'}</>
          )}
        </div>

        <div className="task-card-actions">
          {/* Кнопка "Назад" */}
          {flow.prev && (
            <button
              className="task-action-btn"
              onClick={() => onStatusChange(task.id, flow.prev)}
              title={flow.prevLabel}
            >
              ◀
            </button>
          )}

          {/* Кнопка "Далі" */}
          {flow.next && (
            <button
              className="task-action-btn"
              onClick={() => onStatusChange(task.id, flow.next)}
              title={flow.nextLabel}
            >
              {task.status === 'in_progress' ? '✓' : '▶'}
            </button>
          )}

          {/* Видалення */}
          <button
            className="task-action-btn delete"
            onClick={() => onDelete(task.id)}
            title="Видалити"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
