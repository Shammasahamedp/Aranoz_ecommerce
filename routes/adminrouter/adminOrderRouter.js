const express=require('express')
const adminOrderRouter=express.Router()
const adminOrderController=require('../../controllers/admin/adminOrderController')
const adminMiddleware=require('../../middlewares/adminMiddleware')
adminOrderRouter.get('/',adminMiddleware.isAuthenticated,adminOrderController.getOrder)
adminOrderRouter.get('/single-order/:id',adminMiddleware.isAuthenticated,adminOrderController.getSingleOrder)
adminOrderRouter.post('/single-order/status',adminMiddleware.isAuthenticated,adminOrderController.changeStatus)
adminOrderRouter.get('*',(req,res)=>{
    res.render('404/404adminerror')
  })
module.exports=adminOrderRouter