const mongoose=require('mongoose')
const orderSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    orderId:{
        type:String,
        required:true,
        unique:true
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
        },
        itemStatus:{
            type:String,
            enum:['pending','shipped','delivered','cancelled','return requested','request approved','request rejected'],
            default:'pending'
        }
    }],
    totalAmount:{
        type:Number,
        required:true
    },
    addressId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    paymentMethod:{
        type:String,
        enum:['Cash On Delivery','Wallet','RazorPay'],
        required:true
    },
    paymentStatus:{
        type:String,
        default:'pending',
        enum:['pending','completed','failed']
    },
    orderStatus:{
        type:String,
        enum:['pending','shipped','delivered','cancelled','return requested','request approved','request rejected'],
        default:'pending'
    },
    orderDate:{
        type:Date,
        default:Date.now
    },
    refundAmount:{
        type:Number,
        default:0
    }
},{timestamps:true})

const Order=mongoose.model('Order',orderSchema)

module.exports=Order