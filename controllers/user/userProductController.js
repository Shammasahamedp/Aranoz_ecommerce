const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel')
const getProduct=async (req,res)=>{
    try{
        const productId=req.params.id
        const product= await Product.findById(productId)
        const category=await Category.findById(product.category.id)
        console.log(req.session.user)
        

        res.status(200).render('products/product',{
            product,
            pageTitle:product.name,
            category,
            breadcrumbItems:[{name:'Dashboard',url:'/user/dashboard'},{name:'product'},{name:product.name}]
        })
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