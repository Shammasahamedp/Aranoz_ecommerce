const express=require('express')
const adminMiddleware = require('../../middlewares/adminMiddleware')
const adminAuthController=require('../../controllers/admin/adminAuthController')
const adminAuthRouter=express.Router()

adminAuthRouter.get('/',adminMiddleware.isAuthenticated)
adminAuthRouter.get('/login',adminMiddleware.isNotAuthenticated,adminAuthController.getLogin)
adminAuthRouter.post('/login',adminAuthController.adminLogin)
adminAuthRouter.get('/dashboard',adminMiddleware.isAuthenticated,adminAuthController.getDashboard)
adminAuthRouter.get('/logout',adminAuthController.adminLogout)
adminAuthRouter.get('*',(req,res)=>{
    res.render('404/404adminerror')
})


module.exports=adminAuthRouter