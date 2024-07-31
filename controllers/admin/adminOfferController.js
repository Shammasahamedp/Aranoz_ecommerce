const Offer=require('../../models/offerModel')
const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel')
const getOffer=async(req,res)=>{
    try{
        const page = parseInt(req.query.page)||1
        const limit = 5 ;
        const offers=await Offer.find({}).skip((page-1)*limit).limit(limit)
        const totalCount = await Offer.countDocuments()
        res.render('admin/adminOffers',{
            offers,
            searchterm:'',
            currentPage:page,
            totalPages:Math.ceil(totalCount/limit)
        })
    }catch(err){
        console.error(err)
    }
}
const getAddOffer=async(req,res)=>{
    try{
       
        res.status(200).render('admin/adminOfferAdd')
    }catch(err){
        console.error(err)
    }
}
const getCategory=async(req,res)=>{
    try{
        const categories=await Category.find({})
        res.status(200).json({categories})
    }catch(err){
        console.error(err)
    }
}
const getProducts=async(req,res)=>{
    try{

    }catch(err){

    }
}
module.exports={
    getOffer,
    getAddOffer,
    getCategory
}