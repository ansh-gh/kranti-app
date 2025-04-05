const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    worker_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    worker_name: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    total_amount_pay: {
      type: Number,
      required: true,
    },
    remaining_amount: {
      type: Number,
      default: 0,
    },
    payment_method: {
      type: String,
      enum: ["CASH", "UPI", "OTHER"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["Paid", "Pending", "Partial"],
      default: "Pending",
    },
    day:{
      type:String,
      default:0
    },

    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    
     expiresAt: { 
      type: Date, 
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 2592000 } 
    }
  },
  { timestamps: true }
);

const PaymentHistory = mongoose.model("PaymentHistory", historySchema);

module.exports = PaymentHistory;
