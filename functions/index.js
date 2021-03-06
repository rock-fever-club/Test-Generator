const functions = require('firebase-functions');
const express = require("express");
const app = express();
const flash = require('express-flash');
const session = require('express-session');
var firebase = require("firebase");
var admin = require("firebase-admin");
var serviceAccount = require('./serviceAccount.json');
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: true});
var nodemailer = require("nodemailer");

const firebaseConfig = {
  apiKey: "AIzaSyCDzfXOOIzlCy8jk10WcM-Ix6cnAkIe32g",
  authDomain: "celtic-iridium-234908.firebaseapp.com",
  databaseURL: "https://celtic-iridium-234908.firebaseio.com",
  projectId: "celtic-iridium-234908",
  storageBucket: "celtic-iridium-234908.appspot.com",
  messagingSenderId: "166848493036",
  appId: "1:166848493036:web:5d80e02fa073a7a9"
};

firebaseConfig.credential = admin.credential.cert(serviceAccount);

//Firebase app initialization
admin.initializeApp(firebaseConfig);
var db = admin.firestore();
let smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        type: 'login',
        user: 'booksyourbrain@gmail.com',
        pass: 'books@brain'
    }
});

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false ,
          maxAge: 86400000}
}));
const port = 3000;

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/uploads'));

app.use(flash());

///Express messages Middleware
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res);
  next();
});


app.get('*',function(req, res, next){
  res.locals.user = req.user|| null;
  next();
});

app.post('*',function(req, res, next){
  res.locals.user = req.user|| null;
  next();
});


//home route
app.get('/', (req, res)=>{
  res.render("home",{errors:[]});
});

//generate test route
app.get('/generate_test', (req, res)=>{
  res.render("maketest",{errors:[]});
});

//post request for generating test
app.post("/process_ques",urlencodedParser,(req, res)=>{
//  console.log(req.body);
  var n = req.body.number;
  var code = req.body.code;
  var time = req.body.time;
  var data = req.body;
  data.length = n;
  data.time = time;
  db.collection('test').doc(code).set(data);
  /*for(var i = 1; i <= n ;i++){
    var foo = "ques" + i + "_body";
    var ques_body = req.body[foo];
    foo = "ques" + i + "_opt";
    var ques_type = req.body[foo];
    var num_options = 0;
    var flag = 0;
    if(ques_type == "objective"){
      foo = "ques" + i + "_num_options";
      num_options = req.body[foo];
      flag = 1;
    }
    var options = [];
    if(flag == 1){
      for(var j = 1; j <= parseInt(num_options);j++){
        foo = "ques" + i + "_option" + j;
        options[j - 1] = req.body[foo];
      }
    }
    if(flag == 0){
      data = {
        n:num_options,
        body:ques_body,
        type: ques_type
      }
    }
    else {
      data = {
        n:num_options,
        body:ques_body,
        type: ques_type,
        options:options
      }
    }
    db.collection('test').doc(code).collection("ques" + i).doc("ques" + i).set(data);
  }*/
  res.redirect("/preview/" + code);
});

app.listen(port, function(){
  console.log("Listening to port "+ port);
});

//handle preview on Request
app.get("/preview/:code",(req, res)=>{
  var code = req.params.code;
  var data = {};
  db.collection('test').doc(code).get().then(doc=>{
    data = doc.data();
    console.log(data);
    res.render("preview_test", {data:data});
  });
});

//handle finalize Request
app.get("/finalize",(req, res)=>{
  req.flash('success',"Your test is successfully generated!");
  res.redirect('/');
});

//handle test attempt Request
app.get("/test/:code",(req, res)=>{
  var code = req.params.code;
  db.collection('test').doc(code).get().then(doc=>{
  res.render("test_paper",{data:doc.data()});
  });
});

//handle submit test route
app.post("/submit_test",urlencodedParser,(req, res)=>{

  console.log(JSON.stringify(req.body));
  var mailOptions={
                 to : "amitsrawat2000@gmail.com",
                 cc: ['jaisinglanrw@gmail.com'],
                 subject : "Response",
                 text: JSON.stringify(req.body)
              }

              smtpTransport.sendMail(mailOptions, function(error, response){
              if(error){
              console.log(error);
              res.end("error");
              }else{
                console.log("mail is sent");
                res.send("Your test is successfully submited!");
              }
              });
});
exports.app = functions.https.onRequest(app);
