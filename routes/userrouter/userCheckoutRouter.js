const express=require('express')
const userCartRouter = require('./userCartRouter')
const userCheckoutRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userCheckoutController=require('../../controllers/user/userCheckoutController')

userCheckoutRouter.get('/checkout/:id',userMiddleware.isUserAuthenticated,userCheckoutController.getCheckout)

module.exports=userCheckoutRouter