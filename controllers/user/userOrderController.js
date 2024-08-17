const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Order = require('../../models/ordersModel')
const Address = require('../../models/addressModel')
const Wallet=require('../../models/walletModel')
const Product=require('../../models/productsModel')
const pdfDocument = require('pdfkit')
const mongoose = require('mongoose')
const { findOneAndUpdate } = require('../../models/adminModel')
const { truncate } = require('lodash')
const getOrder = async (req, res) => {
  try {
    const page = parseInt(req.query.page)||1;
    const limit = parseInt(req.query.limit)||9
    const skip = (page - 1) * limit;
    const userId = req.session.user
    const order=await Order.find({userId})
    const totalCount=order.length
    totalPages=Math.ceil(totalCount/limit)
    const orders = await Order.find({ userId }).sort({createdAt:-1}).populate('items.productId').skip(skip).limit(limit)

    res.status(200).render('orders/usersOrder', { 
      orders ,
      currentPage:page,
      totalPages,
      

    })
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
      order.paymentStatus='refund'
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

const getInvoice = async (req, res) => {
  try {
      const { id } = req.params;
      const userId = req.session.user;
      const order = await Order.findById(id).populate('items.productId');
      if (!order) {
          return res.status(404).send('Order not found');
      }

      const address = await Address.aggregate([
          {
              $match: {
                  userId: new mongoose.Types.ObjectId(userId),
                  'address._id': new mongoose.Types.ObjectId(order.addressId)
              }
          },
          {
              $project: {
                  address: {
                      $filter: {
                          input: "$address",
                          as: "add",
                          cond: { $eq: ["$$add._id", new mongoose.Types.ObjectId(order.addressId)] }
                      }
                  }
              }
          }
      ]);

      if (!address || address.length === 0) {
          return res.status(404).send('Address not found');
      }

      const userAddress = address[0].address[0];

      const doc = new pdfDocument({
          size: 'A4',
          margin: 40
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${order.orderId}.pdf`);
      doc.pipe(res);

      doc.image('C:/Users/LENOVO/OneDrive/Desktop/aranoz_ecommerce/public/images/img-01.png', 50, 45, { width: 50 })
          .fontSize(20)
          .fillColor('#444444')
          .text('Aranoz', 110, 57)
          .fontSize(10)
          .text('Chennai', 200, 65, { align: 'right' })
          .text('Phone: (123) 456-7890', 200, 80, { align: 'right' })
          .moveDown();

      doc.fontSize(20).text('INVOICE', { align: 'center' })
          .moveDown();
      doc.fontSize(14).text(`Order Id: ${order.orderId}`, { align: 'left' });
      doc.text(`Order Date: ${order.orderDate.toDateString()}`, { align: 'left' });
      doc.text(`Payment Method: ${order.paymentMethod}`, { align: 'left' });
      doc.text(`Order Status: ${order.orderStatus}`, { align: 'left' });
      doc.moveDown();

      doc.fontSize(14).text('Shipping Address:', { underline: true })
          .moveDown(0.5);
      doc.fontSize(12).text(`${userAddress.phone}, ${userAddress.city},`, { align: 'left' })
          .text(`${userAddress.district}, ${userAddress.pincode}, ${userAddress.state}`, { align: 'left' })
          .moveDown();

      doc.fontSize(14).text('Product Details:', { underline: true })
          .moveDown(0.5);

      const tableTop = doc.y;
      doc.fontSize(12)
          .fillColor('#444444')
          .text('Product Name', 50, tableTop)
          .text('Quantity', 200, tableTop)
          .text('Price', 280, tableTop)
          .text('Total Price', 450, tableTop);

      doc.moveTo(50, tableTop + 15)
          .lineTo(550, tableTop + 15)
          .stroke();

      let position = tableTop + 20;

      order.items.forEach(item => {
          doc.fontSize(12)
              .fillColor('#000000')
              .text(item.productId.name, 50, position)
              .text(item.quantity, 200, position)
              .text(`$${item.price.toFixed(2)}`, 280, position)
              .text(`$${item.totalPrice.toFixed(2)}`, 450, position);

          position += 20;

          doc.moveTo(50, position)
              .lineTo(550, position)
              .stroke();

          position += 5;
      });

      doc.moveDown();
      doc.fontSize(14).fillColor('#000000').text(`Total Amount: $${order.totalAmount.toFixed(2)}`, { align: 'right', bold: true });
      
      doc.fontSize(10).fillColor('#888888')
          .text('Thank you for your purchase!', 50, 780, { align: 'center', width: 500 });

      doc.end();
  } catch (err) {
      console.error(err);
      res.status(500).render('500/500erroradmin');
  }
};

module.exports = {
  getOrder,
  getOrderDetails,
  cancelOrder,
  cancelSingleProduct,
  returnOrder,
  returnSingleProduct,
  getInvoice
}