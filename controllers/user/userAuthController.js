const getLogin= (req,res)=>{
    try{
        res.status(200).render('auth/login')
    }catch(err){
        res.status(500).send('Error got login')
    }
}
const postLogin=(req,res)=>{
    try{
        const {email,password}=req.body

    }catch(err){

    }
}
const getSignup=(req,res)=>{
    try{
        res.status(200).render('auth/signup')
    }catch(err){
        res.status(500).send('Error get signup')
    }
}
module.exports={
    getLogin,
    getSignup
}