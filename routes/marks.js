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
      const [marks] = await pool.execute('select marksid,rollnum,subid,marks from marks', []);
      return res
        .status(200)
        .send(
          rG.success('marks list', 'marks retrienved successfully', marks),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.MARKS_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });


router.post(
  '/add',
  [
    vs.isNumeric(
      'body',
      'marksid',
      3,
      50,
      'please enter a valid marksid',
    ),
    vs.isNumeric(
      'body',
      'rollnum',
      3,
      20,
      'please provide valid rollnum',
    ),
    vs.isNumeric(
        'body',
        'subid',
        3,
        20,
        'please provide valid subjectid',
      ),
      vs.isNumeric(
        'body',
        'marks',
        3,
        10,
        'please provide valid marks',
      ),
      
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['marksid','rollnum','subid','marks'];
      return res 
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO mark(marksid,rollnum,subid,marks) VALUES (?,?,?,?)',
        [req.body.marksid, req.body.rollnum,req.body.subid,req.body.marks],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('marks add', 'marks added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.MARKS_REGISTRATION_UNSUCCESSFULL,
          ),
        );
    }
  },
);

module.exports = router;