const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthError = require('../errors/auth-err');
const NotFoundError = require('../errors/not-found-err');
const NotCorrectDataError = require('../errors/not-correct-data-err');
const UserExist = require('../errors/user-exist');

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        bcrypt.hash(password, 10)
          .then((passwordHash) => User.create({
            email,
            password: passwordHash,
            name,
          })
            .then((newUser) => {
              if (!newUser) {
                throw new NotCorrectDataError('Переданы некорректные данные');
              }
              const currentUser = newUser.toObject();
              delete currentUser.password;
              res.send(currentUser);
            })
            .catch(next));
      } else {
        throw new UserExist('Пользователь с таким email уже существует');
      }
    })
    .catch(next);
};

const findUserById = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user !== null) {
        res.send(user);
      } else {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { email, name } = req.body;

  User.findByIdAndUpdate(req.user._id, { email, name }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      res.send(user);
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  const { JWT_SECRET } = process.env;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new AuthError('Ошибка авторизации');
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  createUser,
  findUserById,
  updateUser,
  login,
};
