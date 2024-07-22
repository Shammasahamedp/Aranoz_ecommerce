const Product = require('../../models/productsModel');
const Category = require('../../models/categoriesModel');
const { default: mongoose } = require('mongoose');


const getCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9; 
        const skip = (page - 1) * limit;
        // Number.MAX_SAFE_INTEGER
        console.log(req.query.minPrice)

        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 1000000;

        // const categorySlug = req.query.category || ''; 
        const categoryId = req.query.categoryId ? req.query.categoryId : ''
        const searchQuery=req.query.searchQuery
        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            isListed:true,
            $or: [
                { name: { $regex: new RegExp(searchQuery, 'i') } },
                { 'category.name': { $regex: new RegExp(searchQuery, 'i') } }
            ]
        };
        
        
            if (categoryId&&  mongoose.Types.ObjectId.isValid(categoryId)) {
                filter['category.id'] =new mongoose.Types.ObjectId(categoryId);
            }
        
            console.log(filter)
        const productsQuery =  Product.find(filter).skip(skip).limit(limit)
        const countQuery =  Product.countDocuments(filter);
        const categoryquery = Category.find({listed:true})
        const [products, totalProducts, categories] = await Promise.all([
            productsQuery.exec(),
            countQuery.exec(),
            categoryquery.exec()
        ]);

        if(req.session.user){
            console.log(maxPrice)
            return res.status(200).render('users/category', {
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                categories,
                minPrice,
                maxPrice,
                categorySlug:categoryId||'',
                user: req.session.user
            });
        } else {
            console.log(maxPrice)
            return res.status(200).render('users/category', {
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                categories,
                minPrice,
                maxPrice,
                categorySlug:categoryId||'',
                user: ''
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
// const searchProduct=async (req,res)=>{
//     try{
//         const query=req.body.searchQuery
//         console.log(query)
//         const products=await Product.find({$or:[{name:{$regex:new RegExp(query,'i')}},{'category.name':{$regex:new RegExp(query,'i')}}]})
//         console.log(products)
//         res.status(200).json({message:'successfully reached here',products})
//     }catch(err){
//         console.error(err)
//     }
// }

module.exports = {
    getCategory,
    // searchProduct
};
