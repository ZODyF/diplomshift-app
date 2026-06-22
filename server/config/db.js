// ============================================================
// config/db.js — конфігурація підключення до MySQL
// Використовує пул з'єднань для ефективної роботи з БД
// ============================================================

const mysql = require('mysql2/promise');

// Створення пулу з'єднань (connection pool)
const config = {
  // Максимальна кількість одночасних з'єднань
  connectionLimit: 10,
  // Час очікування з'єднання з пулу (мс)
  waitForConnections: true,
  queueLimit: 0,
  // Часовий пояс для коректної роботи з TIMESTAMP
  timezone: '+00:00'
};

// Якщо є DATABASE_URL (наприклад, у DigitalOcean App Platform)
if (process.env.DATABASE_URL) {
  config.uri = process.env.DATABASE_URL;
  // Для хмарних баз даних зазвичай потрібен SSL
  config.ssl = { rejectUnauthorized: false };
} else {
  // Локальна розробка або ручні налаштування
  config.host = process.env.DB_HOST || 'localhost';
  config.port = process.env.DB_PORT || 3306;
  config.user = process.env.DB_USER || 'root';
  config.password = process.env.DB_PASSWORD || '';
  config.database = process.env.DB_NAME || 'time_management';
  
  if (process.env.DB_SSL === 'true') {
    config.ssl = { rejectUnauthorized: false };
  }
}

const pool = mysql.createPool(config);

module.exports = pool;
