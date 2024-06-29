const express=require('express')
const adminMiddleware=require('../../middlewares/adminMiddleware')
const adminProductController=require('../../controllers/admin/adminProductController')
const adminProductRouter=express.Router()
const multer=require('multer')
const path=require('path')

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/uploads/');
    },
    filename: function (req, file, cb) {
      const name = Date.now() + '-' + file.originalname;
      cb(null, name);
    }
  });
  
  const upload = multer({
    storage: storage,
  });

adminProductRouter.get('/',adminMiddleware.isAuthenticated,adminProductController.getProducts)
adminProductRouter.get('/addproduct',adminMiddleware.isAuthenticated,adminProductController.getAddProduct)
adminProductRouter.post('/addproduct',adminMiddleware.isAuthenticated,upload.any(), adminProductController.postAddProduct)
adminProductRouter.get('/search',adminMiddleware.isAuthenticated,adminProductController.getSearch)
adminProductRouter.get('/edit/:id',adminMiddleware.isAuthenticated,adminProductController.getEditProduct)
adminProductRouter.post('/edit/:id',adminMiddleware.isAuthenticated,upload.any(),adminProductController.postEditProduct)
adminProductRouter.post('/toggle/:id',adminMiddleware.isAuthenticated,adminProductController.toggleProduct)
module.exports= adminProductRouter
