const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User ID is required"],
    },
    return_name: {
      type: String,
      required: [true, "Return name is required"],
    },
    return_amount: {
      type: Number,
      required: [true, "Return amount is required"],
    },
    return_date: {
      type: String,
      required: [true, "Return date is required"],
    },
    return_category: {
      type: String,
    },
    return_note: {
      type: String,
    },
  },
  { timestamps: true }
);

const Return = mongoose.model("return", returnSchema);
module.exports = Return;

