const express = require('express');
const authUser = require('../middleware/authUser');
const { returnCreate ,returnDelete,getReturnsGroupedByMonth,getFinancialSummary} = require('../controllers/returnController');


const returnRouter = express.Router();

returnRouter.post('/return-add', authUser, returnCreate);

returnRouter.get('/return-show', authUser, getReturnsGroupedByMonth);
returnRouter.delete('/return-delete/:returnId', authUser,returnDelete );
returnRouter.get('/financial-summary', authUser, getFinancialSummary);

module.exports = returnRouter;