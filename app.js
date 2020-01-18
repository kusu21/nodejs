const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
 const usersRouter = require('./routes/user');
const ordersRouter=require("./routes/order");
const grossRouter=require("./routes/gross");
const studentRouter=require("./routes/student");
const employeeRouter=require("./routes/employee");
const empRouter=require("./routes/emp");
const stuRouter=require("./routes/stu");
const depRouter=require("./routes/dep");
const subjectsRouter=require("./routes/subjects");
const marksRouter=require("./routes/marks");

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use("/order",ordersRouter);
app.use("/gross",grossRouter);
app.use("/student",studentRouter);
app.use("/employee",employeeRouter);
app.use("/emp",empRouter);
app.use("/stu",stuRouter);
app.use("/dep",depRouter);
app.use("/subjects",subjectsRouter);
app.use("/marks",marksRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
