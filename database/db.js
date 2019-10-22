const mysql = require("mysql2/promise");
const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "kusumanjali2110",
    database: "new",
    dateStrings: true,
  });

  pool.execute('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) throw error;
    console.log('Connection to DB is successful and answer to query is : ', results[0].solution);
  });

  module.exports = pool;