const express=require('express')
const userMiddleware=require('../../middlewares/userMiddleware')
const userHomeController=require('../../controllers/user/userHomeController')
const userAuthController=require('../../controllers/user/userAuthController')
const adminAuthRouter=express.Router()

adminAuthRouter.get('/login',userMiddleware.isUserNotAuthenticated,userAuthController.getLogin)
adminAuthRouter.get('/signup',userMiddleware.isUserNotAuthenticated,userAuthController.getSignup)
module.exports=adminAuthRouter