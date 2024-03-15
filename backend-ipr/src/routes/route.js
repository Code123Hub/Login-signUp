

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const adminController = require("../controllers/AdminController.js");
const auth = require('../middleware/auth.js')


// ADMIN ROUTE

router.post("/admin/register",  adminController.adminRegister);
router.post("/admin/login", adminController.adminLogin);
//contact 
router.post("/admin/contactUpdate/:adminId",auth.authentication, auth.authorizationForAdmin, adminController.contactUpdate);
router.get('/admin/contact', adminController.getcontact)
router.delete("/admin/contact/:adminId/:contactId",auth.authentication, auth.authorizationForAdmin, adminController.deleteContact )
//speaker
// router.post("/admin/speaker/:adminId",auth.authentication, auth.authorizationForAdmin, adminController.speakerInfo);
router.post("/admin/speaker", adminController.speakerInfo);
router.get('/admin/speaker', adminController.speaker);
router.put("admin/speaker/:adminId/:speakerId", auth.authentication, auth.authorizationForAdmin, adminController.speakerUpdate );
router.delete("admin/speaker/:adminId/:speakerId",auth.authentication, auth.authorizationForAdmin, adminController.speakerDelete);

router.post("/admin/testimonial/:adminId",auth.authentication, auth.authorizationForAdmin, adminController.testimonial)

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