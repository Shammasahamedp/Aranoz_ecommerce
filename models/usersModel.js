const mongoose=require('mongoose')
const Schema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        requried:false
    },
    googleId:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    },
    isBlocked:{
        type:Boolean,
        default:false
    }

},{timestamps:true})

const User=new mongoose.model('user',Schema)
module.exports=User