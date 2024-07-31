const mongoose=require('mongoose')
const Schema=mongoose.Schema
const categorySchema=new Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true,
        unique:true
    },
    listed:{
        type:Boolean,
        default:true
    },
    offers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Offer'
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
})

categorySchema.pre('save', function(next) {
    this.updated_at = Date.now();
    next();
  });

const Category=mongoose.model('category',categorySchema)
module.exports=Category