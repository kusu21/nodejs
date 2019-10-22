var express = require('express');
var router = express.Router();
const pool =require(".l./database/db");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send({data:"this is / route"});
});
router.get("/server/status",function(req,res){
  res.status(200).send("server running properly");
});
router.get("/add/:a/:b",function(req,res){
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const add = a+b;
  res.status(200).send("addition is :"+add);
});
router.get("/sub/:a/:b",function(req,res){
  console.log(req.query)
  const a=parseInt(req.params.a);
  const b=parseInt(req.params.b);
  const sub = a-b;
  const message = "sub is :"+ sub + " and your name is " + req.query.name + " and your age is " + req.query.age +"and your gender is" +req.query.gender;
  res.status(200).send(message);
 
});
router.post('/add/user', function (req, res) {
  console.log(req.body);
  });

  router.put('/add/user', function (req, res) {
    console.log(req.body);
    }); 
module.exports = router;
