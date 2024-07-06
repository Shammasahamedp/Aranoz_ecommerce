const mongoose=require('mongoose')
const bcrypt=require('bcryptjs')
const Schema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const Admin=mongoose.model('adminLogin',Schema)

module.exports=Admin