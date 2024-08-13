const express=require('express')
const userProductController=require('../../controllers/user/userProductController')
const userPrductRouter=express.Router()
userPrductRouter.get('/:id',userProductController.getProduct)




module.exports=userPrductRouter