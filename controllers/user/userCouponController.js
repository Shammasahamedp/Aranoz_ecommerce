const Coupon=require('../../models/couponModel')
const Order=require('../../models/ordersModel')
const Cart = require('../../models/cartModel')
const getCoupon=async(req,res)=>{
    try{
        const userId = req.session.user
        const cart=await Cart.findOne({userId})
        const coupons=await Coupon.find({})
        res.status(200).render('users/coupons',{coupons,cart,userId})
    }catch(err){
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const applyCoupon=async(req,res)=>{
    try{
        let {couponCode,totalPrice}=req.body
        const userId=req.session.user
        const coupon=await Coupon.findOne({couponCode})
        if(!coupon){
            return res.status(404).json({message:'coupon not found'})
        }
        const cart= await Cart.findOne({userId})
        cart.couponApplied={
            code:couponCode,
            discount:coupon.discountPercentage
        }
        await cart.save()
        totalPrice=Number(totalPrice)
        if(coupon.minPurchaseAmount<totalPrice&&totalPrice<coupon.maxPurchaseAmount){
            totalPrice=totalPrice-(totalPrice*(coupon.discountPercentage/100))
          return   res.status(200).json({message:'successfully applied coupon',totalPrice})
        }else{
            res.status(403).json({message:'You are not eligible for this offer'})
        }
    }catch(err){
        console.error(err)
        res.status(500).render('500/500error');
    }
}
module.exports={
    getCoupon,
    applyCoupon
}