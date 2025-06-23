const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    current_userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true  ,'rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true
    }
},{timestamps:true});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;