const express=require('express')
const userHomeRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userHomeController=require('../../controllers/user/userHomeController')
userHomeRouter.get('/',userMiddleware.isUserNotAuthenticated,userHomeController.redirectHome)
userHomeRouter.get('/home',userMiddleware.isUserNotAuthenticated,userHomeController.getHome)

module.exports=userHomeRouter