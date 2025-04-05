const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    current_userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    investment_type: {
      type: String,
      required: true,
    },
    investment_amount: {
      type: Number,
      required: true,
    },
    investment_date: {
      type: String,
      required: true,
    },
    investment_category:{
      type:String,
      enum:['Seeds', 'Fertilizer', 'Equipment', 'Labor', 'Others' ,'Worker'],
      default:'Others'
    },
    investment_note:{
          type:String
    }
  },
  { timestamps: true }
);

const Investment = mongoose.model('investment', investmentSchema);
module.exports = Investment;
