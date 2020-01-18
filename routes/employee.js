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
    vs.isNumeric(
      'body',
      'empid',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'empname',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'email',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isNumeric(
      'body',
      'mobilenumber',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),

    vs.isValidStrLenWithTrim(
      'body',
      'department',
      3,
      10,
      'please provide valid department',
    ),
    vs.isNumeric(
      'body',
      'sal',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'experience',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
    vs.isValidStrLenWithTrim(
        'body',
        'password',
        3,
        50,
        'please enter a number between 3 to 50 characters',
      ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['empid', 'empname', 'email', 'mobilenumber',  'department','sal' ,'experience','password'];
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
        'INSERT INTO employee(empid,empname,email,mobilenumber,department,sal,experience,password) VALUES (?,?,?,?,?,?,?,?)',
        [req.body.empid, req.body.empname, req.body.email, req.body.mobilenumber,req.body.department, req.body.sal,req.body.experience,hashedPassword],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('employee add', 'employee added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMPLOYEE_REGISTRATION_UNSUCCESSFULL,
          ),
        );
    }
  },
);
router.post(
    '/login',
    [
      vs.isNumeric(
        'body',
        'empid',
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
        const fieldsToValidate = ['empid', 'password'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValidate));
      }
      let employee;
      try {
        [employee] = await pool.execute('select empid ,password from employee where empid=?', [req.body.empid]);
        if(employee.length === 0) {
          console.log(areEqual);
          if (!areEqual) {
            const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_EMPLOYEE_PASSWORD_NO_MATCH);
            return res.status(400).send(responsePasswordNoMatch);
          }
        }
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.EMPLOYEE_LIST_REGISTRATION_UNSUCCESSFUL,
            ),
  
          );
      }
      console.log(employee);
      let areEqual;
      try {
        areEqual = await auth.verifyPassword(req.body.password, employee[0].password);
      } catch (e) {
        console.log(e);
      }
      console.log(areEqual);
      if (!areEqual) {
        const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_EMPLOYEE_PASSWORD_NO_MATCH);
        return res.status(400).send(responsePasswordNoMatch);
      }
      let token;
      try {
        token = auth.genAuthToken({
          id: employee[0].empid,
          role : "employee"
        });
      } catch (e) {
        console.log(e)
      }
      console.log(token);
      return res.status(200).header("x-auth-token", token).send(rG.success('login', 'Login Successful!!!', []));
    });
  
  router.get('/profile', auth.protectTokenVerify, async (req, res) => {
    console.log(req.user);
    try {
      const [employee] = await pool.execute('select empid,empname,email,mobilenumber,department,sal,experience from employee where empid=?', [req.user.id]);
      return res
        .status(200)
        .send(
          rG.success('employee list', 'employee retrienved successfully', employee),
        );
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMPLOYEE_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
  
        );
    }
  });
  router.put(
    '/update/:rollnum',
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
        'email',
        3,
        50,
        'please enter a number between 3 to 50 characters',
      ),
      vs.isNumeric(
        'body',
        'mobilenumber',
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
      vs.isValidStrLenWithTrim(
        'body',
        'department',
        3,
        50,
        'please enter a number between 3 to 50 characters',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'year',
        3,
        50,
        'please enter a number between 3 to 50 characters',
      ),
      vs.isNumeric(
        'body',
        'rollnum',
        3,
        50,
        'please enter valid rollnumber',
      ),
    ],
    async (req, res) => {
      const errors = vs.getValidationResult(req);
      if (!errors.isEmpty()) {
        const fieldsToValidate = ['name', 'email','mobilenumber','password','department','year','rollnum'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValiedate));
      }
      try {
        const [rows] = await pool.execute(
          'UPDATE student SET name =?,email=?,mobilenumber=?,password=?,department=?,year=? WHERE rollnum=?',
          [req.body.name, req.body.email,req.body.mobilenumber,req.body.password,req.body.department,req.body.year, req.body.rollnum],
        );
        console.log(rows);
  
        return res
          .status(200)
          .send(rG.success('student update', 'student updated successfully', []));
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.STUDENT_UPDATE_REGISTRATION_UNSUCCESSFUL,
            ),
          );
      }
    },
  );
  
  router.delete('/delete/:gid', async (req, res) => {
    try {
      const [rows] = await pool.execute('DELETE  from employee where empid=?', [
        req.params.empid,
      ]);
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('employee delete', 'employee deleted successfully', []));
      }
      return res
        .status(400)
        .send(rG.dbError(error.errList.dbError. ERR_DELETE_EMPLOYEE_DOESNOT_EXIST));
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(error.errList.internalError.EMPLOYEE_DELETE_REGISTRATION_UNSUCCESSFUL),
        );
      res.send(e);
    }
  });
  
  router.get('/list', async (req, res) => {
    try {
      const [employee] = await pool.execute('select empid,empname,email,mobilenumber,department,sal,experience from employee', []);
      return res
        .status(200)
        .send(
          rG.success('employee list', 'employee  retrienved successfully', employee),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMPLOYEE_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });
  module.exports = router;
  
  
  