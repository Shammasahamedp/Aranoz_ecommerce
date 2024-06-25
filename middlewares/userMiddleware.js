const isUserAuthenticated=function (req,res,next){
    if(!req.session.user){
       return res.status(401).redirect('/user/login')
    }else{
        next()
    }
}

const isUserNotAuthenticated=function (req,res,next){
    if(req.session.user){
       return  res.redirect('/user/profile')
    }else{
        next()
    }
}

module.exports={
    isUserAuthenticated,
    isUserNotAuthenticated
}