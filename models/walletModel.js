const { uniq } = require('lodash')
const mongoose=require('mongoose')
const walletSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        uniqe:true
    },
    balance:{
        type:Number,
        required:true,
        default:0
    },
    transactions:[{
        type:{
            type:String,
            enum:['credit','debit'],
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        date:{
            type:Date,
            default:Date.now
        }
    }]
},{timestamps:true})

const Wallet = mongoose.model('Wallet',walletSchema)
module.exports=Wallet