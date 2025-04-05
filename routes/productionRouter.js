const express = require('express');
const authUser = require('../middleware/authUser');
const { addProduction, showProduction, addProductionDetails,getProductionByIdAndUser, deleteProductionDetail, deleteProduction } = require('../controllers/productionController');
const productionRouter = express.Router();

productionRouter.post('/production-add',authUser,addProduction); 
productionRouter.get('/production-show',authUser,showProduction); 

productionRouter.post('/production/:productionId/details',authUser, addProductionDetails)
productionRouter.delete('/delete-production/:productionId', authUser, deleteProduction);

productionRouter.delete('/delete-date-production', authUser, deleteProductionDetail);



productionRouter.get('/production/:id',authUser ,getProductionByIdAndUser);

module.exports = productionRouter;