const express=require('express')
const Razorpay=require('razorpay')
const crypto=require('crypto')
const razorpayRouter=express.Router()
const mongoose=require('mongoose')
const Cart = require('../../models/cartModel')
const Order = require('../../models/ordersModel')
const Product=require('../../models/productsModel')
const Address = require('../../models/addressModel')
const randomNumberService = require('../../utils/otpServices')
const razorpayInstance=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

razorpayRouter.post('/create-order',async(req,res)=>{
    console.log('this is create order router of razorpay')
    const {amount,currency}=req.body
    console.log(amount,currency)
    try{
        const options={
            amount:amount,
            currency:currency

        }
        const order=await razorpayInstance.orders.create(options)
        console.log(order)
        if(!order){
            return res.status(500).json({message:'internal server error'})
        }
        res.status(200).json(order)
    }catch(err){
        console.error(err)
    }
})

razorpayRouter.post('/verify-payment',async (req,res)=>{
   try{
    console.log('this is the verify payment method of razorpay')
    let {razorpay_order_id,razorpay_payment_id,razorpay_signature,orderData}=req.body
    console.log(razorpay_order_id,razorpay_payment_id,razorpay_signature)
    console.log('this is orderData',orderData)
    
    

    const key_secret=process.env.RAZORPAY_KEY_SECRET
    let hmac=crypto.createHmac('sha256',key_secret)
    hmac.update(razorpay_order_id+"|"+razorpay_payment_id)
    const generated_signature = hmac.digest('hex')
    console.log('this is generated signature',generated_signature)
    console.log('this is razorpay signature',razorpay_signature)
    if(generated_signature === razorpay_signature){
        if(!orderData.addressId){
            return res.status(400).json({message:'Address is not added'})
        }
        const address=new mongoose.Types.ObjectId(orderData.addressId)
        const userId=new mongoose.Types.ObjectId(req.session.user)
        const cart=await Cart.findOne({userId}).populate('items.productId')
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message:'your cart is empty'})
        }
        const orderId=randomNumberService.generateOrderId()
        orderStatus='pending'
        paymentStatus= 'completed'
        const order= new Order({
            userId:userId,
            orderId,
            items:cart.items.map(item=>({
                productId:item.productId._id,
                quantity:item.quantity,
                price:item.price
    
            })),
            totalAmount:orderData.totalAmount,
            addressId:address,
            paymentMethod:orderData.paymentMethod,
            paymentStatus:paymentStatus,
            orderStatus:orderStatus
       })
       await order.save()
      
        res.status(200).json({message:'verification success'})
        console.log('this is after rendering statement')
    }else{
        res.status(500).json({message:'verification failed'})
    }
   }catch(err){
    console.error(err)
   }
})


module.exports=razorpayRouter