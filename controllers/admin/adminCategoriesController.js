const mongoose = require('mongoose')
const Category = require('../../models/categoriesModel');
const Product=require('../../models/productsModel')
const { find } = require('../../models/adminModel');
const { options } = require('../../routes/adminrouter/adminAuthRouter');
const getCategories = async (req, res) => {

  let page = parseInt(req.query.page) || 1; 
  const limit = 5; 
  const searchTerm=req.query.search || ''
  try {
    const category=await Category.find({ name: { $regex: searchTerm, $options: 'i' } })
    const totalCount=category.length
    const totalPages=Math.ceil(totalCount / limit)

    if(page>totalPages&&totalPages>0){
      page=totalPages
    }
    const categories = await Category.find({ name: { $regex: searchTerm, $options: 'i' } }).skip((page-1)*limit).limit(limit)

    res.render('admin/adminCategories', {
      categories,
      page: page,
      totalPages:totalPages ,
      searchterm:searchTerm
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    // res.status(500).send('Internal Server Error');
    res.status(500).render('500/500erroradmin')
  }
  ;
}
const getCategoryEdit = async (req, res) => {
  const categoryId = req.params.id
  try {
    const category = await Category.findById(categoryId)
    res.render('admin/adminCategoryEdit', { category })
  } catch (err) {
    console.log('error fetching category')
    res.status(500).render('500/500erroradmin')
  }
}

const postCategoryEdit = async (req, res) => {
 
  const categoryId = (req.params.id)
  const { name, description } = req.body
  try {
      if(!name||!description){
        res.status(400).json({message:'should include both name and description'})
      }
      const exists = await Category.findOne({
        name: { $regex: `^${name}$`, $options: 'i' }, 
        _id: { $ne: categoryId }  
      });
      if(exists){
        res.status(409).json({message:'category already exists'})
        return 
      }
      const updatedData = await Category.findByIdAndUpdate(categoryId, { name, description }, { new: true })
      if (!updatedData || updatedData == null) {
        res.status(404).json({ message: 'Category not found' })
      } else {
        res.status(200).json({ message: 'Updated successfully'})  
      }
    
  } catch (err) {
    console.error(err)
    // res.status(500).json('Error editing category')
    res.status(500).render('500/500erroradmin')
  }
}
const getAddCategory = async (req, res) => {
  try {
    res.status(200).render('admin/adminCategoriesAdd')
  } catch (err) {
    console.error('error occured ', err)
    res.status(500).render('500/500erroradmin')
  }
}
const postAddCategory=async (req,res)=>{
  const {name,description}=req.body
  
  const document={
    name:name,
    description:description
  }
  try{
    const exists=await Category.findOne({name:new RegExp(`^${name}$`, 'i')})
    if(exists){
      res.status(409).json({message:'category name already exists'})
      return 
    }else if(!exists){
      const newCategory=new Category(document)
      await newCategory.save()
      res.status(200).json({message:'Added successfully'})
      return 
    }
    
  }catch(err){
    console.error('Error occured in adding category')
    res.status(500).json({message:'Error adding category'})
    return 
  }
}
const toggleCategory=async (req,res)=>{
  try{
    const categoryId=req.params.id
    const category=await Category.findById(categoryId)
    if(!category){
      res.status(409).json({message:'category is not found'})
    }else if(category){
      category.listed=!category.listed
      await category.save()

      res.status(200).json({message:'category status changed',listed:category.listed})
    }
    else {
      throw new Error('Error in category status change')
    }
  }catch(err){
    res.status(500).json({message:err})
  }
}
const getSearch = async (req, res) => {
  try {
    const searchTerm = req.query.term;
    const page = parseInt(req.query.page) || 1; 
    const limit = 5; 

    

   
    const totalCount = categories.length; 

    res.render('admin/adminCategories', {
      categories,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      searchterm: searchTerm
    });
  } catch (err) {
    console.error('Error in searching categories:', err);
    res.status(500).json({ message: 'Error searching categories' });
  }
};

module.exports = {
  getCategories,
  getCategoryEdit,
  postCategoryEdit,
  getAddCategory,
  postAddCategory,
  toggleCategory,
  getSearch
}
