const mongoose=require('mongoose')
const couponSchema=new mongoose.Schema({
    couponCode:{
        type:String,
        required:true,
        uniqe:true
    },
    discountPercentage:{
        type:Number,
        required:true
    },
    maxDiscountAmount:{
        type:Number,
        required:true
    },
    minDiscountAmount:{
        type:Number,
        required:true
    },
    expiryDate:{
        type:Date,
        required:true
    }

})

couponSchema.index({expiryDate:1},{expireAfterSeconds:0})
const couponModel=mongoose.model('Coupon',couponSchema)

module.exports=couponModel