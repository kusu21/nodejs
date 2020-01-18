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
      const [subjects] = await pool.execute('select subid,subname from subjects', []);
      return res
        .status(200)
        .send(
          rG.success('subjects list', 'subjects  retrienved successfully', subjects),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.SUBJECTS_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });
  
module.exports = router;