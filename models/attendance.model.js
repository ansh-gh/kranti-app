const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "worker",
      required: true,
    },
    attendanceDate: {
      type: Date,
      required: true,
    },
    attendanceTime: {
      type: Date, 
    },
    status:{
      type:String,
      enum:['Present','Paid'],
      default:'Present',
      trim:true
    },
    working_area:{
      type:String,
      default:"Others"
    }

  },
  { timestamps: true }
);

const WorkerAttendance = mongoose.model("WorkerAttendance", attendanceSchema);

module.exports = WorkerAttendance;




