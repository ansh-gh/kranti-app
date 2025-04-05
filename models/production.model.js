const mongoose = require('mongoose');


const getDefaultSession = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon'; 
  return 'Evening';
};

const productionSchema = new mongoose.Schema({
  production_name: {
    type: String,
    required: true,
    trim: true
  },
  production_unit: {
    type: String,
    required: true,
    trim: true
  },
  current_userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  productionDetails: [{
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      default: getDefaultSession,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    ratePerUnit: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      default: Date.now,
      required: true
    },
  }],
}, {
  timestamps: true
});



const Production = mongoose.model('Production', productionSchema);
module.exports = Production;