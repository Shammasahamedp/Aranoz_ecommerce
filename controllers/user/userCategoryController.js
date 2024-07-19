const Product = require('../../models/productsModel');
const Category = require('../../models/categoriesModel');
const { default: mongoose } = require('mongoose');


const getCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; 
        const skip = (page - 1) * limit;

        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;
        // const categorySlug = req.query.category || ''; 

        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            isListed:true
        };
        const categoryId = req.query.categoryId ? req.query.categoryId : ''
        
            if (categoryId) {
                filter['category.id'] = categoryId;
            }
        

        const productsQuery =  Product.find(filter).skip(skip).limit(limit)
        const countQuery =  Product.countDocuments(filter);
        const categoryquery = Category.find({listed:true})
        const [products, totalProducts, categories] = await Promise.all([
            productsQuery.exec(),
            countQuery.exec(),
            categoryquery.exec()
        ]);

        if(req.session.user){
            return res.status(200).render('users/category', {
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                categories,
                minPrice,
                maxPrice,
                categorySlug:categoryId,
                user: req.session.user
            });
        } else {
            return res.status(200).render('users/category', {
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                categories,
                minPrice,
                maxPrice,
                categorySlug:categoryId,
                user: ''
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const showCategory=async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; 
        const skip = (page - 1) * limit;

        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || Number.MAX_SAFE_INTEGER;

        const filter = {
            price: { $gte: minPrice, $lte: maxPrice }
        };

        const productsQuery = Product.find(filter).skip(skip).limit(limit);
        const countQuery = Product.countDocuments(filter);

        const [products, totalProducts, categories] = await Promise.all([
            productsQuery.exec(),
            countQuery.exec(),
            Category.find()
        ]);

    }catch(err){
        console.error(err)
    }
}
module.exports = {
    getCategory,
    showCategory
};
