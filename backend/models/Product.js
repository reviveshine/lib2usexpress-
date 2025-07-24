const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: ['electronics', 'fashion', 'home', 'books']
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\//.test(v);
            },
            message: 'Image URL must be a valid URL'
        }
    }],
    sellerId: {
        type: Number,
        required: [true, 'Seller ID is required']
    },
    sellerName: {
        type: String,
        required: [true, 'Seller name is required']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sellerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);