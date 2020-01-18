const express = require('express');
const error = require('../model/error');
const pool = require('../database/db');
const rG = require('../model/response-generator');
const constant = require('../model/constant');
const router = express.Router();
const vs = require('../model/validator-sanitizer');
const auth = require("../model/auth");

router.get('/list', auth.protectEmployeeMgmtRoute,
  [vs.isNumeric(
    'query',
    'page_no',
    'Please enter a valid page number'
  ),
  vs.isNumeric(
    'query',
    'limit',
    'Please give a valid page limit'
  ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['page_no', 'limit'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    let studentsCount;
    try {
      [studentsCount] = await pool.execute('SELECT COUNT(*) AS noOfStudents FROM student', []);
    } catch (e) {
      const beUnableToInsertDetailsToDb = error.errList.internalError.ERR_STUDENT_GET_NUMBER_OF_STUDENTS;
      return res.status(500).send(responseGenerator.internalError(beUnableToInsertDetailsToDb));
    }
    console.log(studentsCount[0].noOfStudents);
    const startPoint=(req.query.page_no-1)*req.query.limit
    try {
      const [student] = await pool.execute('select rollnum,name,email,mobilenumber,department,year from student ORDER BY rollnum ASC LIMIT ? OFFSET ?', [req.query.limit,startPoint]);
      return res
        .status(200)
        .send(
          rG.success('student list', 'student retrienved successfully', student),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STUDENT_LIST_REGISTRATION_UNSUCCESSFUL,
          ),

        );
    }
  });
router.post(
  '/add',auth.protectEmployeeMgmtRoute,
  [
    vs.isNumeric(
      'body',
      'rollnum',
      3,
      50,
      'please enter a number between 3 to 50 characters',
    ),
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
    vs.isDOB(
      'body',
      'dob',
      3,
      50,
      'please enter the correct dob',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['rollnum', 'name', 'email', 'mobilenumber', 'password', 'department', 'year', 'dob'];
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
        'INSERT INTO student(rollnum,name,email,mobilenumber, password,department,year,dob) VALUES (?,?,?,?,?,?,?,?)',
        [req.body.rollnum, req.body.name, req.body.email, req.body.mobilenumber, hashedPassword, req.body.department, req.body.year, req.body.dob],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('student add', 'student added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STUDENT_REGISTRATION_UNSUCCESSFULL,
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
      'rollnum',
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
      const fieldsToValidate = ['rollnum', 'password'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    let student;
    try {
      [student] = await pool.execute('select rollnum ,password from student where rollnum=?', [req.body.rollnum]);
      if (student.length === 0) {
        console.log(areEqual);
        if (!areEqual) {
          const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_STUDENT_PASSWORD_NO_MATCH);
          return res.status(400).send(responsePasswordNoMatch);
        }
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STUDENT_LIST_REGISTRATION_UNSUCCESSFUL,
          ),

        );
    }
    console.log(student);
    let areEqual;
    try {
      areEqual = await auth.verifyPassword(req.body.password, student[0].password);
    } catch (e) {
      console.log(e);
    }
    console.log(areEqual);
    if (!areEqual) {
      const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_STUDENT_PASSWORD_NO_MATCH);
      return res.status(400).send(responsePasswordNoMatch);
    }
    let token;
    try {
      token = auth.genAuthToken({
        id: student[0].rollnum
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
    const [student] = await pool.execute('select rollnum,name,email,mobilenumber,department,year,dob from student where rollnum=?', [req.user.id]);
    return res
      .status(200)
      .send(
        rG.success('student list', 'student  retrienved successfully', student),
      );
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .send(
        rG.internalError(
          error.errList.internalError.STUDENT_LIST_REGISTRATION_UNSUCCESSFUL,
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
    vs.isDOB(
      'body',
      'dob',
      3,
      50,
      'please enter correct dob',
    ),
  ],

  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['name', 'email', 'mobilenumber', 'password', 'department', 'year', 'rollnum', 'dob'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValiedate));
    }
    try {
      const [rows] = await pool.execute(
        'UPDATE student SET name =?,email=?,mobilenumber=?,password=?,department=?,year=? WHERE rollnum=?',
        [req.body.name, req.body.email, req.body.mobilenumber, req.body.password, req.body.department, req.body.year, req.body.rollnum],
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

module.exports = router;


