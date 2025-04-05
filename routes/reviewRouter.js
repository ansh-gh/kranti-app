const express = require('express');
const authUser = require('../middleware/authUser');
const { createReview } = require('../controllers/reviewController');

const reviewRouter = express.Router();

// Routes for reviews
reviewRouter.post('/add-review', authUser, createReview)


module.exports = reviewRouter;