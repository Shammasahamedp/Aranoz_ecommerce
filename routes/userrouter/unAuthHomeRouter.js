const express=require('express')
const userHomeRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userHomeController=require('../../controllers/user/userHomeController')
const userCategoryController=require('../../controllers/user/userCategoryController')
userHomeRouter.get('/',userMiddleware.isUserNotAuthenticated,userHomeController.redirectHome)
userHomeRouter.get('/home',userMiddleware.isUserNotAuthenticated,userHomeController.getHome)
userHomeRouter.get('/home/shopcategory',userCategoryController.getCategory)
userHomeRouter.get('/contact',userHomeController.getContact)

module.exports=userHomeRouter