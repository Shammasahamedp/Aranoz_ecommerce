const Cart = require('../../models/cartModel')
const Product=require('../../models/productsModel')
// const mongoose=require('mongoose')
const User = require('../../models/usersModel')
const Address=require('../../models/addressModel')
const WishList=require('../../models/wishlistModel')
const Wallet=require('../../models/walletModel')
const { default: mongoose } = require('mongoose')
const e = require('express')
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
        
    // console.log('this is home router')
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
        const breadcrumbItems=[{name:'Dashboard',url:'/user/dashboard'},{name:'User profile'}]
        res.render('users/profile',{profileDetails,breadcrumbItems})
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
        // console.log('this is post user profile method')
        // console.log(data)
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
        // cart.items[itemIndex].quantity+=1
       return res.status(409).json({message:'Product already exists in cart'})
    }else{
        cart.items.push({productId,quantity:1,price})
    }
    await cart.save()
    res.status(200).json({message:'Product added to cart'})
    }catch(err){
        console.error(err)
       return res.status(500).json({message:'An error occured when adding to cart'})
    }
}
const getAddress=async(req,res)=>{
    try{
        const userId=req.session.user
        const addresses=await Address.findOne({userId})
        if(!addresses){
            return res.status(200).render('users/address',{addresses:''})

        }else{
            return res.status(200).render('users/address',{addresses:addresses})
        }
    }catch(err){

    }
}
const getContact=async(req,res)=>{
    try{
        if(req.session.user){
            return res.status(200).render('contacs and about/contactus',{user:true})

        }
        return res.status(200).render('contacs and about/contactus',{user:''})
    }catch(err){

    }
}
const postAddAddress=async(req,res)=>{
    try{
        console.log('this is post add address')
        const userId=req.session.user
        const {name,number,email,city,district,state,pin}=req.body
        console.log(name,email,city,district,state,pin)
        const addressdata = await Address.findOne({userId})
        console.log(addressdata)
        if(addressdata){
            if(addressdata.address.length>=4){
               return  res.status(403).json({message:'User cannot add more than 4 addresses'})
            }
            console.log('this is before push')
            addressdata.address.push({name,phone:number,email,city,district,state,pincode:pin})
            await addressdata.save()
            // console.log(addressdata)
            // console.log(address)
            return res.status(200).json({message:'Address added successfully',addressdata})
        }else{
            // return res.status(404).json({message:'Address not found'})
            let addressdata=new Address({userId,address:[{name,phone:number,email,district,city,state,pincode:pin}]})
            await addressdata.save()
            console.log('address created:',addressdata)
            res.status(200).json({message:'Address added successfully',addressdata:addressdata})

        }
    }catch(err){
        console.error(err)
        res.status(200).json({message:'Server error '})
    }
}
const getEditAddress=async (req,res)=>{
    try{
        const userId=req.session.user
        const addressId=new mongoose.Types.ObjectId(req.params.id)
        // console.log(addressId)
        const addressData=await Address.aggregate([{$unwind:'$address'},{$match:{'address._id':addressId}}])
        // console.log(addressData)
        res.status(200).render('users/addressEdit',{addressData})
    }catch(err){
        console.error(err)
    }
}
const postEditAddress=async (req,res)=>{
    try{
        console.log('this is posteditaddress method')
        const userId=req.session.user;
        const addressId=req.params.id
        const {name,phone,email,district,city,state,pincode}=req.body
        
        const updatedAddress=await Address.findOneAndUpdate(
            {'address._id':new mongoose.Types.ObjectId(addressId)},
            {
                $set:{
                    'address.$.name':name,
                    'address.$.phone':phone,
                    'address.$.email':email,
                    'address.$.district':district,
                    'address.$.city':city,
                    'address.$.state':state,
                    'address.$.pincode':pincode
                }
            },
            {new:true}
        )
        if(updatedAddress){
            res.status(200).json({message:'Address edited successfully'})
        }else{
            res.status(404).json({message:'Address not found'})
        }
    }catch(err){
        console.error(err)
    }
}
const deleteAddress=async(req,res)=>{
    try{
        const userId=req.session.user
        const addressId=req.params.id
        const updatedAddress=await Address.findOneAndUpdate(
            {userId:userId},
            {$pull:{address:{_id:addressId}}},
            {new:true}
        )
        console.log(updatedAddress)
        res.status(200).json({message:'Address successfully deleted'})
    }catch(err){
        console.error(err)
    }
}
const addToWishlist=async (req,res)=>{
    try{
        const userId=req.session.user
        const {productId}=req.body
        const data=await WishList.findOne({userId,'items.productId':new mongoose.Types.ObjectId(productId)})
        if(data){
            console.log('product exists')
            return res.status(409).json({message:'Product is already in wishlist'})
        }
        const wishlist = await WishList.findOneAndUpdate(
            { userId },
            { $push: { items: { productId:new mongoose.Types.ObjectId(productId) } } },
            { new: true, upsert: true }
        );
                console.log(wishlist)
        res.status(200).json({message:'added to wishlist'})
    }catch(err){
        console.error(err)
    }
}
const deleteFromWishlist=async(req,res)=>{
    try{
        const userId=req.session.user
        const {productId}=req.body
        const updatedWishlist=await WishList.findOneAndUpdate({userId},{$pull:{items:{productId:new mongoose.Types.ObjectId(productId)}}})
        if(updatedWishlist){
            return res.status(200).json({message:'product removed from wishlist'})
        }
    }catch(err){
        console.error(err)
    }
}
const getWishlist=async(req,res)=>{
    try{
        const page=parseInt(req.query.page)||1
        let limit=parseInt(req.query.limit)||9
        const skip=(page-1)*limit

        const userId=req.session.user
        const wishlist=await WishList.findOne({userId}).populate('items.productId').skip(skip).limit(limit)
        if(wishlist){
            const products=wishlist.items
            console.log(products)
        let totalProducts=wishlist.items.length
        res.status(200).render('users/wishlist',{
            products,
            currentPage:page,
            totalPages:Math.ceil(totalProducts/limit),
            totalProducts
        })
        }else{
            totalProducts=1
            limit=1
            res.status(200).render('users/wishlist',{
                products:[],
                currentPage:page,
                totalPages:Math.ceil(totalProducts/limit),
                totalProducts
            })
        }
    }catch(err){
        console.error(err)
    }
}
const getWallet=async (req,res)=>{
    try{
        const userId=req.session.user
        let wallet=await Wallet.findOne({userId})
        if(!wallet){
            wallet=new Wallet({
                userId,
                balance:0,
                transactions:[]
            })
            await wallet.save()
        }
        res.status(200).render('users/wallet',{wallet})
    }catch(err){
        console.error(err)
    }
}
module.exports={
    getHome,
    redirectHome,
    getAuthHome,
    getUserProfile,
    postUserProfile,
    postToCart,
    getAddress,
    getContact,
    postAddAddress,
    getEditAddress,
    postEditAddress,
    deleteAddress,
    getWishlist,
    addToWishlist,
    deleteFromWishlist,
    getWallet
}