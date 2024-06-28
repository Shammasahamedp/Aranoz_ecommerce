const nodeMailer=require('nodemailer')
require('dotenv').config()
const transporter=nodeMailer.createTransport({
    service:'gmail',
    auth:{
        
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendOTP=(toEmail,otp)=>{
    const mailOptions={
        from:process.env.EMAIL_USER,
        to : toEmail,
        subject:'Your OTP code',
        text:`Your OTP code is ${otp}`
    }
    return transporter.sendMail(mailOptions)
}

module.exports={sendOTP}