const express = require('express');
const error = require('../model/error');
const pool = require('../database/db');
const rG = require('../model/response-generator');
const constant = require('../model/constant');
const router = express.Router();
const vs=require('../model/validator-sanitizer');

router.get('/list', async (req, res) => {
    try {
      const [gross] = await pool.execute('select * from gross', []);
      return res
        .status(200)
        .send(
          rG.success('gross list', 'grossery  retrienved successfully', gross),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.GROSS_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });


router.post(
  '/add',
  [
    vs.isValidStrLenWithTrim(
      'body',
      'gid',
      3,
      50,
      'please enter a valid gid',
    ),
    vs.isValidStrLenWithTrim(
      'body',
      'gname',
      3,
      10,
      'please provide valid gname',
    ),
    vs.isValidStrLenWithTrim(
        'body',
        'grate',
        3,
        10,
        'please provide valid grate',
      ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['gid', 'gname','grate'];
      return res 
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO gross(gid,gname,grate) VALUES (?,?,?)',
        [req.body.gid, req.body.gname,req.body.grate],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('gross add', 'grossery added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.GROSS_REGISTRATION_UNSUCCESSFULL,
          ),
        );
    }
  },
);


router.put(
    '/update/:gid',
    [
      vs.isValidStrLenWithTrim(
        'body',
        'gname',
        3,
        50,
        'please provide valid gname',
      ),
      vs.isValidStrLenWithTrim(
        'body',
        'grate',
        3,
        10,
        'please provide valid grate',
      ),
      vs.isNumeric(
        'params',
        'gid',
        'PLease provide valid gid',
      ),
    ],
    async (req, res) => {
      const errors = vs.getValidationResult(req);
      if (!errors.isEmpty()) {
        const fieldsToValidate = ['gname', 'grate','gid'];
        return res
          .status(422)
          .send(rG.validationError(errors.mapped(), fieldsToValiedate));
      }
      try {
        const [rows] = await pool.execute(
          'UPDATE gross SET gname =?,grate=? WHERE gid=?',
          [req.body.gname, req.body.grate, req.params.gid],
        );
        console.log(rows);
  
        return res
          .status(200)
          .send(rG.success('gross update', 'grossery updated successfully', []));
      } catch (e) {
        console.log(e);
        return res
          .status(500)
          .send(
            rG.internalError(
              error.errList.internalError.GROSS_UPDATE_REGISTRATION_UNSUCCESSFUL,
            ),
          );
      }
    },
  );


  router.delete('/delete/:gid', async (req, res) => {
    try {
      const [rows] = await pool.execute('DELETE  from gross where gid=?', [
        req.params.gid,
      ]);
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('gross delete', 'gross deleted successfully', []));
      }
      return res
        .status(400)
        .send(rG.dbError(error.errList.dbError. ERR_DELETE_GROSS_DOESNOT_EXIST));
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(error.errList.internalError.GROSS_DELETE_REGISTRATION_UNSUCCESSFUL),
        );
      res.send(e);
    }
  });
  


module.exports = router;