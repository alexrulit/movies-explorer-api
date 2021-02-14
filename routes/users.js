const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  findUserById,
  updateUser,
} = require('../controllers/users');

router.get('/me', findUserById);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    name: Joi.string().required().min(2).max(30),
  }),
}), updateUser);

module.exports = router;
