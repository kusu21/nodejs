const express = require('express');
const error = require('../model/error');
const pool = require('../database/db');
const rG = require('../model/response-generator');
const constant = require('../model/constant');
const router = express.Router();
const vs = require('../model/validator-sanitizer');

router.get('/list', async (req, res) => {
  try {
    const [orders] = await pool.execute('select * from orders', []);
    return res
      .status(200)
      .send(
        rG.success('order list', 'order list retrienved successfully', orders),
      );
  } catch (e) {
    return res
      .status(500)
      .send(
        rG.internalError(
          error.errList.internalError.ERR_ORDER_LIST_QUERY_ERROR,
        ),
    
      );
  }
});

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
      'order',
      3,
      10,
      'please provide valid order',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['name', 'order'];
      return res 
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
    try {
      const [rows] = await pool.execute(
        'INSERT INTO orders(name,item) VALUES (?,?)',
        [req.body.name, req.body.order],
      );
      console.log(rows);
      if (rows.affectedRows === 1) {
        return res
          .status(200)
          .send(rG.success('order add', 'order added successfully', []));
      }
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.ERR_ORDER_INSERT_FAILURE,
          ),
        );
    }
  },
);

router.put(
  '/update/:order_id',
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
      'order',
      3,
      10,
      'please provide valid order',
    ),
    vs.isNumeric(
      'params',
      'order_id',
      'PLease select a valid order to update details',
    ),
  ],
  async (req, res) => {
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['name', 'order','order_id'];
      return res
        .status(422)
        .send(rG.validationError(errors.mapped(), fieldsToValiedate));
    }
    try {
      const [rows] = await pool.execute(
        'UPDATE orders SET name =?,item=? WHERE id=?',
        [req.body.name, req.body.order, req.params.order_id],
      );
      console.log(rows);

      return res
        .status(200)
        .send(rG.success('order update', 'order updated successfully', []));
    } catch (e) {
      console.log(e);
      return res
        .status(500)
        .send(
          rG.internalError(
            error.errList.internalError.ERR_ORDER_UPDATE_FAILURE,
          ),
        );
    }
  },
);

router.delete('/delete/:order_id', async (req, res) => {
  try {
    const [rows] = await pool.execute('DELETE  from orders where id=?', [
      req.params.order_id,
    ]);
    console.log(rows);
    if (rows.affectedRows === 1) {
      return res
        .status(200)
        .send(rG.success('order delete', 'order deleted successfully', []));
    }
    return res
      .status(400)
      .send(rG.dbError(error.errList.dbError.ERR_DELETE_ORDER_DOESNOT_EXIST));
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .send(
        rG.internalError(error.errList.internalError.ERR_ORDER_DELETE_FAILURE),
      );
    res.send(e);
  }
});

module.exports = router;
