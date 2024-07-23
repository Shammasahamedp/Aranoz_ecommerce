const { errorMonitor } = require('nodemailer/lib/xoauth2')
const Order = require('../../models/ordersModel')
const Address = require('../../models/addressModel')
const mongoose = require('mongoose')
const getOrder = async (req, res) => {
  try {
    const userId = req.session.user
    const orders = await Order.find({ userId }).populate('items.productId')
    // console.log('sdfgsdfg',orders)
    res.status(200).render('orders/usersOrder', { orders })
  } catch (err) {
    console.error(err)
  }
}
const getOrderDetails = async (req, res) => {
  try {
    const userId = req.session.user
    const orders1 = await Order.findOne({ userId })
    console.log('asdfasd', orders1)
    const orders = await Order.findOne({ userId }).populate('items.productId')
    console.log('asdfasdfasdf', orders)
    const addressId1 = orders.addressId
    console.log('addressId', addressId1)
    console.log('userId', userId)
    // const address=await Address.aggregate([
    //     { $match: { 
    //          userId:new mongoose.Types.ObjectId(userId),
    //         'address._id':{
    //           $in:[new mongoose.Types.ObjectId(addressId1)]
    //         }
    //      } },
    //     { 
    //       $project: {
    //         address: {
    //           $filter: {
    //             input: "$address",
    //             as: "add",
    //             cond: { $eq: ["$$add._id", [new mongoose.Types.ObjectId(addressId1)]] }
    //           }
    //         }
    //       }
    //     }
    //   ])
    const address = await Address.aggregate([
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

    console.log(address[0].address);

    console.log('this is address:', address)
    res.status(200).render('orders/orderDetails', { orders ,address})
  } catch (err) {
    console.error(err)
  }
}
module.exports = {
  getOrder,
  getOrderDetails
}