const mongoose=require('mongoose')
const wishListSchema=mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:true
        }
    }]
},{timestamps:true})
const WishList=mongoose.model('Wishlist',wishListSchema)
module.exports=WishList