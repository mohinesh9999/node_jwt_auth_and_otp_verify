var express = require('express');
var router = express.Router();
var firebase=require('firebase');
var nodemailer = require("nodemailer"); 
var bcrypt=require('bcryptjs');
var jwt=require('jsonwebtoken')
const verify=require('./verifytoken')
var firebaseConfig = {
  apiKey: "AIzaSyDqqF00b4WHIKQFqbEYf1RszmxSCv19rLk",
  authDomain: "test1-21f34.firebaseapp.com",
  databaseURL: "https://test1-21f34.firebaseio.com",
  projectId: "test1-21f34",
  storageBucket: "gs://test1-21f34.appspot.com",
  messagingSenderId: "591509825226",
  appId: "1:591509825226:web:5742dfbe549c8f2553b633"
};

firebase.initializeApp(firebaseConfig);

function generateOTP() { 
          
  // Declare a digits variable  
  // which stores all digits 
  var digits = '0123456789'; 
  let OTP = ''; 
  for (let i = 0; i < 4; i++ ) { 
      OTP += digits[Math.floor(Math.random() * 10)]; 
  } 
  return OTP; 
} 

/* GET home page. */
router.get('/a',verify, function(req, res, next) {
  // res.render('index', { title: 'Express'
  console.log(req.user,req.body);
  res.send('hello')
  
});

router.post('/register', async  (req,res,next)=>{
  try{
    const manage=await bcrypt.genSalt(10)
    const hash=await bcrypt.hash(req.body.password,manage)
    await firebase.database().ref('/in/'+req.body.email.slice(0,req.body.email.length-4)).set({email:req.body.email,password:hash})
    res.status(200).json({'result':true})
    // console.log(hash);
    // res.send(hash)
  }

  catch(e){
    console.log(e);
    res.status(500).json({'result':false})
  }
  
})
router.post('/login', async  (req,res,next)=>{
  try{
    const a= await firebase.database().ref('/in/'+req.body.email.slice(0,req.body.email.length-4)).once('value',async function(a){
      try{
    if(a.val() && !a.val().otp){
      const isvalid=await bcrypt.compare(req.body.password,a.val().password)
      if(isvalid){
        // const token = jwt.sign({ _id : a.val().email}," ")
        const token = jwt.sign({email:req.body.email}," ")
        res.header('auth-token',token).send(token)
        // res.status(200).json({'result':"success"})
      }
      else{
        res.status(200).json({'result':"wrong password"})
      }
    }
    else if(a.val().otp){
      res.status(200).json({'result':"plz verify first"})

    }


    else{
      res.status(200).json({'result':"wrong email"})
    }
  }catch(e){
    res.status(500).json({'result':false})
  }
    })

  }

  catch(e){
    console.log(e);
    res.status(500).json({'result':false})
  }
  
})
router.post('/changePassword',async (req,res,next)=>{
  let smtpTransport=nodemailer.createTransport({
    secure: true,
    port: 465,
    host: 'smtp.gmail.com',
    service: 'Gmail',
    auth: {
        user: 'sihkkr2020@gmail.com',
        pass: 'demon_killers'
    }
  });
  try{
    let a=generateOTP()
    await firebase.database().ref('/in/'+req.body.email.slice(0,req.body.email.length-4)).set({email:req.body.email,password: req.body.password, otp:a})
    var mailOptions={
      to : req.body.email,
      subject : "OTP Verification",
      html : "<h3>OTP for account verification is </h3>"  + "<h1 style='font-weight:bold;'>" + a +"</h1>"
     }
     smtpTransport.sendMail(mailOptions, function(error, response){
      if(error){
      console.log(error);
      res.send('error')
      
      }
      else{ res.status(200).json({'result':true})}
      })

  }catch(e){
    console.log(e)
    res.status(500).json({'result':false})
  }
})
router.post('/verify',async (req,res,next)=>{
  await firebase.database().ref('/in/'+req.body.email.slice(0,req.body.email.length-4)).once('value',async function(a){
    try{
    if(a.val() && a.val().otp){
      if(req.body.otp==a.val().otp){
        const manage=await bcrypt.genSalt(10)
        const hash=await bcrypt.hash(a.val().password,manage)
        await firebase.database().ref('/in/'+req.body.email.slice(0,req.body.email.length-4)).set({email:req.body.email,password:hash})
        res.status(200).json({'result':true})
      }
      else{
        res.status(500).json({'result':false})
      }

    }else{
      res.status(500).json({'result':false})
    }}catch(e){
      res.status(500).json({'result':false})
    }
  })

})

module.exports = router;
