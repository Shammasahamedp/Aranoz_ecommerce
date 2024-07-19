const Cart=require('../../models/cartModel')
const Address=require('../../models/addressModel')
const Order = require('../../models/ordersModel')
const mongoose=require('mongoose')
const randomNumberService=require('../../utils/otpServices')
const {v4:uuidv4}=require('uuid')
const getCheckout=async (req,res)=>{
    try{
        const userId=req.session.user
        const cartId=req.params.id
        const addresses=await Address.findOne({userId})
        const cart=await Cart.findById(cartId).populate('items.productId')
        let totalQuantity=0
        let totalPrice=0
        let cartData={
            cartId:cartId,
            items:[],
            totalQuantity:totalQuantity,
            totalPrice:totalPrice
        }
        cart.items.forEach(item => {
            let itemTotalPrice=item.quantity*item.productId.price;
            cartData.items.push({
                productName:item.productId.name,
                quantity:item.quantity,
                price:item.productId.price,
                totalPrice:itemTotalPrice
                
            })
            cartData.totalPrice+=itemTotalPrice,
            cartData.totalQuantity+=item.quantity
        });
        if(addresses){
            res.status(200).render('users/checkout',{addresses,cartData})
        }else{
            res.status(200).render('users/checkout',{addresses:'',cartData})
        }
    }catch(err){
        console.error(err)
    }
}
const cashOnDelivery=async(req,res)=>{
    try{
        
        console.log('this is cashondelivery')
        const userId=req.session.user
        const {addressId,cartId,totalAmount,paymentMethod}=req.body
        if(!addressId){
           return  res.status(400).json({message:'Address is not added'})
        }
       const  address=new mongoose.Types.ObjectId(addressId)
       const user=new mongoose.Types.ObjectId(userId)
       const cart=await Cart.findOne({userId}).populate('items.productId')
        if(!cart||cart.items.length===0){
            return res.status(400).json({message:'Your cart is empty'})
        }
       const orderId=randomNumberService.generateOrderId()
        orderStatus='pending'
        const order = new Order({
            userId: user,
            orderId,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: totalAmount,
            addressId: address,
            paymentMethod: paymentMethod,
            orderStatus: orderStatus
        });
        await order.save()
        
        res.status(201).json({message:'Order has successfully placed'})
    }catch(err){
        console.error(err)
        res.status(500).json({message:'error occured while placing the order'})
    }
}
const orderSuccess=async(req,res)=>{
    try{
        const userId=req.session.user
        
        const addresses=await Address.findOne({userId})
        const order=await Order.findOne({userId})
        console.log('order addressid:',order.addressId)
        const orderAddress =await Address.aggregate([
            {
              $match: {
                userId: new mongoose.Types.ObjectId(userId),
                'address._id': {
                  $in: [new mongoose.Types.ObjectId(order.addressId)]
                }
              }
            },
            {
              $project: {
                address: {
                  $filter: {
                    input: '$address',
                    as: 'addr',
                    cond: { $in: ['$$addr._id', [new mongoose.Types.ObjectId(order.addressId)]] }
                  }
                }
              }
            }
          ])
          
        console.log(orderAddress)
        console.log(orderAddress[0].address[0].name)
        const cart=await Cart.findOne({userId}).populate('items.productId')
        let totalQuantity=0
        let totalPrice=0
        let orderData={
            
            items:[],
            totalQuantity:totalQuantity,
            totalPrice:totalPrice
        }
        cart.items.forEach(item => {
            let itemTotalPrice=item.quantity*item.productId.price;
            orderData.items.push({
                productName:item.productId.name,
                quantity:item.quantity,
                price:item.productId.price,
                totalPrice:itemTotalPrice
                
            })
            orderData.totalPrice+=itemTotalPrice,
            orderData.totalQuantity+=item.quantity
            
        });
        orderData.date=order.orderDate,
            orderData.paymentMethod=order.paymentMethod,
            orderData.address=orderAddress[0].address
        console.log(orderData.address)
        cart.items=[]
        await cart.save()
        console.log(cart)
           
            res.status(200).render('orders/orderConfirmation',{addresses,orderData})
           
        
    }catch(err){
        console.error(err)
    }
}
module.exports={
    getCheckout,
    cashOnDelivery,
    orderSuccess
}