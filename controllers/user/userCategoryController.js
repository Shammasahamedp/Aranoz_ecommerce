const Product = require('../../models/productsModel');
const Category = require('../../models/categoriesModel');
const { default: mongoose } = require('mongoose');
const getCategory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const skip = (page - 1) * limit;
        const sortBy=req.query.sort ||'name'
        console.log(sortBy)
        const minPrice = parseInt(req.query.minPrice) || 0;
        const maxPrice = parseInt(req.query.maxPrice) || 50000;
        const categoryId = req.query.categoryId
        console.log(categoryId)
        const searchQuery = req.query.searchQuery
        const filter = {
            price: { $gte: minPrice, $lte: maxPrice },
            isListed: true,
            $or: [
                { name: { $regex: new RegExp(searchQuery, 'i') } },
                { 'category.name': { $regex: new RegExp(searchQuery, 'i') } }
            ],
           

        };
        let sorT
        if(sortBy==='Price Low To High'){
            sorT={price:1}
        }else if(sortBy==='Price High To Low'){
            sorT={price:-1}
        }
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
            filter['category.id'] = new mongoose.Types.ObjectId(categoryId);
        }
        console.log(filter)
        const productsQuery = Product.find(filter).sort(sorT).skip(skip).limit(limit)
        const countQuery = Product.countDocuments(filter);
        const categoryquery = Category.find({ listed: true })
        const [products, totalProducts, categories] = await Promise.all([
            productsQuery.exec(),
            countQuery.exec(),
            categoryquery.exec()
        ]);
        if (req.session.user) {
            return res.status(200).render('users/category', {
                products,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                categories,
                minPrice,
                maxPrice,
                searchQuery,
                totalProducts,
                sortBy,
                categorySlug: categoryId || '',
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
                sortBy,
                searchQuery,
                totalProducts,
                categorySlug: categoryId || '',
                user: ''
            });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
module.exports = {
    getCategory,
};
