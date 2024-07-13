const express=require('express')

const rateLimit=require('express-rate-limit')
const passport=require('passport')
const userMiddleware=require('../../middlewares/userMiddleware')
const userHomeController=require('../../controllers/user/userHomeController')
const userAuthController=require('../../controllers/user/userAuthController')
const {sendOtpMiddleware}=require('../../middlewares/otpMiddleware')
const userAuthRouter=express.Router()
const otpRateLimit=rateLimit({
    windowMs:60*1000,
    max:3,
    message:'Too many requests, please try again later'
})
userAuthRouter.get('/login',userMiddleware.isUserNotAuthenticated,userAuthController.getLogin)
userAuthRouter.post('/login',userMiddleware.isUserNotAuthenticated,userAuthController.postLogin)
userAuthRouter.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}))
userAuthRouter.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/user/auth/google/failure'}),userAuthController.googleAuthenticated)
userAuthRouter.get('/auth/google/failure',userMiddleware.isUserNotAuthenticated,userAuthController.googleSignFail)
userAuthRouter.get('/signup',userAuthController.getSignup)
userAuthRouter.post('/signup',userAuthController.postSignup,sendOtpMiddleware)
userAuthRouter.post('/resendotp',otpRateLimit,userAuthController.resendOtp,sendOtpMiddleware)
userAuthRouter.post('/verify-otp',userAuthController.verifyOTP)
userAuthRouter.post('/logout',userMiddleware.isUserAuthenticated,userAuthController.postLogout)
userAuthRouter.get('/forgotpassword',userMiddleware.isUserNotAuthenticated,userAuthController.getForgotpassword)
userAuthRouter.post('/forgotpassword',userMiddleware.isUserNotAuthenticated,userAuthController.postForgotPassword)
userAuthRouter.get('/resetpassword',userMiddleware.isUserNotAuthenticated,userAuthController.getResetPassword)
userAuthRouter.post('/resetpassword',userMiddleware.isUserNotAuthenticated,userAuthController.postResetPassword)
module.exports=userAuthRouter