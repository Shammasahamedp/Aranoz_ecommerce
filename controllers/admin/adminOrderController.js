const Order=require('../../models/ordersModel')
const User=require('../../models/usersModel')
const Product=require('../../models/productsModel')
const Address=require('../../models/addressModel')
const mongoose=require('mongoose')
const Wallet=require('../../models/walletModel')
const { truncate } = require('lodash')
const getOrder=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1
        const limit=5
        const orders=await Order.find().skip((page-1)*limit).limit(limit).populate('userId')
        const totalCount=await Order.countDocuments()
        // console.log(orders)
        res.status(200).render('admin/adminOrders',{
            orders,currentPage:page,
            totalPages:Math.ceil(totalCount/limit),
            searchterm:''

        })
    }catch(err){
        console.error(err)
    }
}
const getSingleOrder=async(req,res)=>{
    try{
        const orderId=req.params.id
        
        const order=await Order.findById(orderId).populate('items.productId').populate('userId')
        const userId=order.userId
        const orderAddress = await Address.aggregate([
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
       const theAddress=orderAddress[0].address[0]
        res.status(200).render('admin/adminOrdersSingle',{order,theAddress})
    }catch(err){
        console.log(err)
    }
}
const changeStatus=async(req,res)=>{
    try{
        console.log('this is change status function')
        const {itemId,statusValue,orderId}=req.body
        console.log(itemId,statusValue,orderId)
        let order;
        let userId
        if(statusValue ==='request approved'){
            console.log('this is new return ')
            order = await Order.findOneAndUpdate({_id:orderId,'items._id':itemId},{$set:{'items.$.itemStatus':statusValue}},{new:true})
            userId=order.userId
            const updatedOrder = order.items.every(item=>item.itemStatus==='request approved')
            if(updatedOrder){
                order.orderStatus='request approved'
                await order.save()
            }
            item = order.items.find(item=>item._id.toString()===itemId.toString())
            const {productId,quantity,price,itemStatus}=item
            const newProduct=await Product.findByIdAndUpdate(productId,{$inc:{stock:1}},{new:true})
            walletAmount = quantity*price
            console.log('this is userId :',userId)
            const wallet = await Wallet.findOne({userId})
            console.log('this is wallet',wallet)
            if(!wallet) {
                const wallet = new Wallet({
                    userId:userId,
                    balance:walletAmount,
                    transactions : []
                })
                let transaction = {
                    type:'credit',
                    amount:walletAmount,
                    description:'order returned',

                }
                wallet.transactions.push(transaction)
                console.log('this is new wallet:',wallet)
                await wallet.save()
            }else{
                wallet.balance+=walletAmount
                let transaction={
                    type:'credit',
                    amount:walletAmount,
                    description:'order returned',

                }
                wallet.transactions.push(transaction)
                await wallet.save()
            }
        }else {
             order=await Order.findOneAndUpdate({_id:orderId,'items._id':itemId},{$set:{'items.$.itemStatus':statusValue}},{new:true})
        }
        
        let newOrderStatus = 'delivered';
        for (const item of order.items) {
            if (item.itemStatus === 'pending') {
                newOrderStatus = 'pending';
                break;
            } else if (item.itemStatus === 'shipped') {
                newOrderStatus = 'shipped';
            } else if (item.itemStatus === 'return requested') {
                newOrderStatus = 'return requested';
            } else if (item.itemStatus === 'request approved') {
                newOrderStatus = 'request approved';
            } else if (item.itemStatus === 'request rejected') {
                newOrderStatus = 'request rejected';
            }
        }

        order.orderStatus = newOrderStatus;
        if(order.orderStatus==='delivered'){
            order.paymentStatus='completed'
            await order.save()
        }
        await order.save();
        console.log('completed',order)
        res.status(200).json({message:'success'})
    }catch(err){
        console.error(err)
    }
}
module.exports={
    getOrder,
    getSingleOrder,
    changeStatus
}