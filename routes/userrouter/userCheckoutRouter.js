const express=require('express')
const userCartRouter = require('./userCartRouter')
const userCheckoutRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userCheckoutController=require('../../controllers/user/userCheckoutController')

userCheckoutRouter.get('/checkout/:id',userMiddleware.isUserAuthenticated,userCheckoutController.getCheckout)
userCheckoutRouter.post('/checkout/order-cashondelivery',userMiddleware.isUserAuthenticated,userCheckoutController.cashOnDelivery)
userCheckoutRouter.get('/checkout/order-cashondelivery/order-success',userMiddleware.isUserAuthenticated,userCheckoutController.orderSuccess)
userCheckoutRouter.post('/checkout/order-wallet',userMiddleware.isUserAuthenticated,userCheckoutController.walletOrder)
userCheckoutRouter.get('/checkout/order-wallet/order-success',userMiddleware.isUserAuthenticated,userCheckoutController.orderSuccess)
userCheckoutRouter.get('*',(req,res)=>{
    res.render('404/404usererror')
  })
module.exports=userCheckoutRouter