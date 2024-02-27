

const mongoose = require('mongoose')
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt')



const userRegister = async function (req, res) {
    try {
        console.log("some", req.body);
        let data = req.body;
        let { name, email, password } = data;
        // Trim and other validations if needed
        // ...
        if (email === "") return res.status(400).send({ status: false, message: `empty email not possible buddy` });
        if (password === "") return res.status(400).send({ status: false, message: `empty password not possible buddy` });
        if (name === "") return res.status(400).send({ status: false, message: `empty name  not possible buddy` });
       
        const foundEmail = await userModel.findOne({ email: email });
        if (foundEmail) return res.status(400).send({ status: false, message: `email already in use` });
        let createdData = await userModel.create(data);
        let token = jwt.sign(
            { userId: createdData._id, exp: Math.floor(Date.now() / 1000) + 86400 },
            "nehajaiswal"
          );
      
          let tokenInfo = { userId: createdData._id, token: token };
      
          res.setHeader('x-api-key', token)
        return res.status(201).send({ status: true, data: createdData, tokenData:tokenInfo });
    } catch (error) {
        return res.status(500).send({ status: false, message: `error ${error.message}` })
    }
}


const userLogin = async function(req,res){
    try {
        console.log("some", req.body);
        let data = req.body;
        let { email, password } = data;
        
        if (email === "") return res.status(400).send({ status: false, message: `empty email not possible buddy` });
        if (password === "") return res.status(400).send({ status: false, message: `empty password not possible buddy` });
        let foundUserName = await userModel.findOne({ email: email });
        if (!foundUserName) return res.status(400).send({ status: false, message: `${email} isn't available !!!` });
        console.log(foundUserName, password)
        if(foundUserName.password != password) return res.status(400).send({ status: false, message: `password is not valid` });
        
        let token = jwt.sign(
            { userId: foundUserName._id, exp: Math.floor(Date.now() / 1000) + 86400 },
            "nehajaiswal"
          );
      
          let tokenInfo = { userId: foundUserName._id, token: token };
      
          res.setHeader('x-api-key', token)
          return res.status(201).send({ status: true, data: foundUserName, tokenData:tokenInfo });
        } catch (error) {
            return res.status(500).send({ status: false, message: `error ${error.message}` })
        }
}


module.exports = { userLogin, userRegister }