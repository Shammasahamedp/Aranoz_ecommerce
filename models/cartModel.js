const mongoose=require('mongoose')
const cartSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:Number,
            required:true
        }
    }],
    couponApplied:{
        code:{type:String,default:null},
        discount:{type:Number,default:0}
    }
   
},{timestamps:true})

const cart=mongoose.model('Cart',cartSchema)
module.exports=cart