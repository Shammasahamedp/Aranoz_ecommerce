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
    const orders = await Order.findOne({ userId }).sort({orderDate:-1})
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
module.exports = {
  getOrder,
  getOrderDetails
}