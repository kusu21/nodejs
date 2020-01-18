const express = require('express');
const error = require('../model/error');
const pool = require('../database/db');
const rG = require('../model/response-generator');
const constant = require('../model/constant');
const router = express.Router();
const vs = require('../model/validator-sanitizer');
const auth = require("../model/auth");


router.post(
  '/add',
  [
    vs.isValidStrLenWithTrim(
      'body',
      'name',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'password',
      3,
      10,
      'please provide valid password',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['name', 'password'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    const password = req.body.password;
    let hasedPassword;
    try {
      hashedPassword = await
        auth.hashPassword(password);
      console.log(hashedPassword);
    } catch (e) {
      console.log(e);
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO user(name,password) VALUES (?,?)',
        [req.body.name, hashedPassword],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('user add', 'user added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.USER_REGISTRATION_UNSUCCESSFULL,
          ),
        );
    }
  },
);
router.post(
  '/login',
  [
    vs.isValidStrLenWithTrim(
      'body',
      'name',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'password',
      3,
      10,
      'please provide valid password',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['name', 'password'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    let user;
    try {
      [user] = await pool.execute('select name ,password from user where name=?', [req.body.name]);

    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.USER_LIST_REGISTRATION_UNSUCCESSFUL,
          ),

        );
    }
    console.log(user);
    let areEqual;
    try {
      areEqual = await auth.verifyPassword(req.body.password, user[0].password);
    } catch (e) {
      console.log(e);
    }
    console.log(areEqual);
    if (!areEqual) {
      const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_USER_PASSWORD_NO_MATCH);
      return res.status(400).send(responsePasswordNoMatch);
    }
    let token;
    try {
      token = auth.genAuthToken({
        name: user[0].name
      });
    } catch (e) {
      console.log(e)
    }
    console.log(token);
    return res.status(200).header("x-auth-token", token).send(rG.success('login', 'Login Successful!!!', []));
  });


module.exports = router;