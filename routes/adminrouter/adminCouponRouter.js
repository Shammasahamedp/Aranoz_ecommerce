const express=require('express')
const adminCouponRouter=express.Router()
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminCouponController=require('../../controllers/admin/adminCopounController')
adminCouponRouter.get('/',adminMiddleware.isAuthenticated,adminCouponController.getCoupon)
adminCouponRouter.get('/add',adminMiddleware.isAuthenticated,adminCouponController.getAddCoupon)
adminCouponRouter.post('/add',adminMiddleware.isAuthenticated,adminCouponController.postAddCoupon)
module.exports=adminCouponRouter