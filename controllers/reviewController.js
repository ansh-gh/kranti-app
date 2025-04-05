const Review = require("../models/review.model");
const User = require("../models/user.models");
const handleErrors=require('../services/handleErrors')


const createReview = async (req, res,next) => {
    try {
        const { rating, comment } = req.body;

       if(!comment){
            return next(handleErrors(409, 'please enter commnet'))
       }
        const newReview = new Review({
            current_userId: req.user.id, 
            rating,
            comment,
        });

        await newReview.save();

       return res.status(201).json({
             success: true,
              message: "Review added successfully", 
         });
    } catch (error) {
     return   res.status(500).json({ 
        success: false, 
        message: "somthing went wrong try again.",
     error: error.message });
    }
};


const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("current_userId", "name") 
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};


module.exports={createReview,getAllReviews}