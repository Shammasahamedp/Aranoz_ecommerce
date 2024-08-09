const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Order = require('../../models/ordersModel')
const Address = require('../../models/addressModel')
const Wallet=require('../../models/walletModel')
const Product=require('../../models/productsModel')
const mongoose = require('mongoose')
const { findOneAndUpdate } = require('../../models/adminModel')
const { truncate } = require('lodash')
const getOrder = async (req, res) => {
  try {
    const userId = req.session.user
    const orders = await Order.find({ userId }).populate('items.productId')
    res.status(200).render('orders/usersOrder', { orders })
  } catch (err) {
    console.error(err)
    res.status(500).render('500/500error');
  }
}
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user
    const orderId=req.params.id
    const orders=await Order.findById(orderId).populate('items.productId')
    const addressId1 = orders.addressId
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

   
    res.status(200).render('orders/orderDetails', { orders ,address:Addresses[0].address})
  } catch (err) {
    console.error(err)
    res.status(500).render('500/500error');
  }
}
const cancelOrder=async(req,res)=>{
  try{
    const {orderId}=req.body
    const userId=req.session.user
    const order=await Order.findById(orderId)
    if(order&&order.paymentStatus==='completed'){
      order.items.forEach(item=>{
        if(item.itemStatus !=='request approved' &&item.itemStatus !== 'request rejected' ){
          item.itemStatus='cancelled'
        }
      })
      order.orderStatus='cancelled'
      const productIds = order.items.map(item => ({producId:item.productId,quantity:item.quantity}));

        const updatePromises = productIds.map(productId => 
            Product.findByIdAndUpdate(productId.producId, { $inc: { stock: productId.quantity } }, { new: true })
        );

        const updatedProducts = await Promise.all(updatePromises);
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
      res.status(200).json({message:'Your order cancelled '})
    }
    else if(order){
      order.items.forEach(item=>{
        item.itemStatus='cancelled'
      })
      order.orderStatus='cancelled'
      order.offerAmount=0
      await order.save()
      res.status(200).json({message:'Your order cancelled '})
    }else{
      console.log('order not found')
    }

   
  }catch(err){
    console.error(err)
    res.status(500).render('500/500error');
  }
}
const cancelSingleProduct=async(req,res)=>{
  try{
    console.log('this is cancel single product method')
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
    console.log('this is after checking the order status')
     let item= order.items.find(item=>item.productId.toString() === productId.toString())
      quantity=item.quantity
    const allCancelled = updatedOrder.items.every(item => item.itemStatus === 'cancelled');
    const newProductDetails=await Product.findByIdAndUpdate(productId,{$inc:{stock:quantity}},{new:true})
          if (allCancelled) {
              updatedOrder.orderStatus = 'cancelled';
              await updatedOrder.save();
          } 
           item=updatedOrder.items.find(item=>item.productId.toString()=== productId.toString())
          const totalAmount=item.quantity*item.discountedPrice
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
      console.log('this is order cancel')
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId, 'items.productId': productId },
        { $set: { 'items.$.itemStatus': 'cancelled' } },
        { new: true }
    );    
    console.log('this is updated order',updatedOrder)
    const allCancelled = updatedOrder.items.every(item => item.itemStatus === 'cancelled');
    console.log('this is all cancelled',allCancelled)
          if (allCancelled) {
              updatedOrder.orderStatus ='cancelled';
              updatedOrder.offerAmount=0
              await updatedOrder.save();
              console.log('this is after saving:',updatedOrder)
          }
          if(updatedOrder){
            console.log('this si updatedorder part')
              return res.status(200).json({message:"successfully cancelled the product"})
            }else{
              return res.status(404).json({message:'order not found'})
            }
    }
    console.log('this is updated order',updatedOrder)
    const allCancelled = updatedOrder.items.every(item => item.itemStatus === 'cancelled');
    console.log('this is all cancelled',allCancelled)
          if (allCancelled) {
              updatedOrder.orderStatus ='cancelled';
              updatedOrder.offerAmount=0
              await updatedOrder.save();
              console.log('this is after saving:',updatedOrder)
          }
          if(updatedOrder){
            console.log('this si updatedorder part')
              return res.status(200).json({message:"successfully cancelled the product"})
            }else{
              return res.status(404).json({message:'order not found'})
            }
    
  
  }catch(err){
    console.error(err)
    res.status(500).render('500/500error');
  }
}
const returnOrder=async(req,res)=>{
  try{
    const userId=req.session.user
    const  {orderId}=req.body
    const order=await Order.findById(orderId)
    order.items.forEach(item=>{
      item.itemStatus='return requested'
    })
    order.orderStatus='return requested'
    await order.save()
    res.status(200).json({message:'order return has requested'})
  }catch(err){
    console.error(err)
    res.status(500).render('500/500error');
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
    const allReturnRequested = updatedOrder.items.every(item => item.itemStatus === 'return requested');

        if (allReturnRequested) {
            updatedOrder.orderStatus ='return requested';
            await updatedOrder.save();
        }
        if(updatedOrder){
          return res.status(200).json({message:'order has requested to return '})
        }else{
          res.status(404).json({message:'order not found'})
        }
  }catch(err){
    console.error(err)
    res.status(500).render('500/500error');
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