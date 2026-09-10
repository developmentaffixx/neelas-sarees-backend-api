const { randomBytes } = require('crypto');

function cuid(prefix = '') {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('base64url').slice(0, 8);
  const id = `c${timestamp}${random}`;
  return prefix ? `${prefix}${id}` : id;
}

module.exports = { cuid };
