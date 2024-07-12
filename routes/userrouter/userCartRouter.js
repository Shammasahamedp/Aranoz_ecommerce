const express=require('express')
const userCartRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userCartController=require('../../controllers/user/userCartController')
userCartRouter.get('/',userMiddleware.isUserAuthenticated,userCartController.getCart)
module.exports=userCartRouter



