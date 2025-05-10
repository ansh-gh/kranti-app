const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  { 
    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    partner_name: {
      type: String,
      required: true,
      trim: true,
      
    },
    partner_mobile_number: {
      type: Number, 
      required: true
    },
    partner_image: {
      type: String,
    },
    partner_public_id: {
      type: String,
    },
    partner_gender: {
      type: String,
      enum: ["Male", "Female", 'M/F'],
      default:"M/F"
    },
    partner_address: {
      type: String,
      trim: true,
      
    },
    partner_age:{
      type:String
  },
  partner_return: [
      {
        return_amount: {
          type: Number,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Partner = mongoose.model("Partner", partnerSchema);

module.exports = Partner;
