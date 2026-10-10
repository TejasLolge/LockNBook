
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  port: Number(process.env.DB_PORT || 5432),
  password: process.env.DB_PASSWORD || 'locknbook_dev_2026',
});

module.exports = pool;
