const express=require('express')
const adminOfferRouter=express.Router()
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminOfferController=require('../../controllers/admin/adminOfferController')
adminOfferRouter.get('/',adminMiddleware.isAuthenticated,adminOfferController.getOffer)
adminOfferRouter.get('/addoffer',adminMiddleware.isAuthenticated,adminOfferController.getAddOffer)
adminOfferRouter.get('/addoffer/getcategories',adminMiddleware.isAuthenticated,adminOfferController.getCategory)
module.exports=adminOfferRouter