const express=require('express')
const authUser = require('../middleware/authUser')
const { createPartner, partnerUpdate, showPartner,findPartnerById, deletePartner } = require('../controllers/partnerController')
const upload = require('../middleware/cloudinary.upload')
const partnerRouter=express.Router()


partnerRouter.post('/create-partner', authUser, createPartner)

partnerRouter.post('/partner-update',authUser,upload.single("partner_image"), partnerUpdate)
partnerRouter.get('/partner-show', authUser, showPartner)
partnerRouter.get('/partner-show/:partner_id',authUser, findPartnerById)
partnerRouter.delete('/partner-delete/:id',authUser, deletePartner)
module.exports=partnerRouter