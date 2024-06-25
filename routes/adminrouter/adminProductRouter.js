const express=require('express')
const upload=require('../../middlewares/uploadImageMiddleware')
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminProductController=require('../../controllers/admin/adminProductController')
const adminProductRouter=express.Router()
const multer=require('multer')
const path=require('path')

adminProductRouter.get('/',adminMiddleware.isAuthenticated,adminProductController.getProducts)
adminProductRouter.get('/addproduct',adminMiddleware.isAuthenticated,adminProductController.getAddProduct)
adminProductRouter.post('/addproduct',adminMiddleware.isAuthenticated,adminProductController.postAddProduct)
module.exports= adminProductRouter
