const express=require('express')
const userProductController=require('../../controllers/user/userProductController')
const userPrductRouter=express.Router()
userPrductRouter.get('/:id',userProductController.getProduct)
userPrductRouter.get('*',(req,res)=>{
    res.render('404/404usererror')
  })



module.exports=userPrductRouter