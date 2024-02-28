

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

//USER
router.post("/register",  userController.userRegister);
router.post("/login", userController.userLogin);
// router.post('/verify', userController.sendForgotPasswordEmail)
router.post("/verification/:userId", userController.emailVerification);
router.post("/verification2", userController.emailVerification);
// router.post("/verifyOTP/:userId", userController.verifyOTP);
// router.post("email/:userId", userController.emailSend);
router.post("/reset-password", userController.changePassword);

router.all('*/', function(req, res){
    return res.status(400).send({status:false, message:"Invalid Path"})
})

module.exports = router;