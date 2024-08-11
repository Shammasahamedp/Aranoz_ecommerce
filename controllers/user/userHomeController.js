const Cart = require('../../models/cartModel')
const Product = require('../../models/productsModel')
// const mongoose=require('mongoose')
const User = require('../../models/usersModel')
const Address = require('../../models/addressModel')
const WishList = require('../../models/wishlistModel')
const Wallet = require('../../models/walletModel')
const Offer = require('../../models/offerModel')
const Razorpay = require('razorpay')
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})
const crypto = require('crypto')
const { default: mongoose } = require('mongoose')
const e = require('express')
const redirectHome = function (req, res) {
    try {
        res.status(302).redirect('/home')
    } catch (err) {
        // res.status(500).send('Error get home')
        res.status(500).render('500/500error');
    }
}
const getHome = async (req, res) => {
    try {

        const products = await Product.aggregate([{
            $lookup: {
                from: 'categories',
                localField: 'category.id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        }, {
            $unwind: '$categoryDetails'
        }, {
            $match: {
                'isListed': true,
                'categoryDetails.listed': true
            }
        }
        ])
       
        res.status(200).render('users/home', { products })
    } catch (err) {
        console.error(err)
        // res.status(500).send('error in get home')
        res.status(500).render('500/500error');
    }
}
const getAuthHome = async (req, res) => {
    try {
        const user = await User.findById(req.session.user)
        if (!user.isBlocked) {
            const products = await Product.aggregate([{
                $lookup: {
                    from: 'categories',
                    localField: 'category.id',
                    foreignField: '_id',
                    as: 'categoryDetailes'
                }
            }, {
                $unwind: '$categoryDetailes'
            }, {
                $match: {
                    'isListed': true,
                    'categoryDetailes.listed': true
                }
            }
            ])
            console.log('these are products:',products)
            for (let product of products) {
                const offer = await Offer.findOne({
                    product: product._id,
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                })
                const offerCategory = await Offer.findOne({
                    category: product.category.id,
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                })
                if (offer && offerCategory) {
                    let offerDiscountedPrice = product.price - (product.price * offer.discountPercentage / 100);
                    let offerCategoryDiscountedPrice = product.price - (product.price * offerCategory.discountPercentage / 100);
                    product.discountPercentage = Math.max(offer.discountPercentage, offerCategory.discountPercentage);
                    product.offer = offerDiscountedPrice <= offerCategoryDiscountedPrice ? offer : offerCategory;
                } else if (offer) {
                    product.discountPercentage = product.price - (product.price * offer.discountPercentage / 100)
                    product.offer = offer

                } else if (offerCategory) {
                    product.discountPercentage = product.price - (product.price * offerCategory.discountPercentage / 100)
                    product.offer = offerCategory
                }
            }

            return res.render('users/dashboard', { products })
        } else {
            delete req.session.user
            res.redirect('/user/login')
        }
    } catch (err) {
        res.status(500).render('500/500error');
    }
}
const getUserProfile = async (req, res) => {
    try {
        const profileDetails = await User.findById(req.session.user)
        const breadcrumbItems = [{ name: 'Dashboard', url: '/user/dashboard' }, { name: 'User profile' }]
        res.render('users/profile', { profileDetails, breadcrumbItems })
    } catch (err) {
        console.error(err)
        // res.status(500).send('error in get user profile')
        res.status(500).render('500/500error');
    }
}
const postUserProfile = async (req, res) => {
    try {
        const { name, phonenumber } = req.body
        const user = await User.findById(req.session.user)
        let data = { name, phone: phonenumber }

        const updatedData = await User.findByIdAndUpdate(req.session.user, data, { new: true })
        if (updatedData) {
            res.status(200).json({ message: 'profile has updated successfully' })
        } else if (!updatedData) {
            res.status(200).json({ message: 'updated data not found' })
        } else {
            throw new Error('something went wrong in profile edit part')
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}
const postToCart = async (req, res) => {
    try {

        const userId = req.session.user
        const productId = req.params.id
        const product = await Product.findById(productId)
        const price = product.price
        let cart = await Cart.findOne({ userId })
        if (!cart) {
            cart = new Cart({ userId, items: [] })
        }
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId))
        if (itemIndex > -1) {
            return res.status(409).json({ message: 'Product already exists in cart' })
        } else {
            cart.items.push({ productId, quantity: 1, price })
        }
        await cart.save()
        res.status(200).json({ message: 'Product added to cart' })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'An error occured when adding to cart' })
    }
}
const getAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const addresses = await Address.findOne({ userId })
        if (!addresses) {
            return res.status(200).render('users/address', { addresses: '' })

        } else {
            return res.status(200).render('users/address', { addresses: addresses })
        }
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const getContact = async (req, res) => {
    try {
        if (req.session.user) {
            return res.status(200).render('contacs and about/contactus', { user: true })

        }
        return res.status(200).render('contacs and about/contactus', { user: '' })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const postAddAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const { name, number, email, city, district, state, pin } = req.body
        const addressdata = await Address.findOne({ userId })
        if (addressdata) {
            if (addressdata.address.length >= 4) {
                return res.status(403).json({ message: 'User cannot add more than 4 addresses' })
            }
            addressdata.address.push({ name, phone: number, email, city, district, state, pincode: pin })
            await addressdata.save()

            return res.status(200).json({ message: 'Address added successfully', addressdata })
        } else {
            let addressdata = new Address({ userId, address: [{ name, phone: number, email, district, city, state, pincode: pin }] })
            await addressdata.save()
            res.status(200).json({ message: 'Address added successfully', addressdata: addressdata })

        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Server error ' })
    }
}
const getEditAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const addressId = new mongoose.Types.ObjectId(req.params.id)
        const addressData = await Address.aggregate([{ $unwind: '$address' }, { $match: { 'address._id': addressId } }])
        res.status(200).render('users/addressEdit', { addressData })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const postEditAddress = async (req, res) => {
    try {
        const userId = req.session.user;
        const addressId = req.params.id
        const { name, phone, email, district, city, state, pincode } = req.body

        const updatedAddress = await Address.findOneAndUpdate(
            { 'address._id': new mongoose.Types.ObjectId(addressId) },
            {
                $set: {
                    'address.$.name': name,
                    'address.$.phone': phone,
                    'address.$.email': email,
                    'address.$.district': district,
                    'address.$.city': city,
                    'address.$.state': state,
                    'address.$.pincode': pincode
                }
            },
            { new: true }
        )
        if (updatedAddress) {
            res.status(200).json({ message: 'Address edited successfully' })
        } else {
            res.status(404).json({ message: 'Address not found' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const deleteAddress = async (req, res) => {
    try {
        const userId = req.session.user
        const addressId = req.params.id
        const updatedAddress = await Address.findOneAndUpdate(
            { userId: userId },
            { $pull: { address: { _id: addressId } } },
            { new: true }
        )
        res.status(200).json({ message: 'Address successfully deleted' })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user
        const { productId } = req.body
        const data = await WishList.findOne({ userId, 'items.productId': new mongoose.Types.ObjectId(productId) })
        if (data) {
            console.log('product exists')
            return res.status(409).json({ message: 'Product is already in wishlist' })
        }
        const wishlist = await WishList.findOneAndUpdate(
            { userId },
            { $push: { items: { productId: new mongoose.Types.ObjectId(productId) } } },
            { new: true, upsert: true }
        );
        res.status(200).json({ message: 'added to wishlist' })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const deleteFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user
        const { productId } = req.body
        const updatedWishlist = await WishList.findOneAndUpdate({ userId }, { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } })
        if (updatedWishlist) {
            return res.status(200).json({ message: 'product removed from wishlist' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const getWishlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 9
        const skip = (page - 1) * limit

        const userId = req.session.user
        const wishlist = await WishList.findOne({ userId }).populate('items.productId').skip(skip).limit(limit)
        if (wishlist) {
            const items = wishlist.items
            // console.log('this is products',products)
            
            for (let item of items) {
                console.log('this is one product:',item)
                const offer = await Offer.findOne({
                    product: item.productId._id,
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                })
                const offerCategory = await Offer.findOne({
                    category: item.productId.category.id,
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                })
                if (offer && offerCategory) {
                    let offerDiscountedPrice = item.price - (item.productId.price * offer.discountPercentage / 100);
                    let offerCategoryDiscountedPrice = item.productId.price - (item.productId.price * offerCategory.discountPercentage / 100);
                    item.productId.discountPercentage = Math.max(offer.discountPercentage, offerCategory.discountPercentage);
                    item.productId.offer = offerDiscountedPrice <= offerCategoryDiscountedPrice ? offer : offerCategory;
                } else if (offer) {
                    item.productId.discountPercentage = item.productId.price - (item.productId.price * offer.discountPercentage / 100)
                    item.productId.offer = offer

                } else if (offerCategory) {
                    item.productId.discountPercentage = item.productId.price - (item.productId.price * offerCategory.discountPercentage / 100)
                    item.productId.offer = offerCategory
                }
            }
            let totalProducts = wishlist.items.length
            res.status(200).render('users/wishlist', {
                items,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            })
        } else {
            totalProducts = 1
            limit = 1
            res.status(200).render('users/wishlist', {
                items:[],
                products: [],
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts
            })
        }
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const getWallet = async (req, res) => {
    try {
        let page = parseInt(req.query.page) || 1
        let limit = parseInt(req.query.limit) || 5
        let skip = (page - 1) * limit
        const userId = req.session.user
        let wallet = await Wallet.findOne({ userId })
        if (!wallet) {
            wallet = new Wallet({
                userId,
                balance: 0,
                transactions: []
            })
            await wallet.save()
        }
        res.status(200).render('users/wallet', { wallet })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const razorpayCreation = async (req, res) => {
    try {
        const { amount, currency } = req.body
        const options = {
            amount: amount,
            currency: currency
        }
        const order = await razorpayInstance.orders.create(options)
        if (!order) {
            return res.status(500).json({ message: 'Internal server error' })
        }
        res.status(200).json(order)
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
const razorpayVarify = async (req, res) => {
    try {
        const userId = req.session.user
        let { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body
        const key_secret = process.env.RAZORPAY_KEY_SECRET
        let hmac = crypto.createHmac('sha256', key_secret)
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
        const generated_signature = hmac.digest('hex')

        if (generated_signature === razorpay_signature) {
            const wallet = await Wallet.findOne({ userId })
            if (!wallet) {
                return res.status(404).json({ message: 'wallet not found' })
            }
            wallet.balance += amount
            const transaction = {
                type: 'credit',
                amount: amount,
                description: 'Amount added to wallet'
            }
            wallet.transactions.push(transaction)
            await wallet.save()
            res.status(200).json({ message: 'balance added successfully' })

        } else {
            res.status(500).json({ message: 'verification faild' })
        }

    } catch (err) {
        console.error(err)
        res.status(500).render('500/500error');
    }
}
module.exports = {
    getHome,
    redirectHome,
    getAuthHome,
    getUserProfile,
    postUserProfile,
    postToCart,
    getAddress,
    getContact,
    postAddAddress,
    getEditAddress,
    postEditAddress,
    deleteAddress,
    getWishlist,
    addToWishlist,
    deleteFromWishlist,
    getWallet,
    razorpayCreation,
    razorpayVarify
}