var express = require('express');
var router = express.Router();
const vs=require('../model/validator-sanitizer');
const rG = require('../model/response-generator');
const pool =require('../database/db');
const mongo=require('../database/mongo');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send({data:"this is / route"});
});
router.get("/server/status",function(req,res){
  res.status(200).send("server running properly");
});
router.get("/add/:a/:b",[ vs.isNumeric('params','a','please enter a valid value for A'),vs.isNumeric('params','b','please enter a valid value for B')], 

 function(req,res){
  
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['a','b'];
      return res.status(422).send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
  
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const add = a+b;
  res.status(200).send("addition is :"+add);
});


router.get("/sub/:a/:b",[vs.isNumeric('params','a','please enter the valid value for A'),vs.isNumeric('params','b','please enter the valid value for B')],
function(req,res){
  
  const errors = vs.getValidationResult(req);
  if (!errors.isEmpty()) {
    const fieldsToValidate = ['a','b'];
    return res.status(422).send(rG.validationError(errors.mapped(), fieldsToValidate));
  }
  console.log(req.query)
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const sub = a-b;
  const message = "sub is :"+ sub + " and your name is " + req.query.name + " and your age is " + req.query.age +"and your gender is" +req.query.gender;
  res.status(200).send(message);
 
});

router.get("/mul/:a/:b",[ vs.isNumeric('params','a','please enter a valid value for A'),vs.isNumeric('params','b','please enter a valid value for B')], 

 function(req,res){
  
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['a','b'];
      return res.status(422).send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
  
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const mul = a*b;
  res.status(200).send("multiplication of the two numbers is :"+mul);
});


router.get("/div/:a/:b",[ vs.isNumeric('params','a','please enter a valid value for A'),vs.isNumeric('params','b','please enter a valid value for B')], 

 function(req,res){
  
    const errors = vs.getValidationResult(req);
    if (!errors.isEmpty()) {
      const fieldsToValidate = ['a','b'];
      return res.status(422).send(rG.validationError(errors.mapped(), fieldsToValidate));
    }
  
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const div = a/b;
  res.status(200).send("division is :"+div);
});


router.post('/add/user', function (req, res) {
  console.log(req.body);
  });

  router.put('/add/user', function (req, res) {
    console.log(req.body);
    }); 

    router.get('/newStudent', function(req, res) {
      mongo.once('open', async () => {
        console.log(err);
        try {
          // const students = await mongo.db.collection('newStudents')
          mongo.db.collection('newStudent', (err, students) => {
            console.log(err);
            students.find({}).toArray((err, stu) => {
              console.log(err);
              console.log(stu);
              return res.send(stu)
            });
          });
        } catch (error) {
          console.log(error);
          res.send(error)
        }
      });
    });
module.exports = router;
