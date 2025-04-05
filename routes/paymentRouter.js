const express = require('express');
const { processWorkerPayment, getPaymentHistory } = require('../controllers/paymentController');
const authUser = require('../middleware/authUser');
const router = express.Router();

router.post('/process-payment',authUser, processWorkerPayment);
router.get('/payment-history/:worker_id',authUser, getPaymentHistory);

module.exports = router;