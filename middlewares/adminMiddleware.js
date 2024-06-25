const isAuthenticated=function (req,res,next){
        if(!req.session.admin){
           return res.status(401).redirect('/admin/login')
        }else{
            next()
        }
}
const isNotAuthenticated=function (req,res,next){
    if(req.session.admin){
         return res.redirect('/admin/dashboard')
    }else{
        next()
    }
}


module.exports={
    isAuthenticated,
    isNotAuthenticated
}