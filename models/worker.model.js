const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    worker_id: {
        type: String,
        required: true,
        unique: true
    },
    worker_name: {
        type: String,
        required: true
    },
    worker_address: {
        type: String,
    },
    worker_mobile_number: {
        type: Number,
        required: true
    },
    worker_image: {
        type: String
    },
    worker_public_id: {
        type: String
    },
    worker_total_payment: {
        type: Number
    },
    worker_total_dayWorking: {
        type: Number,
        default: 0
    },
    worker_remaining_payment: {
        type: Number,
        default: 0
    },
    worker_age: {
        type: String,
       
    },
    // worker_DOB: {
    //     type: String,
    //     enum: ['temp', 'permanent'], 
    //     required: true
    // },
    current_userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required:true
    },
    worker_gender:{
        type:String,
        enum:['Female', 'Male', 'M/F'],

    },
    attendance: [
        {
          attendanceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WorkerAttendance",
          },
          attendanceDate: { type: Date },
          status: {
            type: String
          }
        },
      ],
}, { timestamps: true });

const Worker = mongoose.model("worker", workerSchema);
module.exports = Worker;
