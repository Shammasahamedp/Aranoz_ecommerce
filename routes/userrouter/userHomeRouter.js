const express=require('express')
const userHomeRouter=express.Router()
const userHomeController=require('../../controllers/user/userHomeController')
const userAuthController=require('../../controllers/user/userAuthController')
const userMiddleware=require('../../middlewares/userMiddleware')
userHomeRouter.get('/',userMiddleware.isUserAuthenticated,userHomeController.getAuthHome)
module.exports=userHomeRouter