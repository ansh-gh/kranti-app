const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    return_name: {
      type: String,
      required: true,
    },
    return_amount: {
      type: Number,
      required: true,
    },
    return_date: {
      type: String,
      required: true,
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
