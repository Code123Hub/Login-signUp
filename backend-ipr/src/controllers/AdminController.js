


const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const admin = require("../models/adminModel");
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");
const contactModel = require("../models/contactModel")
const validation = require("../validations/validation");
const speakerModel = require("../models/speakerModel");
const testimonialModel = require("../models/testimonialModel");

const adminRegister = async function (req, res) {
  try {
    let userData = req.body;

    let { name, email, password } = userData;

    if (Object.keys(userData).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please provide required fields" });

    name = userData.name = name.trim();

    if (name == "")
      return res
        .status(400)
        .send({ status: false, message: "Please Enter  name value" });

    if (name != "admin")
      return res
        .status(400)
        .send({ status: false, message: "please provide valid  name " });

    //================================ email ======

    email = userData.email = email.trim().toLowerCase();
    if (email == "")
      return res
        .status(400)
        .send({ status: false, message: "Please enter email value" });

    if (email != "admin@gmail.com")
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct email " });

    //========= password ======

    password = userData.password = password.trim();
    if (password == "")
      return res
        .status(400)
        .send({ status: false, message: "Please provide password value" });

    if (password != "Admin@369")
      return res
        .status(400)
        .send({ status: false, message: "Please enter correct credentials" });

    //Encrypting password
    let hashing = bcrypt.hashSync(password, 10);
    userData.password = hashing;

    const userExist = await admin.findOne({ email: email });

    if (userExist) {
      if (userExist.email == email)
        return res.status(400).send({
          status: false,
          message: "admin already exist, please login to move further",
        });
    }

    const userCreated = await admin.create(userData);

    return res.status(201).send({
      status: true,
      message: "Admin Account has been successfully Registered",
      data: userCreated,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).send({ status: false, message: error.message });
  }
};

const adminLogin = async function (req, res) {
  try {
    let data = req.body;

    let { email, password } = data;

    let adminemail = "admin@gmail.com";
    let adminpassword = "Admin@369";

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please send data" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter Email" });

    email = data.email = email.trim();
    if (email == "")
      return res
        .status(400)
        .send({ status: false, message: "Please enter Email value" });

    if (email != adminemail)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid Email" });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    password = data.password = password.trim();

    if (password == "")
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    if (password != adminpassword)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid password" });

    //

    let isUserExist = await admin.findOne({ email: email });
    console.log("isuserExisit")
    console.log("isuserExisit",isUserExist)

    if (!isUserExist)
      return res
        .status(404)
        .send({ status: false, message: "No user found with given Email" });

    let passwordCompare = await bcrypt.compare(password, isUserExist.password);

    if (!passwordCompare)
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid password" });

    let token = jwt.sign(
      { userId: isUserExist._id, exp: Math.floor(Date.now() / 1000) + 86400 },
      "neha"
    );

    let tokenInfo = { userId: isUserExist._id, token: token, email: email };

    res.setHeader("x-api-key", token);

    return res
      .status(200)
      .send({ status: true, message: "Login Successful", data: tokenInfo });
  } catch (err) {
    return res.status(500).send({ status: false, error: err.message });
  }
};

const scheduleEvent = async function (req, res) {
  try {
    let data = req.body;
    console.log(data);
    let { title, time, endTime, date, location } = data;

    const [hours, minutes] = data.time.split(":").map(Number);

    const timeInMinutes = hours * 60 + minutes;
    const endTimeInMinutes = hours * 60 + minutes + 60;
    const dateInMilliseconds = new Date(data.date).getTime();

    time = data.time = timeInMinutes;
    endTime = data.endTime = endTimeInMinutes;
    date = data.date = dateInMilliseconds;

    console.log("Time in minutes:", time);
    console.log("Endtime in minutes:", endTime);
    console.log("Date in milliseconds:", date);
    console.log("location for event Schedule:", location);

    let overlappingEvents = await eventModel.find({
      date: date,
      location: location,
      $and: [{ time: { $lt: endTime } }, { endTime: { $gt: time } }],
      isDeleted: false,
    });

    console.log("data", data, "overlappingEvents", overlappingEvents);

    if (overlappingEvents.length !== 0) {
      return res.status(400).send({
        status: false,
        message: "Overlapping events detected",
        data: overlappingEvents,
      });
    }

    let scheduleEvent = await eventModel.create(data);
    return res.status(200).send({ status: true, data: scheduleEvent });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: `Error ${error.message}` });
  }
};

const getUserMeeting = async function (req, res) {
  try {
    let userId = req.params.userId;
    let userData = await userModel.findById(userId);
    let data = await meetingModel
      .find({
        $or: [{ conductedBy: userData.email }, { meetWith: userData.email }],
        isDeleted: false,
      })
      .sort({ date: 1, time: 1 });
    console.log("data", data);
    let newData = [];
    for (let i = 0; i < data.length; i++) {
      const formattedDate = new Date(data[i].date).toLocaleDateString();
      const formattedTime = convertMinutesToTime(data[i].time);
      const formattedEndTime = convertMinutesToTime(data[i].endTime);
      console.log(formattedDate, formattedTime, formattedEndTime);
      const updatedDate = formattedDate;
      const updatedStartTime = formattedTime;
      const updatedEndTime = formattedEndTime;

      const newObj = {
        _id: `${data[i]._id}`,
        title: `${data[i].title}`,
        time: updatedStartTime,
        date: updatedDate,
        endTime: updatedEndTime,
        meetWith: `${data[i].meetWith}`,
        conductedBy: `${data[i].conductedBy}`,
        isDeleted: `${data[i].isDeleted}`,
      };
      newData.push(newObj);
    }
    console.log("newData", newData);
    if (newData.length === 0) {
      console.log("no data found");
      return res.status(404).send({ status: false, message: "No Data found" });
    }
    return res.status(200).send({ status: true, data: newData });
  } catch (error) {
    return res
      .status(500)
      .send({ status: false, message: `error ${error.message}` });
  }
};

const contactUpdate = async function(req,res){
  try{
    let data = req.body;
    let {contactNo, mailId} = data;
    if(contactNo){
      if(typeof contactNo != "string")  return res.status(400).send({ status: false, message: "number should be in string" });
      if (!validation.validateNumber(contactNo)) return res.status(400).send({ status: false, message: "Please provide valid contact Id" });
    }
    if(mailId){
      if(typeof mailId != "string")  return res.status(400).send({ status: false, message: "mailId should be in string" });
      mailId = data.mailId = mailId.trim().toLowerCase()
      if (mailId == "") return res.status(400).send({ status: false, message: "Please enter mailId value" });
      if (!validation.validateEmail(mailId)) return res.status(400).send({ status: false, message: "Please provide valid Mail Id" });
    }
    let isAlreadyExist = await contactModel.find();
    if(isAlreadyExist.length == 0) {
    let createContact = await contactModel.create(data);
    res.status(201).send({status:true, message:"new Contact Created", "data":createContact})
    }
    let updateContactInfo = await contactModel.findOneAndUpdate({},data,{new: true});
    res.status(200).send({status:true, message:"Existing Contact Updated", "data":updateContactInfo});
  }
  catch (error) {
    return res
      .status(500)
      .send({ status: false, message: `error ${error.message}` });
  }
}

const speakerInfo = async function (req,res){
  try {
    let userData = req.body;
    let {name, designation, location, topic, date} = userData;
    if (Object.keys(userData).length == 0) return res.status(400).send({ status: false, message: "please provide required fields" });

    if (!name) return res.status(400).send({ status: false, message: " name is mandatory" });
    if (typeof name!= "string") return res.status(400).send({ status: false, message: " name should be in string" });
    name = userData.name = name.trim();
    if (name == "") return res.status(400).send({ status: false, message: "Please Enter name value" });

    if (!designation) return res.status(400).send({ status: false, message: " designation is mandatory" });
    if (typeof designation!= "string") return res.status(400).send({ status: false, message: " designation should be in string" });
    designation = userData.designation = designation.trim();
    if (designation == "") return res.status(400).send({ status: false, message: "Please Enter designation value" });

    if (!location) return res.status(400).send({ status: false, message: " location is mandatory" });
    if (typeof location!= "string") return res.status(400).send({ status: false, message: " location should be in string" });
    location = userData.location = location.trim();
    if (location == "") return res.status(400).send({ status: false, message: "Please Enter location value" });

    if (!topic) return res.status(400).send({ status: false, message: " topic is mandatory" });
    if (typeof topic!= "string") return res.status(400).send({ status: false, message: " topic should be in string" });
    topic = userData.topic = topic.trim();
    if (topic == "") return res.status(400).send({ status: false, message: "Please Enter topic value" });

    if (!date) return res.status(400).send({ status: false, message: " date is mandatory" });
    if (typeof date!= "string") return res.status(400).send({ status: false, message: " date should be in string" });
    date = userData.date = date.trim();
    if (date == "") return res.status(400).send({ status: false, message: "Please Enter date value" });

    let createSpeaker = await speakerModel.create(userData);
    res.status(200).send({status:true, message:"Speaker Added", "data":createSpeaker});
    
  } catch (error) {
    return res
    .status(500)
    .send({ status: false, message: `error ${error.message}` });
  }
}

const testimonial = async function (req,res){
  try {
    let userData = req.body;
    let {name, description, location, topic, date, speakerName} = userData;
    if (Object.keys(userData).length == 0) return res.status(400).send({ status: false, message: "please provide required fields" });

    if (!name) return res.status(400).send({ status: false, message: " name is mandatory" });
    if (typeof name!= "string") return res.status(400).send({ status: false, message: " name should be in string" });
    name = userData.name = name.trim();
    if (name == "") return res.status(400).send({ status: false, message: "Please Enter name value" });

    if (!description) return res.status(400).send({ status: false, message: " description is mandatory" });
    if (typeof description!= "string") return res.status(400).send({ status: false, message: " description should be in string" });
    description = userData.description = description.trim();
    if (description == "") return res.status(400).send({ status: false, message: "Please Enter description value" });

    if (!location) return res.status(400).send({ status: false, message: " location is mandatory" });
    if (typeof location!= "string") return res.status(400).send({ status: false, message: " location should be in string" });
    location = userData.location = location.trim();
    if (location == "") return res.status(400).send({ status: false, message: "Please Enter location value" });

    if (!topic) return res.status(400).send({ status: false, message: " topic is mandatory" });
    if (typeof topic!= "string") return res.status(400).send({ status: false, message: " topic should be in string" });
    topic = userData.topic = topic.trim();
    if (topic == "") return res.status(400).send({ status: false, message: "Please Enter topic value" });

    if (!date) return res.status(400).send({ status: false, message: " date is mandatory" });
    if (typeof date!= "string") return res.status(400).send({ status: false, message: " date should be in string" });
    date = userData.date = date.trim();
    if (date == "") return res.status(400).send({ status: false, message: "Please Enter date value" });

    if (!speakerName) return res.status(400).send({ status: false, message: " speakerName is mandatory" });
    if (typeof speakerName!= "string") return res.status(400).send({ status: false, message: " speakerName should be in string" });
    speakerName = userData.speakerName = speakerName.trim();
    if (speakerName == "") return res.status(400).send({ status: false, message: "Please Enter speakerName value" });
    let foundSpeaker = await speakerModel.findOne({name:speakerName});
    if(!foundSpeaker) return res.status(400).send({ status: false, message: "Please enter proper speaker name" });

    let createTestimonial = await testimonialModel.create(userData);

    res.status(200).send({status:true, message:"testimonial Added", "data":createTestimonial});
    
  } catch (error) {
    return res
    .status(500)
    .send({ status: false, message: `error ${error.message}` });
  }
}

const getcontact = async function (req, res){
  try {
    let getContactDetails = await contactModel.find();
    if(getContactDetails.length != 0) return res.status(404).send({ status: false, message: "No contact details found" });
    return res.status(200).send({"status":true, "message":"contact Details", "data":getContactDetails})
  } catch (error) {
    return res
    .status(500)
    .send({ status: false, message: `error ${error.message}` });
  }
}

const deleteContact = async function (req,res){
  try {
      let checkContact = await contactModel.find();
        if (checkContact[0].isDeleted == true)
            return res.status(400).send({ status: false, message: "Contact already deleted" })

        let deletePro = await productModel.findOneAndUpdate({ _id: contactId, isDeleted: false },
            { $set: { isDeleted: true } })

        return res.status(200).send({ status: true, message: "success", message: "deleted successfully " })
  } catch (error) {
    return res
    .status(500)
    .send({ status: false, message: `error ${error.message}` });
  }
}

const speaker = async function (req, res){
  try {
    let getSpeakerModel = await speakerModel.find();
    if(getSpeakerModel.length != 0) return res.status(404).send({ status: false, message: "No contact details found" });
    return res.status(200).send({"status":true, "message":"speakers Details", "data":getSpeakerModel})
  } catch (error) {
    return res
    .status(500)
    .send({ status: false, message: `error ${error.message}` });
  }
}

const speakerUpdate = async function (req, res) {
    try {
        let userData = req.body;
        let speakerId = req.params.speakerId;
        let { name, designation, location, topic, date, mongoId } = userData;
        if (!speakerId) return res.status(400).send({ status: false, message: "Please provide speakerId" });

        if (Object.keys(userData).length == 1) return res.status(400).send({ status: false, message: "No fields to update" });

        if (name) {
            if (typeof name !== "string") return res.status(400).send({ status: false, message: "name should be a string" });
            userData.name = name.trim();
        }

        if (designation) {
            if (typeof designation !== "string") return res.status(400).send({ status: false, message: "designation should be a string" });
            userData.designation = designation.trim();
        }

        if (location) {
            if (typeof location !== "string") return res.status(400).send({ status: false, message: "location should be a string" });
            userData.location = location.trim();
        }

        if (topic) {
            if (typeof topic !== "string") return res.status(400).send({ status: false, message: "topic should be a string" });
            userData.topic = topic.trim();
        }

        if (date) {
            if (typeof date !== "string") return res.status(400).send({ status: false, message: "date should be a string" });
            userData.date = date.trim();
        }

        let updatedSpeaker = await speakerModel.findOneAndUpdate({ _id: speakerId },userData,{ new: true });

        if (!updatedSpeaker) {
            return res.status(404).send({ status: false, message: "Speaker not found" });
        }

        res.status(200).send({ status: true, message: "Speaker Updated", data: updatedSpeaker });

    } catch (error) {
        return res.status(500).send({ status: false, message: `Error: ${error.message}` });
    }
}

const speakerDelete = async function (req, res) {
    try {
      let speakerId = req.params.speakerId;
      if (!speakerId) return res.status(400).send({ status: false, message: "Please provide speakerId" });
        const deletedSpeaker = await speakerModel.findOneAndUpdate({ _id: speakerId, isDeleted:false },{$set:{isDeleted:true}});
        if (!deletedSpeaker) {
            return res.status(404).send({ status: false, message: "Speaker not found" });
        }

        res.status(200).send({ status: true, message: "Speaker deleted successfully", data: deletedSpeaker });
    } catch (error) {
        return res.status(500).send({ status: false, message: `Error: ${error.message}` });
    }
}

module.exports = { adminRegister, adminLogin, scheduleEvent, getUserMeeting ,contactUpdate, speakerInfo, testimonial,getcontact,deleteContact, speaker, speakerUpdate,speakerDelete};