const User=require('../../models/usersModel')
const Product=require('../../models/productsModel')
const getCart=async (req,res)=>{
    try{
        res.status(200).render('cart/cart')
    }catch(err){
        console.error(err)
    }
}

module.exports={
    getCart
}