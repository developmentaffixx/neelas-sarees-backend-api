const { randomBytes } = require('crypto');

function cuid() {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString('base64url').slice(0, 8);
  return `c${timestamp}${random}`;
}

module.exports = { cuid };
