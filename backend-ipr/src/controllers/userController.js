

const mongoose = require('mongoose');
const userModel = require("../models/userModel");
const jwt = require('jsonwebtoken');
const verificationModel = require("../models/verificationModel");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
const validation = require("../validations/validation");
const bcrypt = require('bcrypt');
const admin = require('../models/adminModel');



const userRegister = async function (req, res) {
    try {
        let userData = req.body;
    
        let { name, email,  password } = userData;
    
        if (Object.keys(userData).length == 0)
          return res.status(400).send({ status: false, message: "please provide required fields" });
    
    
        if (!name)
          return res.status(400).send({ status: false, message: " name is mandatory" });
    
        if (typeof name!= "string")
          return res.status(400).send({ status: false, message: " name should be in string" });
    
        // regex
        name = userData.name = name.trim();
    
        if (name == "")
          return res.status(400).send({ status: false, message: "Please Enter  name value" });
    
        // if (!validation.validateName(name))
        //   return res.status(400).send({ status: false, message: "please provide valid  name " });
    
        //================================ email ======
    
        if (!email)
          return res.status(400).send({ status: false, message: "email is mandatory" });
    
        if (typeof email != "string")
          return res.status(400).send({ status: false, message: "email id  should be in string" });
    
        //=========== email =======
    
        email = userData.email = email.trim().toLowerCase()
        if (email == "")
          return res.status(400).send({ status: false, message: "Please enter email value" });
    
        if (!validation.validateEmail(email))
          return res.status(400).send({ status: false, message: "Please provide valid email id" });
    
    
        //========= password ======
    
        if (!password)
          return res.status(400).send({ status: false, message: "password is mandatory" });
    
        if (typeof password != "string")
          return res.status(400).send({ status: false, message: "please provide password in string " });
    
        password = userData.password = password.trim();
        if (password == "")
          return res.status(400).send({ status: false, message: "Please provide password value" });
    
    
        //regex password
        if (!validation.validatePassword(password))
          return res.status(400).send({ status: false, message: "8-15 characters, one lowercase letter, one number and maybe one UpperCase & one special character" });
    
        //Encrypting password
        let hashing = bcrypt.hashSync(password, 10);
        userData.password = hashing;
    
       
        const userExist = await userModel.findOne({ $or: [{ email: email }] });
    
        if (userExist) {
          if (userExist.email == email)
            return res.status(400).send({ status: false, message: "email id  already exist, send another email" });
    
        }
       
        const userCreated = await userModel.create(userData);
    
        return res.status(201).send({ status: true, message: "Your Account has been successfully Registered", data: userCreated });
      } catch (error) {
        console.log(error.message);
        return res.status(500).send({ status: false, message: error.message });
      }
    };


const userLogin = async function(req,res){
    try {
        let data = req.body;
        let { email, password } = data;
    
        if (Object.keys(data).length == 0)
          return res.status(400).send({ status: false, message: "Please send data" });
    
     
        if (!email)
          return res.status(400).send({ status: false, message: "Please enter Emaill" });
    
    
        if (email != undefined && typeof email != "string")
          return res.status(400).send({ status: false, message: "Please enter Emaill in string format" });
    
        email = data.email = email.trim();
        if (email == "")
          return res.status(400).send({ status: false, message: "Please enter Email value" });
    
        if (!validation.validateEmail(email))
          return res.status(400).send({ status: false, message: "Please enter valid Email" });
    
        if (!password)
          return res.status(400).send({ status: false, message: "Please enter password" });
    
        if (password != undefined && typeof password != "string")
          return res.status(400).send({ status: false, message: "Please enter password in string format" });
    
        password = data.password = password.trim();
    
        if (password == "")
          return res.status(400).send({ status: false, message: "Please enter password" });
    
        if (!validation.validatePassword(password))
          return res.status(400).send({ status: false, message: "Please enter valid password" });
    
        //       
    
        let isUserExist = await userModel.findOne({ email: email });
    
        if (!isUserExist)
          return res.status(404).send({ status: false, message: "No user found with given Email", });
        
        let passwordCompare = await bcrypt.compare(password, isUserExist.password);
    
        if (!passwordCompare) return res.status(400).send({ status: false, message: "Please enter valid password" })
    
        let token = jwt.sign(
          { userId: isUserExist._id, exp: Math.floor(Date.now() / 1000) + 86400 },
          "neha"
        );
    
        let tokenInfo = { userId: isUserExist._id, token: token, email: email };
    
        res.setHeader('x-api-key', token)
    
        return res.status(200).send({ status: true, message: "Login Successful", data: tokenInfo });
    
      } catch (err) {
        return res.status(500).send({ status: false, error: err.message });
      }
    };
    
    
const transporter = nodemailer.createTransport({
    service: "Gmail", // e.g., 'Gmail'
    auth: {
        user: "anmolkadam369@gmail.com",
        pass: "jiejkeefowuvorav"
    },
  });
  

  const sendMailToUser = (email, token, otp)=>{
    const mailOptions = {
        from:"anmolkadam369@gmail.com",
        to:email,
        subject:"Your link Client",
        text:`this is your OTP : ${otp}-${token}`
    };
    console.log(`this is your OTP : ${otp}-${token} `);

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error) console.log('Error sending email:', error);
        else {
            console.log('Email sent:', info.response);
            const comingInfo= info.response;
            return comingInfo;
        }
    })
}


function generateOTP() {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let otp = '';
  
    // Generate an 8-character alphanumeric OTP
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      otp += characters.charAt(randomIndex);
    }
  
    return otp;
  }


  const emailVerification = async (req,res)=>{
    try{
        let data = req.body;
        console.log("email", data);
        let { email,resetToken,resetTokenExpires ,otp}=data;
        let foundUser = userModel.findOne({email:email});
        if (!foundUser) return res.status(404).json({ message: 'user not found' });

        resetToken = crypto.randomBytes(20).toString('hex');
        console.log("token", resetToken);

        resetTokenExpires = data.resetTokenExpires = Date.now() + 6000000;
        console.log("resetTokenExpires:",resetTokenExpires)
        
        email = data.email = email;
        resetToken = data.resetToken = resetToken;
        resetTokenExpires = data.resetTokenExpires = resetTokenExpires;
        otp = data.otp = generateOTP()
        console.log(email, resetToken, resetTokenExpires, otp)

        let createdVerification = await verificationModel.create(data);
        req.token = resetToken;
        const some = sendMailToUser(email, resetToken,otp);
        console.log(some)
        return res.status(200).send({status:true, message:"email Sent", data: createdVerification})
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}





const verifyOTP = async (req, res) => {
    try {
        console.log("some")
       let data = req.body;
       let {email, otp}=data;
       console.log(otp);
       otp = otp.trim();
       let otpArray = otp.split('-');
       let realOTP = otpArray[0];
       let token = otpArray[1];
        const user = await verificationModel.findOne({ resetToken: token , otp : realOTP});
        console.log(user)
        // if (!user) return res.status(400).send({status:false, message: 'Invalid token' });
        if (user.resetTokenExpires < Date.now()) return res.status(400).send({ status: false, message: 'Token expired' ,email:user.email});
        if(user.otp != realOTP) return res.status(400).send({ status: false, message: 'INCORRECT OTP' ,email:user.email});
        return res.status(200).send({ status: true, message: "Successful", email:user.email  });
    }
    catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}



const emailSend = async(req,res)=>{
    console.log(req.body.email);
    let data = await userModel.findOne({email: req.body.email});
    console.log(data);
    const responseType = {};
    if(data){
        let otpCode = Math.floor((Math.random()*10000)+1);
        let otpData = new Otp({
            email: req.body.email,
            otp: otpCode,
            resetTokenExpires: new Date().getTime() + 300*1000
        })
        let otpResponse = await otpData.save();
        responseType.statusText = 'Success'
        responseType.message = 'Please check Your email id';

    }else{
        responseType.statusText = 'error';
        responseType.message = 'Email does not exist';
    }
    res.status(200).json(responseType);
}

// const changePassword = async (req, res)=>{
//     let data = await verificationModel.find({email: req.body.email, otp: req.body.otpCode});
//     const response = {}
//     if(data){
//         let currentTime = new Date().getTime();
//         let diff = data.expireIn - currentTime;
//         if(diff < 0 ){
//             response.message = 'Token Expire';
//             response.statusText = 'error';

//         }
//         else{
//             let user = await userModel.findOne({email : req.body.email});
//             user.password = req.body.password;
//             user.save();
//             response.message('Password Changed Successfully');
//             response.statusText ='success';
//         }
//     }
// }
const changePassword = async (req, res)=>{
    const { email, newPassword } = req.body;

    // Find user by email
    const user = await userModel.findOne({email: email});

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate salt and hash the new password
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newPassword, salt, (err, hash) => {
            if (err) throw err;
            // Update user's password
            user.password = hash;
            res.json({ message: 'Password updated successfully', data:user });
        });
    });
    
};


module.exports = { userLogin, userRegister, emailVerification, verifyOTP, changePassword, emailSend}