const express = require('express');
const error = require('../model/error');
const pool = require('../database/db');
const rG = require('../model/response-generator');
const constant = require('../model/constant');
const router = express.Router();
const vs=require('../model/validator-sanitizer');
const auth=require('../model/auth')

router.get('/list', async (req, res) => {
    try {
      const [stu] = await pool.execute('select rollnum,name,depname,year,dob from stu', []);
      return res
        .status(200)
        .send(
          rG.success('student list', 'student  retrienved successfully', stu),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STU_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });


router.post(
  '/add',
  [
    vs.isNumeric(
      'body',
      'rollnum',
      3,
      50,
      'please enter a valid rollnum',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'name',
      3,
      20,
      'please provide valid name',
    ),
      vs.isValidStrLenWithTrim(
        'body',
        'depname',
        3,
        20,
        'please provide valid depname',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'year',
        3,
        20,
        'please provide valid year',
      ),
      vs.isDOB(
        'body',
        'dob',
        3,
        10,
        'please provide valid dob',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'password',
        3,
        20,
        'please provide valid password',
      ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['rollnum', 'name','depname','year','dob','password'];
      return res 
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO stu(rollnum,name,depname,year,dob,password) VALUES (?,?,?,?,?,?)',
        [req.body.rollnum, req.body.name,req.body.depname,req.body.year,req.body.dob,req.body.password],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('stu add', 'student added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STU_REGISTRATION_UNSUCCESSFULL,
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
        20,
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
      let stu;
      try {
        [stu] = await pool.execute('select rollnum ,password from stu where rollnum=?', [req.body.rollnum]);
        if (stu.length === 0) {
          console.log(areEqual);
          if (!areEqual) {
            const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_STU_PASSWORD_NO_MATCH);
            return res.status(400).send(responsePasswordNoMatch);
          }
        }
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.STU_LIST_REGISTRATION_UNSUCCESSFUL,
            ),
  
          );
      }
      console.log(stu);
      let areEqual;
      try {
        areEqual = await auth.verifyPassword(req.body.password, stu[0].password);
      } catch (e) {
        console.log(e);
      }
      let token;
      try {
        token = auth.genAuthToken({
          id: stu[0].rollnum,
          role : "stu"
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
      const [stu] = await pool.execute('select rollnum,name,depname,year,dob,password from stu where rollnum=?', [req.user.id]);
      return res
        .status(200)
        .send(
          rG.success('stu list', 'stu  retrienved successfully', stu),
        );
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.STU_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
  
        );
    }
  });

router.put(
    '/update/:rollnum',
    [
      vs.isNumeric(
        'body',
        'rollnum',
        3,
        50,
        'please enter a valid rollnum',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'name',
        3,
        20,
        'please provide valid name',
      ),
        vs.isValidStrLenWithTrim(
          'body',
          'depname',
          3,
          20,
          'please provide valid depname',
        ),
        vs.isValidStrLenWithTrim(
          'body',
          'year',
          3,
          20,
          'please provide valid year',
        ),
        vs.isDOB(
          'body',
          'dob',
          3,
          10,
          'please provide valid dob',
        ),
        vs.isValidStrLenWithTrim(
          'body',
          'password',
          3,
          20,
          'please provide valid password',
        ),
    ],
    async (req, res) => {
      const errors = vs.getValidationResult(req);
      if (!errors.isEmpty()) {
        const fieldsToValidate = ['rollnum', 'name','depname','year','dob'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValiedate));
      }
      try {
        const [rows] = await pool.execute(
          'UPDATE stu SET rollnum=?,name=?,depname=?,year=?,dob=? WHERE rollnum=?',
          [req.body.rollnum, req.body.name,req.body.depname,req.body.year,req.body.dob],
        );
        console.log(rows);
  
        return res
          .status(200)
          .send(rG.success('stu update', 'stu updated successfully', []));
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.STU_UPDATE_REGISTRATION_UNSUCCESSFUL,
            ),
          );
      }
    },
  );


 

  


module.exports = router;