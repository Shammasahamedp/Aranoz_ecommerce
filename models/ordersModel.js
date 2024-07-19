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
            enum:['pending','shipped','delivered','cancelled'],
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
    orderStatus:{
        type:String,
        enum:['pending','shipped','delivered','cancelled'],
        default:'pending'
    },
    orderDate:{
        type:Date,
        default:Date.now
    }
})

const Order=mongoose.model('Order',orderSchema)

module.exports=Order