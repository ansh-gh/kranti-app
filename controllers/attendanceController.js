const WorkerAttendance = require("../models/attendance.model");
const Worker = require("../models/worker.model");
const handleErrors = require("../services/handleErrors");
const Production=require('../models/production.model')

const saveAttendance = async (req, res, next) => {
  try {
    const { workerId, attendanceDate, attendanceTime,status,working_area } = req.body;
    
    if (!workerId || !attendanceDate) {
      return next(
        handleErrors(
          401,
          "Please provide workerId and attendanceDate."
        )
      );
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return next(handleErrors(404, "Worker not found"));
    }

    const existAttendance = await WorkerAttendance.findOne({
      workerId,
      current_userId: req.user.id,
      attendanceDate,
    });

    if (existAttendance) {
            // ✅ Check if status is "Paid", prevent deletion
            if (existAttendance.status === "Paid") {
              return res.status(403).json({
                message: "Cannot change attendance, Amount  is 'Paid' till Today."
              });
            }
      
            // ✅ Delete attendance if status is not "Paid"
            await WorkerAttendance.deleteOne({ _id: existAttendance._id });
      

      await Worker.findByIdAndUpdate(workerId, {
        $pull: {
          attendance: {
            attendanceId: existAttendance._id,
            attendanceDate: existAttendance.attendanceDate,
            status:existAttendance.status
          },
        },
      });

      return res
        .status(200)
        .json({
          success:true,
          message: "Attendance deleted successfully" });
    }

    const newAttendance = new WorkerAttendance({
      workerId,
      attendanceDate,
      attendanceTime,
      current_userId: req.user.id,
      status,
      working_area
    });

    await newAttendance.save();

    await Worker.findByIdAndUpdate(workerId, {
      $push: {
        attendance: {
          attendanceId: newAttendance._id,
          attendanceDate: newAttendance.attendanceDate,
          status:newAttendance.status
        },
      },
    });

    return res
      .status(200)
      .json({ success:true, message: "Attendance saved successfully", newAttendance });
  } catch (error) {
    return next(handleErrors(500, "Server error"));
  }
};




const getAttendance = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const userId = req.user.id;



    if (!workerId) {
      return next(handleErrors(400, "workerId is required"));
    }

    const attendanceRecords = await WorkerAttendance.find({
      workerId,
      current_userId: userId,
    });

    if (!attendanceRecords || attendanceRecords.length === 0) {
      return next(handleErrors(404, "No attendance records found"));
    }


    return res.status(200).json({
      success:true,
      attendance: attendanceRecords,
      
    });
  } catch (error) {
    return next(handleErrors(500, "Server error"));
  }
};

const getProductionName = async (req, res, next) => {
  try {
    
    const userId = req.user.id;

    const userProductions = await Production.find({ current_userId: userId })
    .select('production_name');

    return res.status(200).json({
      success:true,
      productionNames: userProductions.map(p => p.production_name)
      
    });
  } catch (error) {
    return next(handleErrors(500, "Server error"));
  }
};



module.exports = { saveAttendance,getAttendance,getProductionName };
