

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

//USER
router.post("/register",  userController.userRegister);
router.post("/login", userController.userLogin)

router.all('*/', function(req, res){
    return res.status(400).send({status:false, message:"Invalid Path"})
})

module.exports = router;