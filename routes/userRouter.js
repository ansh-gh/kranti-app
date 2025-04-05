const express=require('express')
const { userRegister, userLogin, updateProfile, showProfile,passwordChange, verifyUser, logoutUser,verifyEmail } = require('../controllers/userController')
const upload = require('../middleware/cloudinary.upload')
const authUser = require('../middleware/authUser')
const {forgotPassword, verifyOtpAndResetPassword} = require("../controllers/forgateController")
const userRouter=express.Router()

userRouter.post('/register',userRegister)
userRouter.post('/verify-email',verifyEmail)
userRouter.post('/login',userLogin)
userRouter.get('/verify',authUser,verifyUser)
userRouter.get('/profile-get',authUser, showProfile)
userRouter.post('/update-password', authUser,passwordChange )
userRouter.post('/logout', authUser, logoutUser)
userRouter.post('/update-profile',authUser,upload.single('image'), updateProfile)

userRouter.post('/forgate-password', forgotPassword)
userRouter.post('/reset-password', verifyOtpAndResetPassword)



module.exports=userRouter