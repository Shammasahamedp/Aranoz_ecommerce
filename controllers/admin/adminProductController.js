const Product=require('../../models/productsModel')
const Category=require('../../models/categoriesModel')
const getProducts= async(req,res)=>{
    const page = parseInt(req.query.page) || 1; // Current page number, default to 1
    const limit = 5; // Number of documents per page
  
    try {
      const products = await Product.find({})
        .skip((page - 1) * limit) // Skip documents that are before the current page
        .limit(limit); // Limit the number of documents to be retrieved
  
      const totalCount = await Product.countDocuments(); // Total count of documents
  
      res.render('admin/adminProducts', {
        products,
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
            // console.log(categories)
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
    const {name,category,price,quantity}=req.body
    console.log(name)
    console.log('this is post add product')

    // const image=req.file
    // console.log(image)
    const exists=await Product.findOne(name)
    if(exists){
      res.status(409).json({message:'product already exists'})
      return
    }else{
      console.log('this is server')
      const selectedCategory=await Category.findById(category)
      if(selectedCategory){
        const newProduct=new Product({
          name:name,
          image:image.filename,
          category:{
            _id:selectedCategory._id,
            name:selectedCategory.name
          },
          price:price,
          quantity:quantity
        })
        await newProduct.save()

      }else{
        res.status(404).json({message:'category not found'})
      }
      res.status(200).json({message:'product added'})
      return 
    }
  }catch(err){
    res.status(500).send('Error ')
  }
}
module.exports={
    getProducts,
    getAddProduct,
    postAddProduct
}
  // const {name,category,price,quantity}=req.body
    //       const selectedCategory=await Category.findById(category)
    //       const newProduct=new Product({
    //         name:name,
    //         category:{
    //           _id:selectedCategory._id,
    //           name:selectedCategory.name
    //         },
    //         price:price
    //       })
    //       await newProduct.save()