const express=require('express')
const { createWorker, showWorker, workerUpdate, deleteWorker, findWorkerById } = require('../controllers/workerController')
const authUser = require('../middleware/authUser')
const upload = require('../middleware/cloudinary.upload')

const workerRouter=express.Router()


workerRouter.post('/worker-create',authUser, createWorker)
workerRouter.get('/worker-show',authUser, showWorker)
workerRouter.post('/worker-update',authUser,upload.single("worker_image"), workerUpdate)
workerRouter.delete('/worker-delete/:id',authUser,deleteWorker)


workerRouter.get("/worker-find/:worker_id", authUser, findWorkerById);

module.exports=workerRouter