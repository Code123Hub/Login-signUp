

const mongoose = require('mongoose')
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt')


function validEmail(email) {
    return email.length > 5 && email.indexOf('@')>0;
 }

const userRegister = async function (req, res) {
    try {
        const userData = req.body;
        
        let { name,  password, email } = userData;
        
        if (Object.keys(userData).length == 0) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide some data to create user" });
        }
       
       

       

        if (!name) {
            return res
                .status(400)
                .send({ status: false, message: "Please provide  name " });

        }
        if (name == "")
        {return res
          .status(400)
          .send({ status: false, message: "Please Enter name value" });}

        if (typeof (name) != "string") {
            return res
                .status(400)
                .send({ status: false, message: "Please provide valid name in string" });
        }
        // name = userData.name = name.trim()

        // if(!valid.textReg(name)){
        //     return res
        //         .status(400)
        //         .send({ status: false, message: "enter valid name" });
        // }

    

        //===========================================email=====

        if (!email) {
            return res
                .status(400)
                .send({ status: false, message: "provide email"});
        }
        if (email == "")
        return res
          .status(400)
          .send({ status: false, message: "Please Enter email value" });
          
if ( typeof(email) != "string") {
            return res
                .status(400)
                .send({ status: false, message: "email must be in string"});
        }

        
         if(!validEmail(email)){
            return res
                .status(400)
                .send({ status: false, message: "enter valid email"});
         }
        // email = userData.email = email.trim()

        // if (!valid.emailValid(email)) {
        //     return res
        //         .status(400)
        //         .send({ status: false, message: "enter valid email id" });
        // }
        const emailExist = await userModel.findOne({ email: email });
        if (emailExist) {
            return res
                .status(400)
                .send({ status: false, message: "email is already exist" });
        }

//===============================================================

        if (!password ) {
            return res
                .status(400)
                .send({ status: false, message: "password is necessary" });
        }
        if (password == "")
        {return res
          .status(400)
          .send({ status: false, message: "Please Enter name value" });}
          
        if (typeof(password) != "string") {
            return res
                .status(400)
                .send({ status: false, message: "password is must be in string" });
        }
        // password = userData.password = password.trim()

       
        // if (!valid.passwordValid(password)) {
        //     return res
        //         .status(400)
        //         .send({ status: false, message: "Password should contain atleast 1 lowercase, 1 uppercase, 1 numeric ,1 special character, range between 8-12" });
        // }
//=========================================================================================

       
        const registeredData = await userModel.create(userData);
        res
            .status(201)
            .send({ status: true, message: "Success", data: registeredData });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}


const userLogin = async function(req,res){
    try {
        let data = req.body
        let {email, password} = data
        if(Object.keys(data).length==0){
            return res.status(400).send({status: false, message: "Please provide mandatory details"})
        }
//===========================email

        if(!email ){
            return res.status(400).send({status: false, message: "Please provide email-id "})
        }
        
        if( typeof(email) != "string"){
            return res.status(400).send({status: false, message: "Please provide email-id in string"})
        }
       
        if(!password ){
            return res.status(400).send({status: false, message: "Please provide password"})
        }
      
        if(typeof(password) != "string"){return res.status(400).send({status: false, message: "Please provide password in string"})}

        // password = data.password = password.trim()

        // if (!valid.passwordValid(password)) {
        //     return res
        //       .status(400)
        //       .send({ status: false, message: "Please provide valid password" });
        //   }
        //=========================================== finding the user data
        const userDetail = await userModel.findOne({email:email, password: password})
        if(!userDetail){
            return res.status(401).send({status: false, message: " email or password not matched"})
        }

        let payLoad = {userId : userDetail._id}

        let token = jwt.sign(
            payLoad ,
        "iprproject", {expiresIn : "1h" })

        res.status(200).send({status: true, message:"successfully login", data: {token}})
//=========================================================================
    } catch (error) {
        res.status(500).send({status: false, message: error.message})
    }
}


module.exports = { userLogin, userRegister }