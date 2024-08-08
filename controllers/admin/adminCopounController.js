const Coupon = require('../../models/couponModel')
const getCoupon = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 5
        const coupons = await Coupon.find({}).skip((page - 1) * limit).limit(limit)
        const totalCount = await Coupon.countDocuments()

        res.status(200).render('admin/adminCoupons', {
            coupons,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            searchterm: ''
        })
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getAddCoupon = async (req, res) => {

    try {
        res.status(200).render('admin/adminCouponAdd')
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const postAddCoupon = async (req, res) => {
    try {
        const { couponCode,
            discountPercentage,
            maxPurchaseAmount,
            minPurchaseAmount,
            expiryDate } = req.body
            const coupon=await Coupon.findOne({couponCode})
            if(coupon){
              return   res.status(409).json({message:'coupon code is already exists'})
            }
            const newCoupon=new Coupon({
               couponCode: couponCode,
           discountPercentage: discountPercentage,
           maxPurchaseAmount: maxPurchaseAmount,
           minPurchaseAmount: minPurchaseAmount,
           expiryDate: expiryDate
            })
            const couponData=await newCoupon.save()
            if(couponData){
                res.status(200).json({message:'coupon added successfully'})
            }
    } catch (err) {
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
module.exports = {
    getCoupon,
    getAddCoupon,
    postAddCoupon
}