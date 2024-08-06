const Cart = require('../../models/cartModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/ordersModel')
const Product=require('../../models/productsModel')
const Offer= require('../../models/offerModel')
const Wallet= require('../../models/walletModel')
const mongoose = require('mongoose')
const randomNumberService = require('../../utils/otpServices')
const { v4: uuidv4 } = require('uuid')
// const getCheckout = async (req, res) => {
//     try {
//         const userId = req.session.user
//         const cartId = req.params.id
//         const addresses = await Address.findOne({ userId })
//         const cart = await Cart.findById(cartId).populate('items.productId')
//         let totalQuantity = 0
//         let totalPrice = 0
//         let cartData = {
//             cartId: cartId,
//             items: [],
//             totalQuantity: totalQuantity,
//             totalPrice: totalPrice
//         }
//         cart.items.forEach(item => {
//             let itemTotalPrice = item.quantity * item.productId.price;
//             cartData.items.push({
//                 productName: item.productId.name,
//                 quantity: item.quantity,
//                 price: item.productId.price,
//                 totalPrice: itemTotalPrice

//             })
//             cartData.totalPrice += itemTotalPrice,
//                 cartData.totalQuantity += item.quantity
//         });
//         if (addresses) {
//             res.status(200).render('users/checkout', { addresses, cartData })
//         } else {
//             res.status(200).render('users/checkout', { addresses: '', cartData })
//         }
//     } catch (err) {
//         console.error(err)
//     }
// }
const getCheckout = async (req, res) => {
    try {
        const userId = req.session.user;
        const cartId = req.params.id;
        const addresses = await Address.findOne({ userId });
        const cart = await Cart.findById(cartId).populate('items.productId');
        let totalQuantity = 0;
        let totalPrice = 0;
        let cartData = {
            cartId: cartId,
            items: [],
            totalQuantity: totalQuantity,
            totalPrice: totalPrice
        };

        for (let item of cart.items) {
            const product = item.productId;

            // Fetch offers for the product
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

            let itemTotalPrice = item.quantity * productPrice;
            cartData.items.push({
                productName: product.name,
                quantity: item.quantity,
                price: productPrice,
                totalPrice: itemTotalPrice,
                originalPrice: product.price,
                discountPercentage: discountPercentage
            });

            cartData.totalPrice += itemTotalPrice;
            cartData.totalQuantity += item.quantity;
        }

        if (addresses) {
            res.status(200).render('users/checkout', { addresses, cartData });
        } else {
            res.status(200).render('users/checkout', { addresses: '', cartData });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const cashOnDelivery = async (req, res) => {
    try {

        console.log('this is cashondelivery')
        const userId = req.session.user
        const { addressId, cartId, totalAmount, paymentMethod } = req.body
        if (!addressId) {
            return res.status(400).json({ message: 'Address is not added' })
        }
        console.log('address id:',addressId)
        console.log('userId:',userId)
        const address = new mongoose.Types.ObjectId(addressId)
        const user = new mongoose.Types.ObjectId(userId)
        const cart = await Cart.findOne({ userId }).populate('items.productId')
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' })
        }
        
        const orderId = randomNumberService.generateOrderId()
        orderStatus = 'pending'
        const order = new Order({
            userId: user,
            orderId,
            items: cart.items.map(item => ({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: Number(totalAmount),
            addressId: address,
            paymentMethod: paymentMethod,
            orderStatus: orderStatus
        });
        await order.save()

        res.status(201).json({ message: 'Order has successfully placed' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'error occured while placing the order' })
    }
}
// const walletOrder=async (req,res)=>{
//     try{
//         console.log('this wallet order')
//         console.log('this is cashondelivery')
//         const userId = req.session.user
//         const { addressId, cartId, totalAmount, paymentMethod } = req.body
//         if (!addressId) {
//             return res.status(400).json({ message: 'Address is not added' })
//         }
//         console.log('address id:',addressId)
//         console.log('userId:',userId)
//         const address = new mongoose.Types.ObjectId(addressId)
//         const user = new mongoose.Types.ObjectId(userId)
//         const cart = await Cart.findOne({ userId }).populate('items.productId')
//         if (!cart || cart.items.length === 0) {
//             return res.status(400).json({ message: 'Your cart is empty' })
//         }
//         const transaction = {
//             type:'debit',
//             amount:Number(totalAmount),
//             description:'purchased using wallet amount',
//         }
//         const wallet = await Wallet.findOne({userId})
//         if(wallet){
//             if(wallet.balance < totalAmount){
//                 return res.status(400).json({message:'Your wallet has not enough balance , check the wallet'})
//             }
//             wallet.balance-=totalAmount
//             wallet.transactions.push(transaction)
//            await wallet.save()
//         }else{
//           return  res.status(404).json({message:'No wallet available , make a wallet'})
//         }
//         const orderId = randomNumberService.generateOrderId()
//         orderStatus = 'pending'
//         const order = new Order({
//             userId: user,
//             orderId,
//             items: cart.items.map(item => ({
//                 productId: item.productId._id,
//                 quantity: item.quantity,
//                 price: item.price
//             })),
//             totalAmount: Number(totalAmount),
//             addressId: address,
//             paymentMethod: paymentMethod,
//             paymentStatus:'completed',
//             orderStatus: orderStatus
//         });
//         await order.save()

//         res.status(201).json({ message: 'Order has successfully placed' })

//     }catch(err){
//         console.error(err)
//     }
// }
const walletOrder = async (req, res) => {
    try {
        console.log('this is wallet order');
        const userId = req.session.user;
        const { addressId, cartId,totalAmount, paymentMethod } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: 'Address is not added' });
        }

        console.log('address id:', addressId);
        console.log('userId:', userId);

        const address = new mongoose.Types.ObjectId(addressId);
        const user = new mongoose.Types.ObjectId(userId);
        const cart = await Cart.findById(cartId).populate('items.productId');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet) {
            return res.status(404).json({ message: 'No wallet available, make a wallet' });
        }

        if (wallet.balance < Number(totalAmount)) {
            return res.status(400).json({ message: 'Your wallet does not have enough balance, check the wallet' });
        }

        // Deduct amount from wallet and save transaction
        wallet.balance -= Number(totalAmount);
        wallet.transactions.push({
            type: 'debit',
            amount: Number(totalAmount),
            description: 'Purchased using wallet amount',
        });
        await wallet.save();

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

        const orderId = randomNumberService.generateOrderId();
        const orderStatus = 'pending';

        const order = new Order({
            userId: user,
            orderId,
            items: itemsWithOffers,
            totalAmount: Number(totalAmountWithOffers),
            addressId: address,
            paymentMethod: paymentMethod,
            paymentStatus: 'completed',
            orderStatus: orderStatus,
            offerAmount: totalOfferAmount
        });

        await order.save();

        res.status(201).json({ message: 'Order has been successfully placed' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred while placing the order' });
    }
};


const orderSuccess = async (req, res) => {
    try {
        const userId = req.session.user
        const addresses = await Address.findOne({ userId })
        const order = await Order.findOne({ userId }).sort({orderDate:-1}).populate('items.productId')
        console.log('order addressid:', order.addressId)
        for(const item of order.items){
            const updatedProduct=await Product.findByIdAndUpdate(item.productId,{$inc:{stock:-item.quantity}})
        }
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
        // console.log('this is orderAddress',orderAddress)
        // console.log(orderAddress[0].address)
        // console.log(orderAddress[0].address[0].name)
        const cart = await Cart.findOne({ userId }).populate('items.productId')
        // let totalQuantity = 0
        // let totalPrice = 0
        // let orderData = {

        //     items: [],
        //     totalQuantity: totalQuantity,
        //     totalPrice: totalPrice
        // }
        // cart.items.forEach(item => {
        //     let itemTotalPrice = item.quantity * item.productId.price;
        //     orderData.items.push({
        //         productName: item.productId.name,
        //         quantity: item.quantity,
        //         price: item.productId.price,
        //         totalPrice: itemTotalPrice
        //     })
        //         orderData.totalQuantity += item.quantity
        // });
        
        //     orderData.paymentMethod = order.paymentMethod
        //     // console.log('this is payment method:',orderData.paymentMethod)
        //     if(orderData.paymentMethod === 'Wallet'){
        //         orderData.paymentStatus = 'completed'
        //         order.paymentStatus = 'completed'
        //     }else{
        //         orderData.paymentStatus = order.paymentStatus
        //     }
            
        // console.log(orderData.address)
        cart.items = []
        await cart.save()
        let orderData={}
         orderData.items=order.items
        orderData.address = orderAddress[0].address
        orderData.date = order.orderDate,
        res.status(200).render('orders/orderConfirmation', { addresses, orderData,order })
    } catch (err) {
        console.error(err)
    }
}
module.exports = {
    getCheckout,
    cashOnDelivery,
    orderSuccess,
    walletOrder
}