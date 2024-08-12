const express=require('express')
const adminSalesRouter=express.Router()
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminSalesController=require('../../controllers/admin/adminSalesController')
adminSalesRouter.get('/',adminMiddleware.isAuthenticated,adminSalesController.getSalesReport)
adminSalesRouter.get('/pdf-report',adminMiddleware.isAuthenticated,adminSalesController.getPdfReport)
adminSalesRouter.get('/excel-report',adminMiddleware.isAuthenticated,adminSalesController.getExcelReport)
adminSalesRouter.get('/get/:id',adminMiddleware.isAuthenticated,adminSalesController.getSalesReport)
adminSalesRouter.get('/getCustomdate',adminMiddleware.isAuthenticated,adminSalesController.getSalesReport)
adminSalesRouter.get('/getdata/:id',adminMiddleware.isAuthenticated,adminSalesController.getData)
adminSalesRouter.get('*',(req,res)=>{
    res.render('404/404adminerror')
  })
module.exports=adminSalesRouter