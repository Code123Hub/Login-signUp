

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const adminController = require("../controllers/AdminController");
const auth = require('../middleware/auth.js')


// ADMIN ROUTE

router.post("/admin/register",  adminController.adminRegister);
router.post("/admin/login", adminController.adminLogin);

// meeting schedule route

router.post('/admin/event-schedule',  adminController.scheduleEvent);



//USER ROUTE
router.post("/register",  userController.userRegister);
router.post("/login", userController.userLogin);
// router.post('/verify', userController.sendForgotPasswordEmail)
router.post("/verification/:userId", userController.emailVerification);
router.post("/verification2", userController.emailVerification);
router.post("/verifyOTP", userController.verifyOTP);
// router.post("email/:userId", userController.emailSend);
router.post("/reset-password", userController.changePassword);

router.all('*/', function(req, res){
    return res.status(400).send({status:false, message:"Invalid Path"})
})

module.exports = router;