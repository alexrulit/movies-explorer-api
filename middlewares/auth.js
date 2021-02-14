const jwt = require('jsonwebtoken');
const AuthError = require('../errors/auth-err');

const auth = (req, res, next) => {
  const { authorization } = req.headers;
  const { JWT_SECRET } = process.env;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthError('Необходима авторизация');
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AuthError('Необходима авторизация');
  }

  req.user = payload;

  next();
};

module.exports = {
  auth,
};
