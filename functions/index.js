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
var me = admin.database();
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
  console.log(req.body.ques2_num_options);
});

app.listen(port, function(){
  console.log("Listening to port "+ port);
});

exports.app = functions.https.onRequest(app);
