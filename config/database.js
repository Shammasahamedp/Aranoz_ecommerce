const mongoose=require('mongoose')
require('dotenv').config()
const dbURI=process.env.MONGODB_URI ||'mongodb+srv://shammas:0SHOT5BuqhNAFEmW@aranoz.gyg65.mongodb.net/aranozecommerce?retryWrites=true&w=majority&appName=Aranoz'
const connectDB=async()=>{
    try{
        await mongoose.connect(dbURI,{
            useNewUrlParser:true,
            useUnifiedTopology:true,
        })
        console.log('mongodb connected successfully')
    }catch(error){
        console.error('mongodb connection error:',error)
        process.exit(1)
    }
}
module.exports=connectDB