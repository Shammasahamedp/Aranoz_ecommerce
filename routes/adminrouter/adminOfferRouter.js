const express=require('express')
const adminOfferRouter=express.Router()
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminOfferController=require('../../controllers/admin/adminOfferController')
adminOfferRouter.get('/',adminMiddleware.isAuthenticated,adminOfferController.getOffer)
adminOfferRouter.get('/addoffer',adminMiddleware.isAuthenticated,adminOfferController.getAddOffer)
adminOfferRouter.post('/addproductoffer',adminMiddleware.isAuthenticated,adminOfferController.addProductOffer)
adminOfferRouter.post('/addcategoryoffer',adminMiddleware.isAuthenticated,adminOfferController.addCategoryOffer)
adminOfferRouter.get('/addoffer/getcategories',adminMiddleware.isAuthenticated,adminOfferController.getCategory)
adminOfferRouter.get('/addoffer/getproducts',adminMiddleware.isAuthenticated,adminOfferController.getProducts)

module.exports=adminOfferRouter