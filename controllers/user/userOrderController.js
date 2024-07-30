const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Order = require('../../models/ordersModel')
const Address = require('../../models/addressModel')
const Wallet=require('../../models/walletModel')
const mongoose = require('mongoose')
const { findOneAndUpdate } = require('../../models/adminModel')
const { truncate } = require('lodash')
const getOrder = async (req, res) => {
  try {
    const userId = req.session.user
    const orders = await Order.find({ userId }).populate('items.productId')
    console.log('sdfgsdfg',orders)
    res.status(200).render('orders/usersOrder', { orders })
  } catch (err) {
    console.error(err)
  }
}
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user
    const orderId=req.params.id
    const orders1 = await Order.findOne({ userId })
    console.log('asdfasd', orders1)
    const orders=await Order.findById(orderId).populate('items.productId')
    console.log('asdfasdfasdf', orders)
    const addressId1 = orders.addressId
    console.log('addressId', addressId1)
    console.log('userId', userId)
    
    const Addresses = await Address.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          'address._id': new mongoose.Types.ObjectId(addressId1)
        }
      },
      {
        $project: {
          address: {
            $filter: {
              input: "$address",
              as: "add",
              cond: { $eq: ["$$add._id", new mongoose.Types.ObjectId(addressId1)] }
            }
          }
        }
      }
    ]);

    console.log('this is real address',Addresses[0].address);
    const some=Addresses[0].address
    console.log(some)
    console.log(Addresses[0].address[0].name)
    console.log('this is address:', Addresses)
    res.status(200).render('orders/orderDetails', { orders ,address:Addresses[0].address})
  } catch (err) {
    console.error(err)
  }
}
const cancelOrder=async(req,res)=>{
  try{
    const {orderId}=req.body
    console.log(orderId)
    const userId=req.session.user
    const order=await Order.findById(orderId)
    if(order&&order.paymentStatus==='completed'){
      order.items.forEach(item=>{
        item.itemStatus='cancelled'
      })
      order.orderStatus='cancelled'
      const wallet=await Wallet.findOne({userId})
      const transaction={
        type:'credit',
        amount:order.totalAmount,
        description:'order cancelled',
        
      }
      if(!wallet){
        const wallet=new Wallet({
          userId:userId,
          balance:order.totalAmount,
          transactions:[]
        })
        wallet.transactions.push(transaction)
        await wallet.save()
      }else{
        wallet.balance+=order.totalAmount
        wallet.transactions.push(transaction)
        await wallet.save()
      }
      order.refundAmount=order.totalAmount
      await order.save()
    }
    else if(order){
      order.items.forEach(item=>{
        item.itemStatus='cancelled'
      })
      order.orderStatus='cancelled'
      await order.save()
      res.status(200).json({message:'Your order cancelled '})
    }else{
      console.log('order not found')
    }

    // console.log(orderDeleted)
   
  }catch(err){
    console.error(err)
  }
}
const cancelSingleProduct=async(req,res)=>{
  try{
    let  {productId,orderId}=req.body
    const userId=req.session.user
    productId=new mongoose.Types.ObjectId(productId)
    orderId=new mongoose.Types.ObjectId(orderId)
    const order=await Order.findById(orderId)
    let updatedOrder;
    if(order&&order.paymentStatus==='completed'){
       updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, 'items.productId': productId },
        { $set: { 'items.$.itemStatus': 'cancelled' } },
        { new: true }
    );    
    const allCancelled = updatedOrder.items.every(item => item.itemStatus === 'cancelled');
  
          if (allCancelled) {
              updatedOrder.orderStatus = 'cancelled';
              await updatedOrder.save();
          } 
          const item=updatedOrder.items.find(item=>item.productId.toString()=== productId.toString())
          const totalAmount=item.quantity*item.price
          updatedOrder.refundAmount+=totalAmount
          await updatedOrder.save()
          const wallet=await Wallet.findOne({userId})
          const transaction={
            type:'credit',
            amount:totalAmount,
            description:'single product returned'
          }
          if(!wallet){
            const wallet=new Wallet({
              userId:userId,
              balance:totalAmount,
              transactions:[]
            })
            wallet.transactions.push(transaction)
            await wallet.save()
          }else{
            wallet.balance+=totalAmount
            wallet.transactions.push(transaction)
            await wallet.save()
          }

    }else if(order){
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, 'items.productId': productId },
        { $set: { 'items.$.itemStatus': 'cancelled' } },
        { new: true }
    );    
    const allCancelled = updatedOrder.items.every(item => item.itemStatus === 'cancelled');
  
          if (allCancelled) {
              updatedOrder.orderStatus = 'cancelled';
              await updatedOrder.save();
          }
    }
    
  if(updatedOrder){
      return res.status(200).json({message:"successfully cancelled the product"})
    }else{
      return res.status(404).json({message:'order not found'})
    }
  }catch(err){
    console.error(err)
  }
}
const returnOrder=async(req,res)=>{
  try{
    const userId=req.session.user
    const  {orderId}=req.body
    console.log(orderId)
    const order=await Order.findById(orderId)
    order.items.forEach(item=>{
      item.itemStatus='return requested'
    })
    order.orderStatus='return requested'
    await order.save()
    res.status(200).json({message:'order return has requested'})
  }catch(err){
    console.error(err)
  }
}
const returnSingleProduct=async(req,res)=>{
  try{
    const userId=req.session.user
    const {productId,orderId}=req.body
    const updatedOrder=await Order.findOneAndUpdate(
      {_id:orderId,'items.productId':productId},
      {$set:{'items.$.itemStatus': 'return requested'}},
      {new:true}
    )    
    console.log(updatedOrder)
    const allReturnRequested = updatedOrder.items.every(item => item.itemStatus === 'return requested');

        if (allReturnRequested) {
            updatedOrder.orderStatus = 'return requested';
            await updatedOrder.save();
        }
        if(updatedOrder){
          return res.status(200).json({message:'order has requested to return '})
        }else{
          res.status(404).json({message:'order not found'})
        }
  }catch(err){
    console.error(err)
  }
}
module.exports = {
  getOrder,
  getOrderDetails,
  cancelOrder,
  cancelSingleProduct,
  returnOrder,
  returnSingleProduct
}