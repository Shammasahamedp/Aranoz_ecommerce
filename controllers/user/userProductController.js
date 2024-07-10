const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel')
const User=require('../../models/usersModel')
const getProduct=async (req,res)=>{
    try{
        const productId=req.params.id
        const product= await Product.findById(productId)
        const category=await Category.findById(product.category.id)
        console.log(category)
        // const products=await Product.find({"category.id":category})
        const products=await Product.aggregate([{
                $lookup:{
                    from:'categories',
                    localField:'category.id',
                    foreignField:'_id',
                    as:'categoryDetails'
                }
        },{
            $unwind:"$categoryDetails"
        }
        ,
             {
            $match:{
                'category.id':category._id,
                'categoryDetails.listed':true,
                isListed:true
            }
        }])
        console.log(products)
        console.log(req.session.user)
        let user
        if(req.session.user){
             user=await User.findById(req.session.user)
        }
        if(!product.isListed||!category.listed){
            if(req.session.user&&!user.isBlocked){
                console.log('this is product ')
                res.redirect('/user/dashboard')
            }else{
                res.redirect('/home')
            }
        }
        if(req.session.user&&!user.isBlocked&&product.isListed&&category.listed){
            res.status(200).render('products/product',{
                product,
                products,
                pageTitle:product.name,
                category,
                userSession:req.session.user,
                breadcrumbItems:[{name:'Dashboard',url:'/user/dashboard'},{name:'product'},{name:product.name}]
            })
        }else if(!req.session.user){
            res.status(200).render('products/product',{
                product,
                products,
                pageTitle:product.name,
                category,
                userSession:null,
                breadcrumbItems:[{name:'Home',url:'/home'},{name:'product'},{name:product.name}]
            })
        }
        if(!product){
            res.status(404).send('product not found')
        }
    }catch(err){
        console.error(err)
        res.status(500).send('product not found')
    }
}

module.exports={
    getProduct
}