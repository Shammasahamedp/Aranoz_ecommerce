const express=require('express')
const userMiddleware=require('../../middlewares/userMiddleware')
const userHomeController=require('../../controllers/user/userHomeController')
const userAuthController=require('../../controllers/user/userAuthController')
const {sendOtpMiddleware}=require('../../middlewares/otpMiddleware')

const userAuthRouter=express.Router()

userAuthRouter.get('/login',userMiddleware.isUserNotAuthenticated,userAuthController.getLogin)
userAuthRouter.post('/login',userMiddleware.isUserNotAuthenticated,userAuthController.postLogin)
userAuthRouter.get('/signup',userMiddleware.isUserNotAuthenticated,userAuthController.getSignup)
userAuthRouter.post('/signup',userMiddleware.isUserNotAuthenticated,userAuthController.postSignup,sendOtpMiddleware)
userAuthRouter.post('/verify-otp',userMiddleware.isUserNotAuthenticated,userAuthController.verifyOTP)
module.exports=userAuthRouter