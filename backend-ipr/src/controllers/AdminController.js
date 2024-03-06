


const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const admin = require("../models/adminModel");
const userModel = require("../models/userModel");
const eventModel = require("../models/eventModel");

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

module.exports = { adminRegister, adminLogin, scheduleEvent, getUserMeeting };
