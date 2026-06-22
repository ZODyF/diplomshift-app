// Скрипт для імпорту schema.sql у DigitalOcean Managed MySQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function importSchema() {
  const connection = await mysql.createConnection({
    host: 'diplomshift-db-do-user-14278583-0.a.db.ondigitalocean.com',
    port: 25060,
    user: 'doadmin',
    password: 'AVNS_ivVBGrEuQRC13R1lmlM',
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false },
    multipleStatements: true  // дозволяє виконати весь файл за раз
  });

  console.log('Connected to DigitalOcean MySQL!');

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema.sql...');
  await connection.query(sql);
  console.log('Tables created successfully!');

  // Перевіримо що таблиці створились
  const [tables] = await connection.query('SHOW TABLES');
  console.log('\nTables in database:');
  tables.forEach(t => console.log('  -', Object.values(t)[0]));

  await connection.end();
  console.log('\nDone! Connection closed.');
}

importSchema().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
