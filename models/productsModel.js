const mongoose=require('mongoose')
const Schema=new mongoose.Schema({
    name:{
       type:String,
       required:true 
    },
    imageUrl:{
        type:String,
        required:true
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    }
})

const Product=mongoose.model('product',Schema)
module.exports=Product