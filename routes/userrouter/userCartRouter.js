const express=require('express')
const userCartRouter=express.Router()
const userMiddleware=require('../../middlewares/userMiddleware')
const userCartController=require('../../controllers/user/userCartController')
userCartRouter.get('/',userMiddleware.isUserAuthenticated,userCartController.getCart)
userCartRouter.post('/updatecart',userMiddleware.isUserAuthenticated,userCartController.updateCart)
userCartRouter.delete('/deletecart/:id',userMiddleware.isUserAuthenticated,userCartController.deleteCart)
userCartRouter.get('*',(req,res)=>{
    res.render('404/404usererror')
  })
module.exports=userCartRouter



