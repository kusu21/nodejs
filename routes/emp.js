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
      const [emp] = await pool.execute('select eid,ename,designation,sal,depname,dob from emp', []);
      return res
        .status(200)
        .send(
          rG.success('emp list', 'emp  retrienved successfully', emp),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMP_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });


router.post(
  '/add',
  [
    vs.isNumeric(
      'body',
      'eid',
      3,
      50,
      'please enter a valid empid',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'ename',
      3,
      20,
      'please provide valid ename',
    ),
    vs.isValidStrLenWithTrim(
        'body',
        'designation',
        3,
        20,
        'please provide valid designation',
      ),
      vs.isNumeric(
        'body',
        'sal',
        3,
        10,
        'please provide valid sal',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'depname',
        3,
        20,
        'please provide valid depname',
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
      const fieldsToValidate = ['eid', 'ename','designation','sal','depname','dob','password'];
      return res 
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO emp(eid,ename,designation,sal,depname,dob,password) VALUES (?,?,?,?,?,?,?)',
        [req.body.eid, req.body.ename,req.body.designation,req.body.sal,req.body.depname,req.body.dob,req.body.password],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('emp add', 'emp added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMP_REGISTRATION_UNSUCCESSFULL,
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
        'eid',
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
        const fieldsToValidate = ['eid', 'password'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValidate));
      }
      let emp;
      try {
        [emp] = await pool.execute('select eid ,password from emp where eid=?', [req.body.eid]);
        if (emp.length === 0) {
          console.log(areEqual);
          if (!areEqual) {
            const responsePasswordNoMatch = rG.dbError(error.errList.dbError.ERR_LOGIN_EMP_PASSWORD_NO_MATCH);
            return res.status(400).send(responsePasswordNoMatch);
          }
        }
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.EMP_LIST_REGISTRATION_UNSUCCESSFUL,
            ),
  
          );
      }
      console.log(emp);
      let areEqual;
      try {
        areEqual = await auth.verifyPassword(req.body.password, emp[0].password);
      } catch (e) {
        console.log(e);
      }
      let token;
      try {
        token = auth.genAuthToken({
          id: emp[0].eid,
          role : "emp"
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
      const [emp] = await pool.execute('select eid,ename,designation,sal,depname,dob from emp where eid=?', [req.user.id]);
      return res
        .status(200)
        .send(
          rG.success('emp list', 'emp  retrienved successfully', emp),
        );
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.EMP_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
  
        );
    }
  });

router.put(
    '/update/:eid',
    [
        vs.isNumeric(
            'body',
            'eid',
            3,
            50,
            'please enter a valid empid',
          ),
          vs.isValidStrLenWithTrim(
            'body',
            'ename',
            3,
            20,
            'please provide valid empname',
          ),
          vs.isValidStrLenWithTrim(
              'body',
              'designation',
              3,
              20,
              'please provide valid designation',
            ),
            vs.isNumeric(
              'body',
              'sal',
              3,
              10,
              'please provide valid sal',
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
        const fieldsToValidate = ['empid', 'empname','designation','sal','dob','password'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValiedate));
      }
      try {
        const [rows] = await pool.execute(
          'UPDATE emp SET empid=?,empname=?,designation=?,sal=?,dob=?WHERE empid=?',
          [req.body.empid, req.body.empname,req.body.desination,req.body.sal,req.body.dob],
        );
        console.log(rows);
  
        return res
          .status(200)
          .send(rG.success('emp update', 'emp updated successfully', []));
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.EMP_UPDATE_REGISTRATION_UNSUCCESSFUL,
            ),
          );
      }
    },
  );


 

  


module.exports = router;