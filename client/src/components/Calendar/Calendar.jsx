// ============================================================
// components/Calendar/Calendar.jsx — інтерактивний календар
// Сітка місяця з маркерами подій, навігація по місяцях,
// бокова панель деталей дня (аналог Supershift)
// ============================================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { eventsAPI, tasksAPI } from '../../services/api';
import DayPanel from './DayPanel';
import './Calendar.css';

/** Назви місяців українською */
const MONTH_NAMES = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

/** Скорочені назви днів тижня (Пн — перший) */
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

/**
 * Генерує масив дат для сітки календаря (42 клітинки = 6 рядків × 7 стовпців).
 * Тиждень починається з понеділка.
 */
function getCalendarDays(year, month) {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  // getDay() повертає 0 = Нд, 1 = Пн, ... → переводимо на Пн = 0
  let startDay = firstDayOfMonth.getDay() - 1;
  if (startDay < 0) startDay = 6; // Неділя → 6

  const days = [];

  // Дні попереднього місяця
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const date = new Date(year, month - 1, d);
    days.push({ date, day: d, isCurrentMonth: false });
  }

  // Дні поточного місяця
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({ date, day: d, isCurrentMonth: true });
  }

  // Дні наступного місяця (добиваємо до 42)
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    days.push({ date, day: d, isCurrentMonth: false });
  }

  return days;
}

/** Форматує Date → "2026-06-08" */
function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Форматує "2026-06" для API-запитів */
function toMonthStr(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export default function Calendar() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  // Ключ анімації для плавної зміни місяця (crossfade)
  const [animKey, setAnimKey] = useState(0);
  const gridRef = useRef(null);

  const todayStr = toDateStr(today);

  // Генерація сітки днів
  const calendarDays = useMemo(
    () => getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  // Завантаження подій при зміні місяця
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const monthStr = toMonthStr(currentYear, currentMonth);
      const response = await eventsAPI.getByMonth(monthStr);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Помилка завантаження подій:', error);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth, setLoading, setEvents]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Завантаження завдань користувача (один раз)
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await tasksAPI.getAll();
        setUserTasks(response.data.tasks);
      } catch (error) {
        console.error('Помилка завантаження завдань:', error);
      }
    }
    loadTasks();
  }, []);

  // Групування подій за датою для швидкого доступу
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(event => {
      const dateKey = event.event_date.slice(0, 10); // "2026-06-08"
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [events]);

  // --- Навігація по місяцях (з плавною анімацією) ---
  function changeMonth(newYear, newMonth) {
    // Пропускаємо якщо вже на цьому місяці
    if (newYear === currentYear && newMonth === currentMonth) return;
    setAnimKey(k => k + 1);
    setCurrentYear(newYear);
    setCurrentMonth(newMonth);
  }

  function goToPrevMonth() {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    changeMonth(newYear, newMonth);
    setSelectedDate(null);
  }

  function goToNextMonth() {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    changeMonth(newYear, newMonth);
    setSelectedDate(null);
  }

  function goToToday() {
    changeMonth(today.getFullYear(), today.getMonth());
    // Плавний вибір дня з невеликою затримкою після анімації
    requestAnimationFrame(() => {
      setSelectedDate(todayStr);
    });
  }

  // --- Вибір дня ---
  function handleDayClick(dateStr) {
    setSelectedDate(prev => (prev === dateStr ? null : dateStr));
  }

  // --- CRUD подій ---
  async function handleAddEvent(eventData) {
    try {
      const response = await eventsAPI.create(eventData);
      setEvents(prev => [...prev, response.data.event]);
    } catch (error) {
      console.error('Помилка створення події:', error);
    }
  }

  async function handleEditEvent(eventId, eventData) {
    try {
      const response = await eventsAPI.update(eventId, eventData);
      setEvents(prev =>
        prev.map(e => (e.id === eventId ? response.data.event : e))
      );
    } catch (error) {
      console.error('Помилка оновлення події:', error);
    }
  }

  async function handleDeleteEvent(eventId) {
    try {
      await eventsAPI.delete(eventId);
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error('Помилка видалення події:', error);
    }
  }

  // Події обраного дня
  const selectedDayEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <div className="calendar-container">
      {/* Заголовок */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={goToPrevMonth} title="Попередній місяць">
            ◀
          </button>
          <h1 className="calendar-month-title">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h1>
          <button className="calendar-nav-btn" onClick={goToNextMonth} title="Наступний місяць">
            ▶
          </button>
        </div>
        <button className="calendar-today-btn" onClick={goToToday}>
          📌 Сьогодні
        </button>
      </div>

      {/* Основна частина — сітка та бокова панель */}
      <div className="calendar-body">
        <div className={`calendar-main ${selectedDate ? 'with-panel' : ''}`}>

        {/* Сітка */}
        <div key={animKey} className="calendar-grid calendar-grid-animate" ref={gridRef}>
          {/* Назви днів тижня */}
          {WEEKDAYS.map((name, i) => (
            <div
              key={name}
              className={`calendar-weekday ${i >= 5 ? 'weekend' : ''}`}
            >
              {name}
            </div>
          ))}

          {/* Клітинки днів */}
          {calendarDays.map(({ date, day, isCurrentMonth }, idx) => {
            const dateStr = toDateStr(date);
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const dayOfWeek = idx % 7;
            const isWeekend = dayOfWeek >= 5;

            // Показуємо максимум 3 маркери + "+N ще"
            const visibleEvents = dayEvents.slice(0, 3);
            const extraCount = dayEvents.length - 3;

            return (
              <div
                key={`${dateStr}-${idx}`}
                className={[
                  'calendar-day',
                  !isCurrentMonth && 'other-month',
                  isToday && 'today',
                  isSelected && 'selected',
                  isWeekend && 'weekend'
                ].filter(Boolean).join(' ')}
                onClick={() => handleDayClick(dateStr)}
              >
                <div className="calendar-day-number">{day}</div>
                <div className="calendar-day-events">
                  {visibleEvents.map(event => (
                    <div
                      key={event.id}
                      className="calendar-event-marker"
                      style={{
                        backgroundColor: `${event.color}20`,
                        color: event.color,
                        borderLeft: `3px solid ${event.color}`
                      }}
                      title={event.title}
                    >
                      {event.start_time ? event.start_time.slice(0, 5) + ' ' : ''}
                      {event.title}
                    </div>
                  ))}
                  {extraCount > 0 && (
                    <div className="calendar-day-more">+{extraCount} ще</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-muted)' }}>
            Завантаження...
          </p>
        )}
      </div>

        {/* Бокова панель дня */}
        {selectedDate && (
          <DayPanel
            date={selectedDate}
            events={selectedDayEvents}
            userTasks={userTasks}
            onClose={() => setSelectedDate(null)}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>
    </div>
  );
}
