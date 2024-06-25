const express=require('express')
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminCategoriesController=require('../../controllers/admin/adminCategoriesController')
const adminCategoriesRouter=express.Router()

adminCategoriesRouter.get('/',adminMiddleware.isAuthenticated,adminCategoriesController.getCategories)
adminCategoriesRouter.get('/edit/:id',adminMiddleware.isAuthenticated,adminCategoriesController.getCategoryEdit)
adminCategoriesRouter.post('/edit/:id',adminMiddleware.isAuthenticated,adminCategoriesController.postCategoryEdit)
adminCategoriesRouter.get('/add',adminMiddleware.isAuthenticated,adminCategoriesController.getAddCategory)
adminCategoriesRouter.post('/add',adminMiddleware.isAuthenticated,adminCategoriesController.postAddCategory)
adminCategoriesRouter.post('/toggle/:id',adminMiddleware.isAuthenticated,adminCategoriesController.toggleCategory)
adminCategoriesRouter.get('/search',adminMiddleware.isAuthenticated,adminCategoriesController.getSearch)
module.exports=adminCategoriesRouter