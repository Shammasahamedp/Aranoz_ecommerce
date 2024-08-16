const { findById } = require('../models/adminModel')
const User=require('../models/usersModel')
const isUserAuthenticated=async function (req,res,next){
    
    
    if(!req.session.user){
        console.log('user is not authenticated so redirect to user/login')
       return res.status(401).redirect('/user/login')
    }else{
        const user=await User.findById(req.session.user)
        if(user.isBlocked){
            req.session.destroy()
            res.status(403).redirect('/user/login')
        }
        next()
    }
}

const isUserNotAuthenticated=function (req,res,next){
    if(req.session.user){
        console.log('user is authenticated and redirect to home')
       return  res.redirect('/user/dashboard')
    }else{
        next()
    }
}

module.exports={
    isUserAuthenticated,
    isUserNotAuthenticated
}