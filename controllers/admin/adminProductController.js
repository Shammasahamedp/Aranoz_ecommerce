const Product = require('../../models/productsModel')
const Category = require('../../models/categoriesModel');
const { search } = require('../../routes/adminrouter/adminAuthRouter');
const getProducts = async (req, res) => {
  let page = parseInt(req.query.page) || 1;
  const limit = 5;
  const searchterm=req.query.search || ''
  try {
    const product=await Product.find({ name: { $regex: searchterm, $options: 'i' } })
    const totalCount = product.length
    const totalPages= Math.ceil(totalCount / limit)
    if(page>totalPages&&totalPages>0){
      page=totalPages
    }
    const products = await Product.find({ name: { $regex: searchterm, $options: 'i' } }).skip((page-1)*limit).limit(limit)
    
    console.log('this is totalcount',totalCount)
    res.render('admin/adminProducts', {
      products,
      searchterm:searchterm,
      page: page,
      totalPages:totalPages
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).render('500/500erroradmin')
  }
}
const getAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({listed:true})

    if (categories) {
      res.status(200).render('admin/adminProductsAdd', { categories })

    } else {
      throw new Error('category not found')

    }
  } catch (err) {
    res.status(500).render('500/500erroradmin')
  }
}
const postAddProduct = async (req, res) => {
  try {
    const { name, category, price, stock, specifications } = req.body
    const spec=JSON.parse(specifications).map((spec)=>{
      return {
        key:spec.key.toString(),
        value:spec.value.toString()
      }
    })
    const images = req.files;
    const imageUrls=images.map(image=>`/images/uploads/${image.filename}`)
    const exists=await Product.findOne({name:new RegExp(`^${name}$`, 'i')})
    if (exists) {
      res.status(409).json({ message: 'product already exists' })
      return
    } else {

      const selectedCategory = await Category.findById(category)
      if (selectedCategory) {
        const newProduct = new Product({
          name: name,
          imageUrl: imageUrls,
          category: {
            id: selectedCategory._id,
            name: selectedCategory.name
          },
          price: price,
          stock: stock,
          specifications:spec
        })
        const productData = await newProduct.save()
      } else {
        res.status(404).json({ message: 'category not found' })
      }
      res.status(200).json({ message: 'product added' })
      return
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message })
  }
}

const getEditProduct = async (req, res) => {
  try {
    const categories = await Category.find({listed:true})

    const productId = req.params.id
    const product = await Product.findById(productId)
    if (!product) {
      res.status(404).redirect('/admin/products')
    } else {
      res.status(200).render('admin/adminProductsEdit', {
        product, categories
      })
    }
  } catch (err) {
    console.error('error:', err)
    // res.status(500).send('error in get edit product')
    res.status(500).render('500/500erroradmin')
  }
}
const postEditProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    let { name, categoryId, price, stock,specifications } = req.body;
    // console.log(name)
    let images = [];
    if(!specifications){
      specifications=[]
    }
    if (req.files && req.files.length > 0) {
      images = req.files.map(file =>`/images/uploads/${file.filename}`);
    }

    const foundCategory = await Category.findById(categoryId);
    if (!foundCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const category = {
      id: categoryId,
      name: foundCategory.name
    };

    const exists = await Product.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      _id: { $ne: productId }
    });

    if (exists) {
      return res.status(409).json({ message: 'Product already exists' });
    }

    let updateObject = { name, category, price, stock ,specifications};
    if (images.length > 0) {
      updateObject.imageUrl = images;
    }

    const updatedData = await Product.findByIdAndUpdate(productId, updateObject, { new: true });

    if (updatedData) {
      return res.status(200).json({ message: 'Product has been updated', data: updatedData });
    } else {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Error in updating product:', err);
    return res.status(500).json({ message: 'Error in updating product' });
  }
};

const toggleProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const product = await Product.findById(productId)
    if (product) {
      product.isListed = !product.isListed
      await product.save()
      res.status(200).json({ message: 'product status changed', listed: product.isListed })
      return
    } else {
      res.status(404).json({ message: 'product not found' })
      return
    }
  } catch (err) {
  }
}
module.exports = {
  getProducts,
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  toggleProduct
}
