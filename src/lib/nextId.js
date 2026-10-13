const pool = require('./db');

/**
 * Gets the next sequential numeric ID for a given table (e.g. '1', '2', '3'...)
 * @param {string} table Name of the SQL table
 * @param {object} [connection] Optional transaction connection
 * @returns {Promise<string>} Next numeric ID as string
 */
async function getNextNumericId(table, connection = null) {
  const runner = connection || pool;
  try {
    const [rows] = await runner.query(
      `SELECT MAX(CAST(id AS UNSIGNED)) as maxId FROM \`${table}\` WHERE id REGEXP '^[0-9]+$'`
    );
    const maxVal = rows[0]?.maxId ? Number(rows[0].maxId) : 0;
    return String(maxVal + 1);
  } catch {
    return '1';
  }
}

module.exports = { getNextNumericId };
