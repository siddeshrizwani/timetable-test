// backend/config/db.js
const { Pool } = require("pg");
require("dotenv").config();

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("railway.app")
        ? { rejectUnauthorized: false }
        : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_DATABASE,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });

module.exports = pool;
