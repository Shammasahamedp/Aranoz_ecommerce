const User=require('../../models/usersModel')
const otpService=require('../../utils/otpServices')
const {sendOTP}=require('../../utils/emailService')
const bcrypt=require('bcryptjs')
async function hashPassword(password){
    try{
        const hashedPassword=await bcrypt.hash(password,10)
        return hashedPassword
    }catch(err){
        throw new Error('Error hashing password')
    }
}
const getLogin= (req,res)=>{
    try{
        res.status(200).render('auth/login')
    }catch(err){
        res.status(500).send('Error got login')
    }
}
const postLogin=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        if(user&&!user.isBlocked){
            isMatch=await bcrypt.compare(password,user.password)
            if(user.email===email&&isMatch){
                req.session.user=user._id
                res.status(200).json({message:'login success'})
            }
        }else if(user.isBlocked){
            res.status(403).json({message:'user is blocked by admin cannot enter'})
            return 
        }else if(!user){
            res.status(400).json({message:'user is not found'})
        }else{
            throw new Error('something went wrong')
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:'error in login user'})
    }
}
const getSignup=(req,res)=>{
    try{
        res.status(200).render('auth/signup')
    }catch(err){
        res.status(500).send('Error get signup')
    }
}
const postSignup=async(req,res,next)=>{
    const {name,email,phonenumber,password}=req.body
    console.log('asdf')
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message:'User already exists'})
    }
    console.log(name)
    console.log(email)
    console.log(phonenumber)
    req.session.name=name
    req.session.email=email
    console.log(req.session.email)
    req.session.phone=phonenumber
    req.session.password=password
    const otp=otpService.generateOtp()
    req.session.otp=otp
    next()
}

const verifyOTP=async (req,res)=>{
    const {email,otp}=req.body
    console.log(email,otp)
    console.log('this is the ..........')
    console.log(req.session)
    try{
        if(req.session.email!==email){
            return res.status(400).json({message:'User not found'})
        }
        if(req.session.otp!==otp){
            return res.status(400).json({message:'Invalid OTP'})
        }
        const name=req.session.name
        const phone=req.session.phone
        const password= await hashPassword(req.session.password)
        const user=new User({name,email,phone,password})
        await user.save()
        res.status(201).json({message:'successfully signup'})
    }catch(err){
        console.error('Error in verify otp:',err)
        res.status(500).json({message:'Error in verify otp'})
    }
}
module.exports={
    getLogin,
    getSignup,
    postSignup,
    verifyOTP,
    postLogin
}