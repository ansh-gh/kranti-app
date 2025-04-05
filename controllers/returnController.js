const Return = require("../models/return.model");
const handleErrors = require("../services/handleErrors");
const mongoose = require("mongoose");
const Production = require("../models/production.model");
const Investment = require("../models/investment.model");

const returnCreate = async (req, res, next) => {
  try {
    const {
      return_name,
      return_amount,
      return_date,
      return_category,
      return_note,
    } = req.body;

    if (!return_name || !return_date || !return_amount) {
      return next(
        handleErrors(400, "Please provide return name, amount, and date.")
      );
    }

    if (!req.user || !req.user.id) {
      return next(
        handleErrors(401, "You must be logged in to add a return record.")
      );
    }

    const newReturn = new Return({
      current_userId: req.user.id,
      return_name,
      return_amount,
      return_date,
      return_category,
      return_note,
    });

    await newReturn.save();

    return res.status(201).json({
      success: true,
      message: "Return record added successfully.",
      return: newReturn,
    });
  } catch (error) {
    console.error("Error creating return record:", error);
    return next(
      handleErrors(
        500,
        "Server error: Unable to add return record. Please try again later."
      )
    );
  }
};



const returnDelete = async (req, res, next) => {
  try {
    const { returnId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const deletedReturn = await Return.findOneAndDelete({
      _id: returnId,
      current_userId: userId,
    });

    if (!deletedReturn) {
      return next(
        handleErrors(
          404,
          "Return record not found or you are not authorized to delete it"
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "Return record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting return record:", error);
    return next(handleErrors(500, "Failed to delete return record"));
  }
};

const getReturnsGroupedByMonth = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const returns = await Return.aggregate([
      {
        $match: {
          current_userId: userId,
        },
      },
      {
        $addFields: {
          dateObj: { $toDate: "$return_date" },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
            monthYear: { $dateToString: { format: "%B %Y", date: "$dateObj" } },
          },
          returns: { $push: "$$ROOT" },
          totalAmount: { $sum: "$return_amount" },
        },
      },
      {
        $sort: {
          "_id.year": -1,
          "_id.month": -1,
        },
      },
    ]);

    const formattedData = returns.map((monthGroup) => ({
      monthYear: monthGroup._id.monthYear,
      returns: monthGroup.returns,
      totalAmount: monthGroup.totalAmount,
    }));

    res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching returns:", error);
    return next(handleErrors(500, "Failed to fetch return records"));
  }
};




const getFinancialSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const currentDate = new Date();
  
    // 1. Get investments grouped by month
    const investmentsByMonth = await Investment.aggregate([
      { $match: { current_userId: userId } },
      { $addFields: { dateObj: { $toDate: "$investment_date" } } },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
            monthYear: { $dateToString: { format: "%B %Y", date: "$dateObj" } },
          },
          totalInvestment: { $sum: "$investment_amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
  
    // 2. Get production grouped by month
    const productionByMonth = await Production.aggregate([
      { $match: { current_userId: userId } },
      { $unwind: "$productionDetails" },
      { $addFields: { dateObj: "$productionDetails.date" } },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
            monthYear: { $dateToString: { format: "%B %Y", date: "$dateObj" } },
          },
          totalProductionValue: {
            $sum: {
              $multiply: [
                "$productionDetails.quantity",
                "$productionDetails.ratePerUnit",
              ],
            },
          },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
  
    // 3. Get returns grouped by day
    const returnsByDay = await Return.aggregate([
      { $match: { current_userId: userId } },
      { $addFields: { dateObj: { $toDate: "$return_date" } } },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
            day: { $dayOfMonth: "$dateObj" },
            dateString: { $dateToString: { format: "%Y-%m-%d", date: "$dateObj" } },
          },
          totalDailyReturn: { $sum: "$return_amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
    ]);
  
    // 4. Get returns grouped by month
    const returnsByMonth = await Return.aggregate([
      { $match: { current_userId: userId } },
      { $addFields: { dateObj: { $toDate: "$return_date" } } },
      {
        $group: {
          _id: {
            year: { $year: "$dateObj" },
            month: { $month: "$dateObj" },
            monthYear: { $dateToString: { format: "%B %Y", date: "$dateObj" } },
          },
          totalReturn: { $sum: "$return_amount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
    ]);
  
    // 5. Combine all data by month
    const allMonths = [
      ...new Set([
        ...investmentsByMonth.map((i) => i._id.monthYear),
        ...productionByMonth.map((p) => p._id.monthYear),
        ...returnsByMonth.map((r) => r._id.monthYear),
      ]),
    ];
  
    const monthlyData = allMonths.map((monthYear) => {
      const investment = investmentsByMonth.find((i) => i._id.monthYear === monthYear);
      const production = productionByMonth.find((p) => p._id.monthYear === monthYear);
      const returnData = returnsByMonth.find((r) => r._id.monthYear === monthYear);
  
      return {
        monthYear,
        investment: investment?.totalInvestment || 0,
        production: production?.totalProductionValue || 0,
        return: returnData?.totalReturn || 0,
        profit: (production?.totalProductionValue || 0) + (returnData?.totalReturn || 0) - (investment?.totalInvestment || 0),
      };
    });
  
    // 6. Calculate time period summaries (1, 3, 6, 12 months)
    const timePeriods = [1, 3, 6, 12];
    const periodSummaries = timePeriods.map((months) => {
      const startDate = new Date(currentDate);
      startDate.setMonth(startDate.getMonth() - months);
  
      const filteredData = monthlyData.filter((item) => {
        const [month, year] = item.monthYear.split(" ");
        const itemDate = new Date(`${month} 1, ${year}`);
        return itemDate >= startDate;
      });
  
      return {
        period: `${months} ${months === 1 ? "month" : "months"}`,
        totalInvestment: filteredData.reduce((sum, item) => sum + item.investment, 0),
        totalProduction: filteredData.reduce((sum, item) => sum + item.production, 0),
        totalReturn: filteredData.reduce((sum, item) => sum + item.return, 0),
        totalProfit: filteredData.reduce((sum, item) => sum + item.profit, 0),
      };
    });
  
    res.status(200).json({
      success: true,
      data: {
        monthlyData,
        periodSummaries,
        dailyReturns: returnsByDay,
      },
    });
  } catch (error) {
    console.error("Error in financial summary:", error);
    return next(handleErrors(500, "Failed to fetch financial summary"));
  }
  
};


module.exports = {
  returnCreate,

  returnDelete,
  getReturnsGroupedByMonth,
  getFinancialSummary,
};
