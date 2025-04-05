const Investment = require("../models/investment.model");
const handleErrors = require("../services/handleErrors");
const mongoose = require('mongoose');
const investmentCreate = async (req, res, next) => {
  try {
    const { investment_type, investment_amount, investment_date,investment_category,investment_note } = req.body;

    if (!investment_type || !investment_date || !investment_amount) {
      return next(
        handleErrors(400, "Please provide investment type, amount, and date.")
      );
    }

    if (!req.user || !req.user.id) {
      return next(
        handleErrors(401, "You must be logged in to add an investment.")
      );
    }

    const newInvestment = new Investment({
      current_userId: req.user.id,
      investment_type,
      investment_amount,
      investment_date,
      investment_category,
      investment_note
    });

    await newInvestment.save();

    return res.status(200).json({
      success: true,
      message: "Investment added successfully.",
    });
  } catch (error) {
    return next(
      handleErrors(
        500,
        "Server error: Unable to add investment. Please try again later."
      )
    );
  }
};





const getInvestmentsGroupedByMonth = async (req, res, next) => {
  try {
      const mongoose = require('mongoose');
      const userId = new mongoose.Types.ObjectId(req.user.id); 
      
      const investments = await Investment.aggregate([
          { 
              $match: { 
                  current_userId: userId
              } 
          },
          {
              $addFields: {
                  dateObj: { $toDate: "$investment_date" }
              }
          },
          {
              $group: {
                  _id: {
                      year: { $year: "$dateObj" },
                      month: { $month: "$dateObj" },
                      monthYear: { $dateToString: { format: "%B %Y", date: "$dateObj" } }
                  },
                  investments: { $push: "$$ROOT" },
                  totalAmount: { $sum: "$investment_amount" }
              }
          },
          {
              $sort: {
                  "_id.year": 1,
                  "_id.month": 1
              }
          },
          {
              $group: {
                  _id: null,
                  years: {
                      $push: {
                          year: "$_id.year",
                          months: {
                              month: "$_id.month",
                              monthYear: "$_id.monthYear",
                              investments: "$investments",
                              totalAmount: "$totalAmount"
                          }
                      }
                  }
              }
          },
          {
              $unwind: "$years"
          },
          {
              $group: {
                  _id: "$years.year",
                  months: { $push: "$years.months" }
              }
          },
          {
              $sort: {
                  "_id": -1
              }
          }
      ]);

      // Format the data for the response
      const formattedData = {};
      investments.forEach(yearGroup => {
          yearGroup.months.forEach(monthData => {
              formattedData[monthData.monthYear] = {
                  investments: monthData.investments,
                  totalAmount: monthData.totalAmount
              };
          });
      });

      res.status(200).json({
          success: true,
          data: formattedData
      });
  } catch (error) {
      console.error("Error fetching investments:", error);
      res.status(500).json({ success: false, message: error.message });
  }
};

const investmentDelete = async (req, res, next) => {
  try {
    const { investmentId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    const deletedInvestment = await Investment.findOneAndDelete({
      _id: investmentId,
      current_userId: userId
    });

    if (!deletedInvestment) {
      return next(handleErrors(404, 'Investment not found or you are not authorized to delete it'));
    }

    return res.status(200).json({
      success: true,
      message: "Investment deleted successfully",
      data: deletedInvestment
    });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return next(handleErrors(500, "Failed to delete investment"));
  }
};


module.exports = { investmentCreate,getInvestmentsGroupedByMonth, investmentDelete };
