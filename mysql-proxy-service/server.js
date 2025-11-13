const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection pool with SSL
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  ssl: {
    rejectUnauthorized: false, // For Azure MySQL
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ status: 'healthy', message: 'MySQL connection successful' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Query endpoint
app.post('/query', async (req, res) => {
  const { sql } = req.body;

  if (!sql) {
    return res.status(400).json({ error: 'SQL query is required' });
  }

  // Security: Only allow SELECT statements
  const trimmedSql = sql.trim().toUpperCase();
  if (!trimmedSql.startsWith('SELECT') && !trimmedSql.startsWith('SHOW') && !trimmedSql.startsWith('DESCRIBE')) {
    return res.status(403).json({ 
      error: 'Only SELECT, SHOW, and DESCRIBE queries are allowed' 
    });
  }

  try {
    console.log('Executing query:', sql);
    const [rows, fields] = await pool.query(sql);
    
    res.json({
      success: true,
      data: rows,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      fields: fields.map(f => ({
        name: f.name,
        type: f.type,
        table: f.table
      }))
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      sqlState: error.sqlState,
      errno: error.errno
    });
  }
});

// Schema endpoint - get all tables and columns
app.get('/schema', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        COLUMN_DEFAULT,
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `, [process.env.MYSQL_DATABASE]);

    // Group by table
    const schema = rows.reduce((acc, row) => {
      if (!acc[row.TABLE_NAME]) {
        acc[row.TABLE_NAME] = [];
      }
      acc[row.TABLE_NAME].push({
        column: row.COLUMN_NAME,
        type: row.DATA_TYPE,
        nullable: row.IS_NULLABLE === 'YES',
        key: row.COLUMN_KEY,
        default: row.COLUMN_DEFAULT,
        extra: row.EXTRA
      });
      return acc;
    }, {});

    res.json({ success: true, schema });
  } catch (error) {
    console.error('Schema error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Tables endpoint - list all tables
app.get('/tables', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        TABLE_NAME,
        TABLE_ROWS,
        CREATE_TIME,
        UPDATE_TIME,
        TABLE_COMMENT
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [process.env.MYSQL_DATABASE]);

    res.json({ success: true, tables: rows });
  } catch (error) {
    console.error('Tables error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing MySQL pool');
  await pool.end();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`MySQL Proxy Service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
