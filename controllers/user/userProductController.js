const Product = require('../../models/productsModel')
const Category = require('../../models/categoriesModel')
const Offer = require('../../models/offerModel')
const User = require('../../models/usersModel')
const getProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        const category = await Category.findById(product.category.id)
        
        const products = await Product.aggregate([{
            $lookup: {
                from: 'categories',
                localField: 'category.id',
                foreignField: '_id',
                as: 'categoryDetails'
            }
        }, {
            $unwind: "$categoryDetails"
        }
            ,
        {
            $match: {
                'category.id': category._id,
                'categoryDetails.listed': true,
                isListed: true
            }
        }])
        const offer = await Offer.findOne({
            product: product._id,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        })
        const offerCategory= await Offer.findOne({
            category:product.category.id,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() }
        })
        if(offer && offerCategory){
            let offerDiscountedPrice = product.price - (product.price * offer.discountPercentage / 100);
            let offerCategoryDiscountedPrice = product.price - (product.price * offerCategory.discountPercentage / 100);
            console.log('this is offerDiscounted price:',offerDiscountedPrice,'and this is offerCategoryDiscounted price:',offerCategoryDiscountedPrice)
            product.discountPercentage = Math.min(offerDiscountedPrice, offerCategoryDiscountedPrice);
            console.log('this is:',product.discountPercentage)
            product.offer = offerDiscountedPrice <= offerCategoryDiscountedPrice ? offer : offerCategory;
        }
       else if(offer){
            product.discountPercentage = product.price - (product.price*offer.discountPercentage/100)
                product.offer = offer
        }else if(offerCategory){
            product.discountPercentage = product.price - (product.price*offerCategory.discountPercentage/100)
                product.offer = offerCategory
        }
       
        let user
        if (req.session.user) {
            user = await User.findById(req.session.user)
        }
        if (!product.isListed || !category.listed) {
            if (req.session.user && !user.isBlocked) {
                console.log('this is product ')
                res.redirect('/user/dashboard')
            } else {
                res.redirect('/home')
            }
        }
        if (req.session.user && !user.isBlocked && product.isListed && category.listed) {
            res.status(200).render('products/product', {
                user,
                product,
                products,
                pageTitle: product.name,
                category,
                userSession: req.session.user,
                breadcrumbItems: [{ name: 'Dashboard', url: '/user/dashboard' }, { name: 'product' }, { name: product.name }]
            })
        } else if (!req.session.user) {
            res.status(200).render('products/product', {
                user:'',
                product,
                products,
                pageTitle: product.name,
                category,
                userSession: null,
                breadcrumbItems: [{ name: 'Home', url: '/home' }, { name: 'product' }, { name: product.name }]
            })
        }
        if (!product) {
            res.status(404).send('product not found')
        }
    } catch (err) {
        console.error(err)
        // res.status(500).send('product not found')
        res.status(500).render('500/500error');
    }
}

module.exports = {
    getProduct
}