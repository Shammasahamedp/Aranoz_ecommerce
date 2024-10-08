const { findOne, findById } = require('../../models/adminModel')
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
const getEdit=async (req,res)=>{
    try{
        const couponId=req.params.id
        const coupon=await Coupon.findById(couponId)
        return res.status(200).render('admin/adminCouponEdit',{coupon})
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const postEdit=async (req,res)=>{
    try{
        const { couponCode,
            discountPercentage,
            maxPurchaseAmount,
            minPurchaseAmount,
            expiryDate ,
             couponId      } = req.body
        const newCoupon=await Coupon.findByIdAndUpdate(couponId,{couponCode,discountPercentage,maxPurchaseAmount,minPurchaseAmount,expiryDate},{new:true})
        if(newCoupon){
            return res.status(200).json({message:'Coupon has successfully updated'})
        }else{
            res.status(404).json({message:'coupon not found'})
        }
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const deleteCoupon=async (req,res)=>{
    try{
        const couponId=req.params.id 
        const removedCoupon=await Coupon.findByIdAndDelete(couponId,{new:true})
        if(removedCoupon){
            return res.status(200).json({message:'Coupon has successfully deleted'})
        }else{
            res.status(400).json({message:'coupon not found'})
        }
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')

    }
}
module.exports = {
    getCoupon,
    getAddCoupon,
    postAddCoupon,
    getEdit,
    postEdit,
    deleteCoupon
}