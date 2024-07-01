const isUserAuthenticated=function (req,res,next){
    if(!req.session.user){
        console.log('user is not authenticated so redirect to user/login')
       return res.status(401).redirect('/user/login')
    }else{
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