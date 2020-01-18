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
      const [emp] = await pool.execute('select depid,depname,depcode from dep', []);
      return res
        .status(200)
        .send(
          rG.success('dep list', 'dep  retrienved successfully', dep),
        );
    } catch (e) {
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.DEP_LIST_REGISTRATION_UNSUCCESSFUL,
          ),
      
        );
    }
  });
  

module.exports = router;