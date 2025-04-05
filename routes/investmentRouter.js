const express=require('express')
const authUser = require('../middleware/authUser')
const { investmentCreate, getInvestmentsGroupedByMonth, investmentDelete } = require('../controllers/investmentController')
const investmentRouter=express.Router()

investmentRouter.post('/investment-add',authUser, investmentCreate)


investmentRouter.get('/investment-show',authUser, getInvestmentsGroupedByMonth)
investmentRouter.delete('/investment-delete/:investmentId', authUser, investmentDelete);







module.exports=investmentRouter