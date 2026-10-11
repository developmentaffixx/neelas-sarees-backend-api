const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'neelas_sarees',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
});

module.exports = pool;

// Auto-check and create sareeLength & blouseLength columns if they don't exist
(async () => {
  try {
    const conn = await pool.getConnection();
    try {
      const [cols] = await conn.query("SHOW COLUMNS FROM `products` LIKE 'sareeLength'");
      if (cols.length === 0) {
        await conn.query("ALTER TABLE `products` ADD COLUMN `sareeLength` VARCHAR(100) NULL DEFAULT NULL");
      }
      const [bCols] = await conn.query("SHOW COLUMNS FROM `products` LIKE 'blouseLength'");
      if (bCols.length === 0) {
        await conn.query("ALTER TABLE `products` ADD COLUMN `blouseLength` VARCHAR(100) NULL DEFAULT NULL");
      }
    } catch {} finally {
      conn.release();
    }
  } catch {}
})();
