const redirectHome=function (req,res){
    try{
        res.status(302).redirect('/home')
    }catch(err){
        res.status(500).send('Error get home')
    }
}
const getHome=function (req,res){
    try{
        res.status(200).render('users/home')
    }catch(err){
        res.status(500).send('error in get home')
    }
}

module.exports={
    getHome,
    redirectHome
}