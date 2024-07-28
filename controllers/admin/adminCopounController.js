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
    }
}
const getAddCoupon = async (req, res) => {

    try {
        res.status(200).render('admin/adminCouponAdd')
    } catch (err) {
        console.error(err)
    }
}
const postAddCoupon = async (req, res) => {
    try {
        const { couponCode,
            discountPercentage,
            maxDiscountAmount,
            minDiscountAmount,
            expiryDate } = req.body
            console.log(couponCode,discountPercentage,maxDiscountAmount,minDiscountAmount,expiryDate)
            const coupon=await Coupon.findOne({couponCode})
            if(coupon){
              return   res.status(409).json({message:'coupon code is already exists'})
            }
            const newCoupon=new Coupon({
               couponCode: couponCode,
           discountPercentage: discountPercentage,
           maxDiscountAmount: maxDiscountAmount,
           minDiscountAmount: minDiscountAmount,
           expiryDate: expiryDate
            })
            const couponData=await newCoupon.save()
            if(couponData){
                res.status(200).json({message:'coupon added successfully'})
            }
    } catch (err) {
        console.error(err)
    }
}
module.exports = {
    getCoupon,
    getAddCoupon,
    postAddCoupon
}