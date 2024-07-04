const {sendOTP}=require('../utils/emailService')
const sendOtpMiddleware=async (req,res)=>{
    const email=req.session.email;
    const otp=req.session.otp
    try{
        await sendOTP(email,otp);
        res.status(200).json({message:'OTP send to email'})
    }catch(err){
        console.error('Error sending OTP:',err)
        res.status(500).json({message:'Failed to send OTP'})
    }
}

module.exports={sendOtpMiddleware}