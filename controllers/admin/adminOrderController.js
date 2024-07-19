const Order=require('../../models/ordersModel')

const getOrder=async(req,res)=>{
    try{
        const orders=await Order.find()
        console.log(orders)
        res.status(200).render()
    }catch(err){

    }
}

module.exports={
    getOrder
}