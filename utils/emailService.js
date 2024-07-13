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

const sendResetPasswordEmail=async (toEmail,resentPasswordLink)=>{
    const mailOptions={
        from:process.env.EMAIL_USER,
        to:toEmail,
        subject:'Reset your password',
        html:`
            <p>You are receiving this email because you (or someone else) have requested to reset your password.</p>
            <p>Please click the following link or copy-paste it into your browser to reset your password:</p>
            <a href="${resetPasswordLink}">${resetPasswordLink}</a>
            <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        `
    }
    return transporter.sendMail(mailOptions)
}
module.exports={
    sendOTP,
    sendResetPasswordEmail
}