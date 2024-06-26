const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel');
const { search } = require('../../routes/adminrouter/adminAuthRouter');
const getProducts= async(req,res)=>{
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1
    const limit = 5; // Number of documents per page
  
    try {
      const products = await Product.find({})
        
        .skip((page - 1) * limit)
        .limit(limit)
      
      const totalCount = await Product.countDocuments(); // Total count of documents
     
      res.render('admin/adminProducts', {
        products,
        searchterm:'',
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit)
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).send('Internal Server Error');
    }
}
const getAddProduct=async (req,res)=>{
        try{
            const categories=await Category.find({})
           
            if(categories){
              res.status(200).render('admin/adminProductsAdd',{categories})

            }else{
             throw new Error('category not found')  

            }
        }catch(err){
            res.status(500).send('Error get add product page')
        }
}
const postAddProduct=async (req,res)=>{
  try{
    const {name,category,price,stock}=req.body
    console.log(name)
    console.log(req.body)
    console.log('this is post add product')

    const image=req.file;
    console.log(image) 
    const exists=await Product.findOne({name:{$regex:name,$options:'i'}})
    if(exists){
      res.status(409).json({message:'product already exists'})
      return
    }else{
     
      const selectedCategory=await Category.findById(category)
    console.log(selectedCategory)
      if(selectedCategory){
        const newProduct=new Product({
          name:name,
          imageUrl:image.filename,
          category:{
            id:selectedCategory._id,
            name:selectedCategory.name
          },
          price:price,
          stock:stock
        })
        const productData = await newProduct.save()

      }else{
        res.status(404).json({message:'category not found'})
      }
      res.status(200).json({message:'product added'})
      return 
    }
  }catch(err){
    console.log(err);
    res.status(500).json({message:err.message})
  }
}
const getSearch=async (req,res)=>{
  try{
    const page=parseInt(req.query.page)||1;
    const limit=5

    const searchterm=req.query.term
    const products=await Product.find({name:{$regex:searchterm,$options:'i'}})
    totalCount=products.length
    res.status(200).render('admin/adminProducts',
      {products,
        searchterm,
        currentPage:page,
        totalPages:Math.ceil(totalCount/limit)
      })
  }catch(err){
    res.status(500).send('error in search products')
  }
}
const getEditProduct=async (req,res)=>{
  try{
    const categories=await Category.find({})
 
    const productId=req.params.id
    // console.log(productId)
    const product=await Product.findById(productId)
    // console.log(product)
    if(!product){
      res.status(404).send('products not found')
    }else{
      res.status(200).render('admin/adminProductsEdit',{
        product,categories
      })
    }
  }catch(err){
    console.error('error:',err)
    res.status(500).send('error in get edit product')
  }
}
const postEditProduct=async (req,res)=>{
  try{
    const productId=req.params.id
    const {name,productCategory,price,stock}=req.body
    const image=req.file
    console.log(productCategory)
    const foundCategory=await Category.findById(productCategory)
   
    if(!foundCategory){
      res.status(404).json({message:'category not found'})
      return 
    }
    const categoryName=foundCategory.name
    const category={
       id:productCategory,
       name:categoryName
     }
    //  const trimmedName=name.trim()
    const exists=await Product.findOne({
      name: { $regex: `^${name}$`, $options: 'i' }, 
      _id: { $ne: productId }  
    });
   
    console.log(exists)
    if(exists){
      res.status(409).json({message:'product already exists'})
      return 
    }
    if(req.file){
      const updatedData=await Product.findByIdAndUpdate(productId,{name,category,price,stock,imageUrl:image.filename},{new:true})
    console.log(updatedData)
    if(updatedData){
      res.status(200).json({message:'product has updated'})
    }else if(!updatedData||updatedData==null){
      res.status(404).json({message:'product not found'})
    }
    }else{
      const updatedData=await Product.findByIdAndUpdate(productId,{name,category,price,stock},{new:true})
    // console.log(updatedData)
    if(updatedData){
      res.status(200).json({message:'product has updated'})
    }else if(!updatedData||updatedData==null){
      res.status(404).json({message:'product not found'})
    }
    }
    
    
  }catch(err){
    console.log(err)
    res.status(500).json({message:'error in updating product'})
  }
}
const toggleProduct=async (req,res)=>{
  try{
    const productId=req.params.id
    const product=await Product.findById(productId)
    // console.log('enthaan...')
    if(product){
      product.isListed=!product.isListed
      await product.save()
      res.status(200).json({message:'product status changed',listed:product.isListed})
      return 
    }else{
      res.status(404).json({message:'product not found'})
      return 
    }
  }catch(err){

  }
}
module.exports={
    getProducts,
    getAddProduct,
    postAddProduct,
    getSearch,
    getEditProduct,
    postEditProduct,
    toggleProduct
}
