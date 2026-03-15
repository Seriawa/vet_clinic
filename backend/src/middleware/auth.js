const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Проверка JWT токена
async function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Токен не передан' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Неверный или просроченный токен' });
  }
}

// Проверка роли администратора
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Доступ только для администратора' });
  }
  next();
}

module.exports = {
  auth,
  requireAdmin,
};

