const express=require('express')
const authUser = require('../middleware/authUser')
const { addInvestment , getAllInvestments,pinvestmentDelete } = require('../controllers/pinvestmentController')

const pInvestmentRouter=express.Router()

pInvestmentRouter.post('/p-investment', authUser,addInvestment)
pInvestmentRouter.get('/p-investment-details/:partner_id', authUser,getAllInvestments)
pInvestmentRouter.delete('/p-investment-delete/:investmentId', authUser,pinvestmentDelete)

module.exports= pInvestmentRouter
