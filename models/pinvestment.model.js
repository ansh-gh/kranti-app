const mongoose = require("mongoose");

const partnerInvestmentSchema = new mongoose.Schema({
    current_userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    partner_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Partner",
        required: true
    },
    investor_role: { 
        type: String, 
        required: true
    },
    investor_amount: {
        type: Number,
        required: true,
    },
    investing_date: {
        type: Date, 
        required: true 
    },
    investor_catrogry: {
        type: String,
        enum: ["Seeds", "Fertilizer", "Equipment", "Labor", "Others"],
        default: "Others"
    },
    investor_note: {
        type: String,
        trim: true
    },
    seeds_name:{
        type:String
    }

}, { timestamps: true });

const PInvestment = mongoose.model("p_investment", partnerInvestmentSchema);

module.exports = PInvestment;
