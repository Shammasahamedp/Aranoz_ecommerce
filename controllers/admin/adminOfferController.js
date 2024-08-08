const Offer=require('../../models/offerModel')
const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel')
const { off } = require('../../models/adminModel')
const getOffer=async(req,res)=>{
    try{
        const page = parseInt(req.query.page)||1
        const limit = 5 ;
        const offers=await Offer.find({}).skip((page-1)*limit).limit(limit).populate({
            path:'category',
            // match:{offerType:'category'}
        }).populate({
            path:'product',
            // match:{offerType:'product'}
        })
        const totalCount = await Offer.countDocuments()
        res.render('admin/adminOffers',{
            offers,
            searchterm:'',
            currentPage:page,
            totalPages:Math.ceil(totalCount/limit)
        })
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getAddOffer=async(req,res)=>{
    try{
       
        res.status(200).render('admin/adminOfferAdd')
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getCategory=async(req,res)=>{
    try{
        const categories=await Category.find({})
        res.status(200).json({categories})
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const getProducts=async(req,res)=>{
    try{
        const products=await Product.find({})
        res.status(200).json({products})
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const addProductOffer = async (req,res)=>{
    try{
        const {startDate,endDate,offerName,discountPercentage,offerType,itemId}= req.body
        const offer = new Offer({
            name:offerName,
            discountPercentage:discountPercentage,
            startDate:new Date(startDate),
            endDate:new Date(endDate),
            offerType:offerType,
            product:itemId
        })
        await offer.save()
        if(offer){
            res.status(200).json({message:'successfully added the offer'})
        }
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
const addCategoryOffer = async (req,res)=>{
    try{
        const {startDate,endDate,offerName,discountPercentage,offerType,itemId}= req.body
        const offer = new Offer({
            name:offerName,
            discountPercentage:discountPercentage,
            startDate:new Date(startDate),
            endDate:new Date(endDate),
            offerType:offerType,
            category:itemId
        })
        await offer.save()
        if(offer){
            res.status(200).json({message:'successfully added the offer'})
        }
        console.log(offer)
    }catch(err){
        console.error(err)
        res.status(500).render('500/500erroradmin')
    }
}
module.exports={
    getOffer,
    getAddOffer,
    getCategory,
    getProducts,
    addProductOffer,
    addCategoryOffer
}