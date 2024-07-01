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
Schema.statics.createAdmin=async function (email,password){
    const hashedPassword=await bcrypt.hash(password,10)
    try{
       const newAdmin=new this({
        email,
        password:hashedPassword
       }) 
       await newAdmin.save()
    //    console.log('new admin created successfully')
    }catch(error){
        console.error('error creating admin:',error)
    }
}
const Admin=mongoose.model('adminLogin',Schema)

module.exports=Admin