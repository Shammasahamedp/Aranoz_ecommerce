const express=require('express')
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminUserController=require('../../controllers/admin/adminUserController')
const adminUserRouter=express.Router()

adminUserRouter.get('/',adminMiddleware.isAuthenticated,adminUserController.getUsers)
adminUserRouter.post('/toggle/:id',adminMiddleware.isAuthenticated,adminUserController.toggleUser)

module.exports=adminUserRouter