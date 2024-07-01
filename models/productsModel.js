const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    imageUrl: {
        type: [String],
        required: true
    },
    category: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        name: {
            type: String,
            required: true
        },
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    isListed: {
        type: Boolean,
        default: true
    }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
