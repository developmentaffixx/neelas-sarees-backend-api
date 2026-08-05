/**
 * Serialize an error object to a plain JSON-safe object.
 * MySQL errors have code/sqlMessage properties that won't show with JSON.stringify({})
 */
function serializeError(error) {
  if (!error) return {};
  return {
    message: error.message || String(error),
    code: error.code,
    sqlMessage: error.sqlMessage,
    sqlState: error.sqlState,
    errno: error.errno,
  };
}

module.exports = { serializeError };
