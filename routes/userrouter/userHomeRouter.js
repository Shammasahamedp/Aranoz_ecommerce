const express=require('express')
const userHomeRouter=express.Router()
const userHomeController=require('../../controllers/user/userHomeController')
const userOrderController=require('../../controllers/user/userOrderController')
const userAuthController=require('../../controllers/user/userAuthController')
const userMiddleware=require('../../middlewares/userMiddleware')
userHomeRouter.get('/',userMiddleware.isUserAuthenticated,userHomeController.getAuthHome)
userHomeRouter.get('/profile',userMiddleware.isUserAuthenticated,userHomeController.getUserProfile)
userHomeRouter.post('/profile/edit',userMiddleware.isUserAuthenticated,userHomeController.postUserProfile)
userHomeRouter.post('/addtocart/:id',userMiddleware.isUserAuthenticated,userHomeController.postToCart)
userHomeRouter.get('/profile/address',userMiddleware.isUserAuthenticated,userHomeController.getAddress)
userHomeRouter.post('/profile/address/addaddress',userMiddleware.isUserAuthenticated,userHomeController.postAddAddress)
userHomeRouter.get('/profile/address/edit/:id',userMiddleware.isUserAuthenticated,userHomeController.getEditAddress)
userHomeRouter.post('/profile/address/edit/:id',userMiddleware.isUserAuthenticated,userHomeController.postEditAddress)
userHomeRouter.post('/profile/address/delete/:id',userMiddleware.isUserAuthenticated,userHomeController.deleteAddress)
userHomeRouter.get('/profile/orders',userMiddleware.isUserAuthenticated,userOrderController.getOrder)
userHomeRouter.get('/profile/orders/:id',userMiddleware.isUserAuthenticated,userOrderController.getOrderDetails)
userHomeRouter.get('/profile/orders/get-invoice/:id',userMiddleware.isUserAuthenticated,userOrderController.getInvoice)
userHomeRouter.post('/profile/orders/cancel-order',userMiddleware.isUserAuthenticated,userOrderController.cancelOrder)
userHomeRouter.post('/profile/orders/cancel-order-single',userMiddleware.isUserAuthenticated,userOrderController.cancelSingleProduct)
userHomeRouter.get('/profile/wishlist',userMiddleware.isUserAuthenticated,userHomeController.getWishlist)
userHomeRouter.post('/profile/wishlist/remove',userMiddleware.isUserAuthenticated,userHomeController.deleteFromWishlist)
userHomeRouter.post('/add-to-wishlist',userMiddleware.isUserAuthenticated,userHomeController.addToWishlist)
userHomeRouter.get('/profile/wallet',userMiddleware.isUserAuthenticated,userHomeController.getWallet)
userHomeRouter.post('/profile/wallet/add-balance',userMiddleware.isUserAuthenticated,userHomeController.razorpayCreation)
userHomeRouter.post('/profile/wallet/add-balance/verifyrazorpay',userMiddleware.isUserAuthenticated,userHomeController.razorpayVarify)
userHomeRouter.post('/profile/orders/return-order',userMiddleware.isUserAuthenticated,userOrderController.returnOrder)
userHomeRouter.post('/profile/orders/return-order-single',userMiddleware.isUserAuthenticated,userOrderController.returnSingleProduct)

module.exports=userHomeRouter