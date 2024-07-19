const Order=require('../../models/ordersModel')

const getOrder=async(req,res)=>{
    try{
        const userId=req.session.user
        const orders=await Order.find({userId}).populate('items.productId')
        console.log(orders)
        res.status(200).render('orders/usersOrder',{orders})
    }catch(err){
        console.error(err)
    }
}
const getOrderDetails=async(req,res)=>{
    try{
        
    }catch(err){

    }
}
module.exports={
    getOrder,
    getOrderDetails
}