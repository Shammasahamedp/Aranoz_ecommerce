const express=require('express')
const userHomeRouter=express.Router()
const userHomeController=require('../../controllers/user/userHomeController')

userHomeRouter.get('/',userHomeController.redirectHome)
userHomeRouter.get('/home',userHomeController.getHome)

module.exports=userHomeRouter