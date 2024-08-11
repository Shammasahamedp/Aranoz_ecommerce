const Cart = require('../../models/cartModel')
const Address = require('../../models/addressModel')
const Order = require('../../models/ordersModel')
const Product = require('../../models/productsModel')
const Offer = require('../../models/offerModel')
const Wallet = require('../../models/walletModel')
const mongoose = require('mongoose')
const randomNumberService = require('../../utils/otpServices')
const { v4: uuidv4 } = require('uuid')

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
        if(cart.items.length==0){
            return res.redirect('/user/cart')
        }
        for (let item of cart.items) {
            const product = item.productId;
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
        const userId = req.session.user
        const { addressId, cartId, totalAmount, paymentMethod } = req.body
        if (!addressId) {
            return res.status(400).json({ message: 'Address is not added' })
        }
       
        const address = new mongoose.Types.ObjectId(addressId)
        const user = new mongoose.Types.ObjectId(userId)
        const cart = await Cart.findOne({ userId }).populate('items.productId')
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' })
        }
        let totalAmountWithOffers = 0;
        let totalOfferAmount = 0;
        let itemsWithOffers = [];
        if(cart.couponApplied){
                couponPercentage= cart.couponApplied.discount
                amountDifference=(totalAmount*couponPercentage)/100
        }

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
             if(cart.couponApplied){
                couponOffer = (productPrice/totalAmount)*amountDifference
             }else{
                couponOffer=0
             }
            // console.log('this is couponOffer',couponOffer,'this is productPrice',productPrice,'this is totalAmount:',totalAmount,'this is amount difference:',amountDifference,'this is productPrice+couponOffer',productPrice-couponOffer)
            return {
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
                discountedPrice: productPrice-couponOffer,
                totalPrice: productPrice * item.quantity
            };
        });

        itemsWithOffers = await Promise.all(itemsWithOffersPromises);
        const orderId = randomNumberService.generateOrderId()
        orderStatus = 'pending'
        paymentStatus = 'pending'
        if(cart.couponApplied){

            const order= new Order({
                userId:userId,
                orderId,
                items:itemsWithOffers,
                totalAmount:Number(totalAmount),
                addressId:address,
                paymentMethod:paymentMethod,
                paymentStatus:paymentStatus,
                orderStatus:orderStatus,
                offerAmount:totalOfferAmount,
                coupon:cart.couponApplied.discount
           })  
           await order.save()   
        }else{
            const order= new Order({
                userId:userId,
                orderId,
                items:itemsWithOffers,
                totalAmount:Number(totalAmount),
                addressId:address,
                paymentMethod:paymentMethod,
                paymentStatus:paymentStatus,
                orderStatus:orderStatus,
                offerAmount:totalOfferAmount
           })
           await order.save()
        }
        res.status(201).json({ message: 'Order has successfully placed' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'error occured while placing the order' })
    }
}

const walletOrder = async (req, res) => {
    try {
        console.log('this is wallet order');
        const userId = req.session.user;
        const { addressId, cartId, totalAmount, paymentMethod } = req.body;

        if (!addressId) {
            return res.status(400).json({ message: 'Address is not added' });
        }
       
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
        if(cart.couponApplied){
            couponPercentage= cart.couponApplied.discount
            amountDifference=(totalAmount*couponPercentage)/100
    }
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
            if(cart.couponApplied){
                couponOffer = (productPrice/totalAmount)*amountDifference
             }else{
                couponOffer=0
             }
            return {
                productId: product._id,
                quantity: item.quantity,
                price: product.price,
                discountedPrice: productPrice-couponOffer,
                totalPrice: productPrice * item.quantity
            };
        });

        itemsWithOffers = await Promise.all(itemsWithOffersPromises);

        const orderId = randomNumberService.generateOrderId();
        const orderStatus = 'pending';
        if(cart.couponApplied){

            const order= new Order({
                userId:userId,
                orderId,
                items:itemsWithOffers,
                totalAmount:Number(totalAmount),
                addressId:address,
                paymentMethod:paymentMethod,
                paymentStatus:'completed',
                orderStatus:orderStatus,
                offerAmount:totalOfferAmount,
                coupon:cart.couponApplied.discount
           })  
           await order.save()   
        }else{
            const order= new Order({
                userId:userId,
                orderId,
                items:itemsWithOffers,
                totalAmount:Number(totalAmount),
                addressId:address,
                paymentMethod:paymentMethod,
                paymentStatus:'completed',
                orderStatus:orderStatus,
                offerAmount:totalOfferAmount
           })
           await order.save()
        }

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
        console.log('this is userId:',userId)

        const order = await Order.findOne({ userId }).sort({ orderDate: -1 }).populate('items.productId')
        console.log('this is order:',order)
        for (const item of order.items) {
            const updatedProduct = await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
        }
        console.log('this is order.addressId:',order.addressId)
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
        console.log('this is orderAddress:',orderAddress)
        const cart = await Cart.findOne({ userId }).populate('items.productId')
        console.log('this is orderAddress[0]',orderAddress[0])
        cart.items = []
        await cart.save()
        let orderData = {}
        orderData.items = order.items
        orderData.address = orderAddress[0].address
        orderData.date = order.orderDate,
            res.status(200).render('orders/orderConfirmation', { addresses, orderData, order })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
module.exports = {
    getCheckout,
    cashOnDelivery,
    orderSuccess,
    walletOrder
}