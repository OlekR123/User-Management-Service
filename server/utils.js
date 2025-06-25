const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new Error('Invalid token');
  }
};

const checkPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const isAdmin = (context) => {
  if (!context.user || context.user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
};

module.exports = { generateToken, verifyToken, checkPassword, isAdmin };