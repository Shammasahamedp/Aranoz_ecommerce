const mongoose = require('mongoose')
const offerSchema=new mongoose.Schema({
    name : {type :String, required:true},
    discountPercentage : {type:Number,required:true},
    startDate : {type:Date,required:true},
    endDate : {type:Date,required:true},
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:function(){
            return this.offerType === 'category'
        }
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',
        required:function(){
            return this.offerType === 'product'
        }
    },
    offerType:{
        type:String,
        enum:['category','product'],
        required:true
    }
})

const Offer = mongoose.model('Offer',offerSchema)
module.exports=Offer