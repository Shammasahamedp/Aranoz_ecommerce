const express=require('express')
const Razorpay=require('razorpay')
const crypto=require('crypto')
const razorpayRouter=express.Router()
const mongoose=require('mongoose')
const Cart = require('../../models/cartModel')
const Order = require('../../models/ordersModel')
const Product=require('../../models/productsModel')
const Address = require('../../models/addressModel')
const Offer = require('../../models/offerModel')
const randomNumberService = require('../../utils/otpServices')
const razorpayInstance=new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
})

razorpayRouter.post('/create-order',async(req,res)=>{
    const {amount,currency}=req.body
    try{
        const options={
            amount:amount,
            currency:currency

        }
        const order=await razorpayInstance.orders.create(options)
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
    
    
    

    const key_secret=process.env.RAZORPAY_KEY_SECRET
    let hmac=crypto.createHmac('sha256',key_secret)
    hmac.update(razorpay_order_id+"|"+razorpay_payment_id)
    const generated_signature = hmac.digest('hex')
    
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
        let totalAmountWithOffers = 0;
        let totalOfferAmount = 0;
        let itemsWithOffers = [];

        const itemsWithOffersPromises = cart.items.map(async (item) => {
            const product = item.productId;
            let discountedPrice = product.price;

            const offer = await Offer.findOne({
                product: product._id,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            const offerCategory = await Offer.findOne({
                category: product.category.id,
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            let productPrice = product.price;
            let discountPercentage = 0;

            if (offer && offerCategory) {
                let offerDiscountedPrice = product.price - (product.price * offer.discountPercentage / 100);
                let offerCategoryDiscountedPrice = product.price - (product.price * offerCategory.discountPercentage / 100);
                discountPercentage = Math.max(offer.discountPercentage, offerCategory.discountPercentage);
                productPrice = Math.min(offerDiscountedPrice, offerCategoryDiscountedPrice);
            } else if (offer) {
                discountPercentage = offer.discountPercentage;
                productPrice = product.price - (product.price * offer.discountPercentage / 100);
            } else if (offerCategory) {
                discountPercentage = offerCategory.discountPercentage;
                productPrice = product.price - (product.price * offerCategory.discountPercentage / 100);
            }

            totalOfferAmount += (product.price - productPrice) * item.quantity;
            totalAmountWithOffers += productPrice * item.quantity;

            return {
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
                discountedPrice: productPrice,
                totalPrice: productPrice * item.quantity
            };
        });

         itemsWithOffers = await Promise.all(itemsWithOffersPromises);
        const orderId=randomNumberService.generateOrderId()
        orderStatus='pending'
        paymentStatus='completed'
        const order= new Order({
            userId:userId,
            orderId,
            items:itemsWithOffers,
            totalAmount:Number(totalAmountWithOffers),
            addressId:address,
            paymentMethod:orderData.paymentMethod,
            paymentStatus:paymentStatus,
            orderStatus:orderStatus,
            offerAmount:totalOfferAmount
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