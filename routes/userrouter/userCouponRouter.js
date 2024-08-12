const express=require('express')
const userCouponRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userCouponController=require('../../controllers/user/userCouponController')
userCouponRouter.get('/',userMiddleware.isUserAuthenticated,userCouponController.getCoupon)
userCouponRouter.post('/apply-coupon',userMiddleware.isUserAuthenticated,userCouponController.applyCoupon)
userCouponRouter.get('*',(req,res)=>{
    res.render('404/404usererror')
  })
module.exports=userCouponRouter