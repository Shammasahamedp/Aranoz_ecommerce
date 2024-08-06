const User = require('../../models/usersModel')
const Cart = require('../../models/cartModel')
const Product = require('../../models/productsModel')
const Offer = require('../../models/offerModel')

const getCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        let totalQuantity = 0;
        let totalPrice = 0;

        if (!cart || cart.items.length == 0) {
            let cartData = {
                items: [],
                totalQuantity: totalQuantity,
                totalPrice: totalPrice,
                breadcrumbItems: [{ name: 'Dashboard', url: '/user/dashboard' }, { name: 'cart' }]
            };
            res.status(200).render('cart/cart', { cartData, cart: '' });
        } else {
            let cartData = {
                items: [],
                totalQuantity: totalQuantity,
                totalPrice: totalPrice,
                breadcrumbItems: [{ name: 'Dashboard', url: '/user/dashboard' }, { name: 'cart' }]
            };

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
                    productId: product._id,
                    productImage: product.imageUrl[0],
                    productName: product.name,
                    quantity: item.quantity,
                    price: productPrice,
                    totalPrice: itemTotalPrice,
                    totalStock: product.stock,
                    discountPercentage: discountPercentage,  
                    originalPrice: product.price             
                });

                cartData.totalPrice += itemTotalPrice;
                cartData.totalQuantity += item.quantity;
            }
            console.log('this is cartdata.totalPrice',cartData.totalPrice)
            res.status(200).render('cart/cart', { cartData, cart });
        }
    } catch (err) {
        console.error(err);
        res.status(500).redirect('/user/error');
    }
};


const updateCart = async (req, res) => {
    try {
        const userId = req.session.user;
        const { productId, newQuantity } = req.body;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        if (newQuantity <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = newQuantity;

            const product = await Product.findById(productId);

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

            cart.items[itemIndex].price = productPrice; // Update the price with the discounted price
        }

        await cart.save();

        let totalQuantity = 0;
        let totalPrice = 0;
        cart.items.forEach(item => {
            totalQuantity += item.quantity;
            totalPrice += item.quantity * item.price;
        });

        res.json({ cart, totalQuantity, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteCart = async (req, res) => {
    try {
        const productId = req.params.id
        const userId = req.session.user
        const cart = await Cart.findOne({ userId })
        if (!cart) {
            return res.status(404).json({ message: 'cart is not found' })
        }
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId)
        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1)
            await cart.save()
            const newSubTotal = cart.items.reduce((acc, curr) => {
                acc += curr.quantity * curr.price
                return acc
            }, 0)
            return res.status(200).json({ message: 'cart is deleted', newSubTotal })
        } else {
            return res.status(404).json({ message: 'item not found in the cart' })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'an error occured while deleting the item from the cart' })
    }
}
module.exports = {
    getCart,
    updateCart,
    deleteCart
}