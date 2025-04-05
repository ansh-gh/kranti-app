const PInvestment = require("../models/pinvestment.model");
const handleErrors = require("../services/handleErrors");
const mongoose = require("mongoose");



const addInvestment = async (req, res, next) => {
  try {
    const {
      investor_role,
      investor_amount,
      investor_catrogry,
      investor_note,
      investing_date,
      partner_id,
      seeds_name
    } = req.body;

    if (!investor_role || !investor_amount || !partner_id) {
      return next(handleErrors(404, "enter role and amount"));
    }
    const userId = req.user.id;

    const investment = new PInvestment({
      current_userId: userId,
      seeds_name,
      investor_amount,
      investor_catrogry,
      investor_note,
      investing_date,
      partner_id,
      investor_role
    });

    await investment.save();

    res
      .status(201)
      .json({ message: "Investment added successfully", investment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};






const pinvestmentDelete = async (req, res, next) => {
    try {
      const { investmentId } = req.params;
      const userId = req.user.id
      
      const deletedInvestment = await PInvestment.findOneAndDelete({
        _id: investmentId,
        current_userId: userId
      });
  
      if (!deletedInvestment) {
        return next(handleErrors(404, 'Investment not found or you are not authorized to delete it'));
      }
  
      return res.status(200).json({
        success: true,
        message: "Investment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting investment:", error);
      return next(handleErrors(500, "Failed to delete investment"));
    }
  };
  
  


  
  const getAllInvestments = async (req, res) => {
    try {
      const userId = req.user?.id;
      let { partner_id } = req.params;
  
      
  
      if (!partner_id || !mongoose.Types.ObjectId.isValid(partner_id)) {
        return res.status(400).json({ success: false, message: "Invalid Partner ID" });
      }
  
      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }
  
      const query = {
        current_userId: userId,
        partner_id: new mongoose.Types.ObjectId(partner_id),
      };
  
      const investments = await PInvestment.find(query);
  
      console.log("Fetched Investments:", investments);
  
      if (!investments.length) {
        return res.status(200).json({
          success: true,
          message: "No investments found",
          totalInvestments: 0,
          groupedInvestments: [],
        });
      }
  
      // Grouping Logic
      const groupedInvestments = {};
  
      investments.forEach((investment) => {
        const date = new Date(investment.investing_date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM format
  
        if (!groupedInvestments[monthYear]) {
          groupedInvestments[monthYear] = { monthYear, totalAmount: 0, investments: [] };
        }
  
        groupedInvestments[monthYear].totalAmount += investment.investor_amount;
        groupedInvestments[monthYear].investments.push({
          _id: investment._id,
          amount: investment.investor_amount,
          date: investment.investing_date.toISOString().split("T")[0],
          category: investment.investor_catrogry,
          note: investment.investor_note,
          userId: investment.current_userId,
          investor_role:investment.investor_role,
          seeds_name:investment.seeds_name
        });
      });
  
      const result = Object.values(groupedInvestments).sort(
        (a, b) => new Date(b.monthYear) - new Date(a.monthYear)
      );
  
      console.log("Final Grouped Investments:", JSON.stringify(result, null, 2));
  
      res.status(200).json({
        success: true,
        totalInvestments: investments.length,
        groupedInvestments: result,
      });
  
    } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching investments",
        error: error.message,
      });
    }
  };
  



module.exports = { addInvestment, getAllInvestments,pinvestmentDelete };
