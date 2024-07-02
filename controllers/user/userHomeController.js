const Product=require('../../models/productsModel')
const redirectHome=function (req,res){
    try{
        res.status(302).redirect('/home')
    }catch(err){
        res.status(500).send('Error get home')
    }
}
const getHome= async(req,res)=>{
    try{
       
        const products=await Product.aggregate([{
            $lookup:{
                from:'categories',
                localField:'category.id',
                foreignField:'_id',
                as:'categoryDetails'
            }
        },{
            $unwind:'$categoryDetails'
        },{
            $match:{
                'isListed':true,
                'categoryDetails.listed':true
            }
        }
    ])
        

        res.status(200).render('users/home',{products})
    }catch(err){
        console.error(err)
        res.status(500).send('error in get home')
    }
}
const getAuthHome=async(req,res)=>{
    try{
        const products=await Product.aggregate([{
            $lookup:{
                from:'categories',
                localField:'category.id',
                foreignField:'_id',
                as:'categoryDetailes'
            }
        },{
            $unwind:'$categoryDetailes'
        },{
            $match:{
                'isListed':true,
                'categoryDetailes.listed':true
            }
        }
    ])
       return  res.render('users/dashboard',{products})
    }catch(err){
        res.status(500).redirect('/user/error')
    }
}
module.exports={
    getHome,
    redirectHome,
    getAuthHome
}