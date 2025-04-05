const mongoose = require('mongoose');
const Worker = require('../models/worker.model');
const WorkerAttendance = require('../models/attendance.model');
const Investment = require('../models/investment.model');
const PaymentHistory = require('../models/history.model');
const handleErrors = require('../services/handleErrors');


async function processWorkerPayment(req, res,next) {
    try {
        const { workerId, totalPayment, remainingAmount, paymentMethod,day } = req.body;
        const loggedInUserId = req.user.id;
        
        const today = new Date().toISOString().replace("Z", "+00:00");

        const worker = await Worker.findOne({ _id: workerId, current_userId: loggedInUserId });

        if (!worker) {
           return next(handleErrors(401, 'Unauthorized: You can only update your own workers'))
        }
        await Worker.findByIdAndUpdate(workerId, {
            $set: { 
                worker_total_payment: totalPayment, 
                worker_remaining_payment: remainingAmount 
            }
        });

       
        await WorkerAttendance.updateMany(
            { workerId: workerId, status: 'Present', attendanceDate: { $lt: today } },
            { $set: { status: 'Paid' } }
        );

        
        await Worker.updateOne(
            { _id: workerId },
            { $pull: { attendance: { attendanceDate: { $lt: today } } } }
        );

        
        const paymentHistory = new PaymentHistory({
            worker_id: workerId,
            worker_name: worker.worker_name,
            total_amount_pay: totalPayment,
            remaining_amount: remainingAmount,
            payment_method: paymentMethod,
            payment_status: remainingAmount > 0 ? 'Partial' : 'Paid',
            current_userId: loggedInUserId,
            day:day
        });

        
        await paymentHistory.save();

       
        const investment = new Investment({
            current_userId: loggedInUserId,
            investment_type: 'Worker Payment',
            investment_amount: totalPayment,
            investment_date: new Date().toISOString().split('T')[0],
            investment_category: 'Worker',
            investment_note: `Payment to worker ${worker.worker_name}`
        });
        
        await investment.save();

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully'
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment',
            error: error.message
        });
    }
}




const getPaymentHistory = async (req, res, next) => {
    try {
        const currentUserId = req.user._id; 
        const { worker_id } = req.params; 

        if (!worker_id) {
            return next(handleErrors(400, 'Worker ID is required'));
        }

        // ✅ Fetch worker details along with payment history
        const worker = await Worker.findOne({ _id:worker_id, current_userId:currentUserId });

        if (!worker) {
            return next(handleErrors(404, 'Worker not found'));
        }

        // ✅ Fetch payment history
        const history = await PaymentHistory.find({
            current_userId: currentUserId,
            worker_id: worker_id
        }).sort({ date: -1 });

        if (!history.length) {
            return res.status(200).json({
                success: true,
                message: "No payment history found for this worker",
                totalRecords: 0,
                worker_id: worker.worker_id, 
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            totalRecords: history.length,
            worker_id: worker.worker_id,
            data: history,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching payment history",
            error: error.message,
        });
    }
};



module.exports = { processWorkerPayment, getPaymentHistory };


