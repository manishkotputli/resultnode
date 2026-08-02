'use strict';
const { body } = require('express-validator');

const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('subject').trim().optional({ checkFalsy: true }),
  body('message').trim().isLength({ min: 5 }).withMessage('Message is too short'),
];

module.exports = { contactValidator };
