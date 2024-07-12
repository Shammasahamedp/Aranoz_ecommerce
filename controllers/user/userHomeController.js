const Cart = require('../../models/cartModel')
const Product=require('../../models/productsModel')
const User = require('../../models/usersModel')
const redirectHome=function (req,res){
    try{
        res.status(302).redirect('/home')
    }catch(err){
        res.status(500).send('Error get home')
    }
}
const getHome= async(req,res)=>{
    try{
       
        const products=await Product.aggregate([{
            $lookup:{
                from:'categories',
                localField:'category.id',
                foreignField:'_id',
                as:'categoryDetails'
            }
        },{
            $unwind:'$categoryDetails'
        },{
            $match:{
                'isListed':true,
                'categoryDetails.listed':true
            }
        }
    ])
        
    console.log('this is home router')
        res.status(200).render('users/home',{products})
    }catch(err){
        console.error(err)
        res.status(500).send('error in get home')
    }
}
const getAuthHome=async(req,res)=>{
    try{
       const user=await User.findById(req.session.user)
        if(!user.isBlocked){
            const products=await Product.aggregate([{
                $lookup:{
                    from:'categories',
                    localField:'category.id',
                    foreignField:'_id',
                    as:'categoryDetailes'
                }
            },{
                $unwind:'$categoryDetailes'
            },{
                $match:{
                    'isListed':true,
                    'categoryDetailes.listed':true
                }
            }
        ])
           return  res.render('users/dashboard',{products})
        }else{
            delete req.session.user
            res.redirect('/user/login')
        }
    }catch(err){
        res.status(500).redirect('/user/error')
    }
}
const getUserProfile=async (req,res)=>{
    try{
        const profileDetails=await User.findById(req.session.user)
        console.log(profileDetails)
        res.render('users/profile',{profileDetails})
    }catch(err){
        console.error(err)
        res.status(500).send('error in get user profile')
    }
}
const postUserProfile=async(req,res)=>{
    try{
        const {name,phonenumber}=req.body
        const user=await User.findById(req.session.user)
        console.log(user)
        let data={name,phone:phonenumber}
        console.log('this is post user profile method')
        console.log(data)
        const updatedData=await User.findByIdAndUpdate(req.session.user,data,{new:true})
        // console.log(updatedData)
        if(updatedData){
            res.status(200).json({message:'profile has updated successfully'})
        }else if(!updatedData){
            res.status(200).json({message:'updated data not found'})
        }else{
            throw new Error('something went wrong in profile edit part')
        }
    }catch(err){
            res.status(500).json({message:err.message})
    }
}
const postToCart=async (req,res)=>{
    try{
    //     console.log('hello this is post to cart method')
    //    res.status(200).json({message:'this is from post to cart method'})
    const userId=req.session.user
    const productId=req.params.id
    const product=await Product.findById(productId)
    const price=product.price
    let cart=await Cart.findOne({userId})
    if(!cart){
        cart=new Cart({userId,items:[]})
    }
    const itemIndex=cart.items.findIndex(item=>item.productId.equals(productId))
    if(itemIndex>-1){
        cart.items[itemIndex].quantity+=1
    }else{
        cart.items.push({productId,quantity:1,price})
    }
    await cart.save()
    res.status(200).json({message:'Product added to cart'})
    }catch(err){
        console.error(err)
        res.status(500).json({message:'An error occured when adding to cart'})
    }
}
module.exports={
    getHome,
    redirectHome,
    getAuthHome,
    getUserProfile,
    postUserProfile,
    postToCart
}