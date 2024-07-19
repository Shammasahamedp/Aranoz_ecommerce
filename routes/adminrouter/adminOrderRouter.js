const express=require('express')
const adminOrderRouter=express.Router()
const adminOrderController=require('../../controllers/admin/adminOrderController')
const adminMiddleware=require('../../middlewares/adminMiddleware')
adminOrderRouter.get('/',adminMiddleware.isAuthenticated,adminOrderController.getOrder)
module.exports=adminOrderRouter