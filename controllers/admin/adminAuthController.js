const Admin=require('../../models/adminModel')
const bcrypt=require('bcryptjs')
const getLogin=function (req,res){
    res.render('admin/adminLogin')
}

const adminLogout=function (req,res){
    delete req.session.admin
    res.redirect('/admin/login')
}

const adminLogin= async function (req,res){
    const {password,email}=req.body
    try{
        const admin=await Admin.findOne({email})
        if(!admin){
            return res.status(401).json({message:'Invalid credentials'})
        }
        const isMatch=await bcrypt.compare(password,admin.password)
        if(!isMatch){
            return res.status(401).json({message:'Invalid creadentials'})
        }
        req.session.admin=admin._id
        res.redirect('/admin/dashboard')
    }catch{
        console.error(error)
        res.status(500).json({message:'Server error.Please try agian later'})
    }
}
const getDashboard=function (req,res){
    res.render('admin/adminDashboard')
}
module.exports={
    getLogin,
    adminLogout,
    adminLogin,
    getDashboard
}