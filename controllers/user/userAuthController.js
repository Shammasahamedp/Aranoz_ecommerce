const User=require('../../models/usersModel')
const otpService=require('../../utils/otpServices')
const crypto=require('crypto')
const {sendOTP,sendResetPasswordEmail}=require('../../utils/emailService')
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
        res.status(200).render('auth/login',{errorMessage:req.query.errorMessage})
    }catch(err){
        res.status(500).send('Error got login')
    }
}
const postLogin=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        // console.log(user)
        if(!user){
            res.status(400).json({message:'user is not found'})}
        else if(user&&!user.isBlocked){
            isMatch=await bcrypt.compare(password,user.password)
            if(user.email===email&&isMatch){
                req.session.user=user._id
                res.status(200).json({message:'successfull'})

            }else{
                console.log('password error')
                res.status(400).json({message:'incorrect email or password'})
            }
        }else if(user.isBlocked){
            // console.log(user.isBlocked)

            res.status(403).json({message:'user is blocked by admin cannot enter'})
            return 
        } 
        else {
            throw new Error('something went wrong')
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message:'error in login user'})
    }
}
const getSignup=(req,res)=>{
    try{
        console.log('hello')
        res.status(200).render('auth/signup')
    }catch(err){
        res.status(500).send('Error get signup')
    }
}
const postSignup=async(req,res,next)=>{
    try{
        const {name,email,phonenumber,password}=req.body
    const existingUser=await User.findOne({email})
    if(existingUser){
        return res.status(400).json({message:'User already exists'})

    }
    req.session.name=name
    req.session.email=email
    req.session.phone=phonenumber
    req.session.password=password
    const otp=otpService.generateOtp()
    console.log('this is otp:',otp)
    req.session.otp=otp
    next()
    }catch(err){
        console.error(err)
        res.status(500).json({message:'error in singup'})
    }
}

const verifyOTP=async (req,res)=>{
    const {email,otp}=req.body
   
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
const resendOtp=async (req,res,next)=>{
    try{
      
         req.session.otp=otpService.generateOtp()
       next()
    }catch(err){
        res.status(200).json({message:'error in resend otp'})
    }
}
const postLogout=async (req,res)=>{
    try{
      req.session.destroy((err)=>{
        if(err){
            console.error('error in logut',err)
        }
        res.clearCookie('connect.sid')
        res.status(200).json({message:'successfully logout'})
      })
      
    }catch(err){
        console.error('Error is logout:',err)
        res.status(500).json({message:'error in logout'})
    }
}
    const googleSignFail=async (req,res)=>{
        try{
              
            
        res.redirect('/user/login?errorMessage=User%20is%20blocked%20by%20admin')
                
        }catch(err){
            console.error('error in login',err)
            res.redirect('/user/login')
        }
    }
    const googleAuthenticated = async (req,res)=>{
        req.session.user=req.user._id  ;
        try{
           const user=  await User.findById(req.user._id)
        if(user&&user.isBlocked===false){
           res.redirect('/user/dashboard')
        }else if(user&&user.isBlocked===true){
        req.logout(function (err){
            if(err){
                console.error('error in login',err)
                return res.status(500).redirect('/user/login')
            }else{
                res.redirect('/user/login?errorMessage=User%20is%20blocked%20by%20admin')
            }

        })
        }else{
           res.status(404).redirect('/user/login')
        }
        }catch(err){
            console.error(err)
            
        }
       
       }
       const getForgotpassword=async (req,res)=>{
        try{
            res.status(200).render('auth/forgotpassword')
        }catch(err){

        }
       }
       const postForgotPassword=async(req,res)=>{
        try{
            const {email}=req.body
            const user=await User.findOne({email})
            if(!user){
                return res.status(404).json({message:'user not found'})
            }
            const token=await generateToken()
            console.log('this is token',token)
            req.session.email=email
            req.session.token=token
            resetPasswordLink = `http://localhost:3000/user/resetpassword?token=${encodeURIComponent(token)}`;
            await sendResetPasswordEmail(email,resetPasswordLink)
          return  res.status(200).json({message:'link has send to your email address'})

        }catch(err){
            console.error(err)
        }
       }
       const generateToken=()=>{
        return new Promise((res,rej)=>{
            crypto.randomBytes(20,(err,buffer)=>{
                if(err){
                    rej(err)
                }else{
                    res(buffer.toString('hex'))
                }
            })
        })
       }
       const getResetPassword=async (req,res)=>{
        try{
            return  res.status(200).render('auth/resetpassword')
           
            
        }catch(err){
            console.error(err)

        }
       }
       const postResetPassword=async(req,res)=>{
        try{
          
            if(req.session.token==req.query.token){
                const password=req.body.confirmpassword
                const email=req.session.email
                const hashedPassword=await bcrypt.hash(password,10)

                const user=await User.findOneAndUpdate(
                    {email:email},
                    {password:hashedPassword},
                    {
                        new:true
                    }
                )
                if(user){
                    return res.status(200).json({message:'password has changed successfully'})
                }else{
                    return res.status(500).json({message:'user not found'})
                }
            }else{
                return  res.status(404).json({message:'invalid token , cannot enter'})
            }
        }catch(err){

        }
       }
module.exports={
    getLogin,
    getSignup,
    postSignup,
    verifyOTP,
    postLogin,
    postLogout,
    resendOtp,
    googleSignFail,
    googleAuthenticated,
    getForgotpassword,
    postForgotPassword,
    getResetPassword,
    postResetPassword
}