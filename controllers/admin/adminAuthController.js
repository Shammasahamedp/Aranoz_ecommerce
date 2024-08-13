const Admin=require('../../models/adminModel')
const Order=require('../../models/ordersModel')
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
const getDashboard=async (req,res)=>{
    try{
        const orders=await Order.find({})
        const order=await Order.aggregate([
            
            {$unwind:'$items'},
            {
                $lookup:{
                    from:'products',
                    localField:'items.productId',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {$group:{_id:'$items.productId',totalQuantity:{$sum:'$items.quantity'},name:{$first:'$productDetails.name'},category:{$first:'$productDetails.category.name'},image:{$first:'$productDetails.imageUrl'}}},
            {$sort:{totalQuantity:-1}},
            {$limit:5}
        ])
        const orderCategory=await Order.aggregate([
            {$unwind:'$items'},
            {
                $lookup:{
                    from:'products',
                    localField:'items.productId',
                    foreignField:'_id',
                    as:'productDetails'
                }
            },
            {$group:{_id:'$productDetails.category.name',totalQuantity:{$sum:'$items.quantity'},name:{$first:'$productDetails.category.name'}}},
            {$sort:{totalQuantity:-1}},
            
        ])
        console.log('this is orderCategory:',orderCategory)
        if(orders){
            const count=await Order.countDocuments()
            let totalAmount=0;
            let totalOfferGiven=0
            orders.forEach(order=>{
                totalAmount+=order.totalAmount
                totalOfferGiven+=order.offerAmount
            })
          return  res.render('admin/adminDashboard',{totalAmount,totalOfferGiven,count,order,orderCategory})
        }
        res.render('admin/adminDashboard')
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
module.exports={
    getLogin,
    adminLogout,
    adminLogin,
    getDashboard
}