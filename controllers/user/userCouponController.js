const Coupon=require('../../models/couponModel')
const Order=require('../../models/ordersModel')
const getCoupon=async(req,res)=>{
    try{
        const coupons=await Coupon.find({})
        res.status(200).render('users/coupons',{coupons})
    }catch(err){
        console.error(err)
    }
}
const applyCoupon=async(req,res)=>{
    try{
        let {couponCode,totalPrice}=req.body
        const userId=req.session.user
        const coupon=await Coupon.findOne({couponCode})
        console.log(coupon)
        if(!coupon){
            return res.status(404).json({message:'coupon not found'})
        }
        console.log(coupon.minPurchaseAmount)
        console.log(coupon.maxPurchaseAmount)
        console.log(Number(totalPrice))
        totalPrice=Number(totalPrice)
        if(coupon.minPurchaseAmount<totalPrice&&totalPrice<coupon.maxPurchaseAmount){
            totalPrice=totalPrice-(totalPrice*(coupon.discountPercentage/100))
            console.log(totalPrice)
          return   res.status(200).json({message:'successfully applied coupon',totalPrice})
        }else{
            res.status(403).json({message:'You are not eligible for this offer'})
        }
        
    }catch(err){
        console.error(err)
    }
}
module.exports={
    getCoupon,
    applyCoupon
}