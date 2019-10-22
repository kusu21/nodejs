/**
 * This module deal with consistent error messages to send to client.
 * Here we define error messages and error code.
 */

// TO IMPORT: const error = require('./error');

const errMsg = {
  INTERNAL_SERVER_ERROR: 'An internal error has occurred. Please try again!',
  DATABASE_ERROR: 'An internal error has occurred. Please try again!',
};

//
// Why I have added name property which is same as name of object?
// Answer: This is to avoid programming errors, because if we don't have
// name property we have to write 'VAL_ERR_...' as this is treated as string
// By JS it will not throw error and there is possibility to make typo there
// but now we have to write errList.VAL_ERR_.. this is JS variable name
// and JS will throw error when we make typo there.

//
// NOTE:
// - Error code must be unique for all error objects.
// - Internal error is used for debugging purpose hence don't send it to client.
//
//

const errList = {
  //
  // INTERNAL SERVER ERRORS
  // These errors occurs when some request fails either authentication or authorization
  // In this case front end should redirect to Login page
  //
  // ERR_PR_ : ERROR_PROTECT_ROUTE_
  authError: {
    ERR_PR_PERMISSION_MISMATCH: {
      code: '20001',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'Role provided in token does not matched with route accessed.',
    },
    ERR_PR_INVALID_TOKEN: {
      code: '20002',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'Verify function for token provided fails. Token may be tampered with.',
    },
    ERR_PR_NO_TOKEN: {
      code: '20003',
      message: 'You are not authorized to access this resource. Please login again.',
      internalDescription: 'No token provided while accessing protected route.',
    },
    ERR_PR_TOKEN_EXPIRED: {
      code: '20004',
      message: 'You are not authorized to access this resource. Please login again..',
      internalDescription: 'Token provided while accessing the protected route has been expired.',
    },
    ERR_PR_BRANCH_DETAILS_UNAUTHORIZED_REQUEST: {
      code: '20005',
      message: 'You are not authorized to access this resource. Please login again..',
      internalDescription: 'Token provided while accessing the protected route has been expired.',
    },
  },

  //
  // DATABASE ERRORS
  // These error occurred when given values does not match with the value
  // present in DB or they are missing
  // ERR_<Operation>_<Description>
  //
  dbError: {
    ERR_DELETE_ORDER_DOESNOT_EXIST: {
      code : "30001",
      message : "Order is been deleted before or does not exist, please check the list to proceed",
      internalDescription: "When the user tried to delete an order there was no error and delete was unsuccessful this may be because of the data absence in the DB or some other DB error",
    }
    
  },

  //
  // INTERNAL SERVER ERRORS
  // These errors occurs when some server modules throws error
  // For example hashing module or encoding module. The operation
  // done on server which does not involve DB. This also involve some external API
  // call returned error or failed.
  //
  internalError: {
    ERR_ORDER_LIST_QUERY_ERROR:{

      code : "50001",
      message : errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: "There was error in getting the list of orders in the orders list route",
  },
  ERR_ORDER_INSERT_FAILURE: {
    code : "50002",
      message : errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: "There was error in getting the list of orders in the orders insert route",
  },
  ERR_ORDER_UPDATE_FAILURE:{
  code : "50003",
      message : errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: "There was error in getting the list of orders in the orders  update route",
},
ERR_ORDER_DELETE_FAILURE:{
  code : "50004",
      message : errMsg.INTERNAL_SERVER_ERROR,
      internalDescription: "There was error in getting the list of orders in the orders delete route",

},
  }

};

module.exports.errMsg = errMsg;
module.exports.errList = errList;
