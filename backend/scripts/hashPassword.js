// backend/scripts/hashPassword.js
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
}

// Hash passwords for testing
hashPassword('admin123');
hashPassword('staff123');
hashPassword('password');
