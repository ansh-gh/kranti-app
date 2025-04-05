const express = require('express');
const authUser = require('../middleware/authUser');
const { saveAttendance, getAttendance,getProductionName } = require('../controllers/attendanceController');
const attendanceRouter = express.Router();

attendanceRouter.post('/worker-attendance',authUser,saveAttendance); 
attendanceRouter.get('/worker-show/:workerId',authUser,getAttendance); 
attendanceRouter.get('/show-production-name',authUser,getProductionName); 

module.exports = attendanceRouter;
