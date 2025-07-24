const express = require('express');
const Product = require('../models/Product');
const { auth, requireSeller, requireProductOwnership } = require('../middleware/auth');
const router = express.Router();

// Mock data for development when MongoDB is not available
let mockProducts = [
    {
        _id: '1',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 20-hour battery life.',
        price: 99.99,
        category: 'electronics',
        images: ['https://via.placeholder.com/300x300?text=Headphones'],
        sellerId: 1,
        sellerName: 'Tech Store',
        stock: 15,
        status: 'active',
        views: 45,
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
    },
    {
        _id: '2',
        name: 'Vintage Leather Jacket',
        description: 'Classic brown leather jacket in excellent condition. Perfect for casual wear.',
        price: 150.00,
        category: 'fashion',
        images: ['https://via.placeholder.com/300x300?text=Leather+Jacket'],
        sellerId: 2,
        sellerName: 'Fashion Hub',
        stock: 3,
        status: 'active',
        views: 23,
        createdAt: new Date('2025-01-14'),
        updatedAt: new Date('2025-01-14')
    },
    {
        _id: '3',
        name: 'Smart Garden Kit',
        description: 'Complete hydroponic garden kit for growing herbs and vegetables indoors.',
        price: 89.99,
        category: 'home',
        images: ['https://via.placeholder.com/300x300?text=Garden+Kit'],
        sellerId: 1,
        sellerName: 'Tech Store',
        stock: 8,
        status: 'active',
        views: 31,
        createdAt: new Date('2025-01-13'),
        updatedAt: new Date('2025-01-13')
    },
    {
        _id: '4',
        name: 'JavaScript Programming Guide',
        description: 'Comprehensive guide to modern JavaScript programming with practical examples.',
        price: 29.99,
        category: 'books',
        images: ['https://via.placeholder.com/300x300?text=JS+Book'],
        sellerId: 3,
        sellerName: 'BookWorm',
        stock: 12,
        status: 'active',
        views: 67,
        createdAt: new Date('2025-01-12'),
        updatedAt: new Date('2025-01-12')
    }
];

let nextProductId = 5;

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 12,
            category,
            search,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'desc',
            status = 'active'
        } = req.query;

        try {
            // Try MongoDB first
            const filter = { status };
            
            if (category) {
                filter.category = category;
            }
            
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }

            const sortObj = {};
            sortObj[sort] = order === 'desc' ? -1 : 1;

            const skip = (page - 1) * limit;
            
            const products = await Product.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(Number(limit));

            const total = await Product.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: products,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        } catch (dbError) {
            console.log('MongoDB not available, using mock data');
            
            // Fallback to mock data
            let filteredProducts = mockProducts.filter(product => {
                if (status && product.status !== status) return false;
                if (category && product.category !== category) return false;
                if (search) {
                    const searchLower = search.toLowerCase();
                    if (!product.name.toLowerCase().includes(searchLower) && 
                        !product.description.toLowerCase().includes(searchLower)) {
                        return false;
                    }
                }
                if (minPrice && product.price < Number(minPrice)) return false;
                if (maxPrice && product.price > Number(maxPrice)) return false;
                return true;
            });

            // Sort products
            filteredProducts.sort((a, b) => {
                let aVal = a[sort];
                let bVal = b[sort];
                
                if (sort === 'createdAt') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                
                if (order === 'desc') {
                    return bVal > aVal ? 1 : -1;
                } else {
                    return aVal > bVal ? 1 : -1;
                }
            });

            // Pagination
            const total = filteredProducts.length;
            const totalPages = Math.ceil(total / limit);
            const skip = (page - 1) * limit;
            const paginatedProducts = filteredProducts.slice(skip, skip + Number(limit));

            res.json({
                success: true,
                data: paginatedProducts,
                pagination: {
                    currentPage: Number(page),
                    totalPages,
                    totalProducts: total,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch products',
            message: error.message
        });
    }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        // Increment view count
        await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch product',
            message: error.message
        });
    }
});

// Get products by seller ID
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const { sellerId } = req.params;
        const { page = 1, limit = 12, status } = req.query;

        const filter = { sellerId: Number(sellerId) };
        if (status) filter.status = status;

        const skip = (page - 1) * limit;
        
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments(filter);

        res.json({
            success: true,
            data: products,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(total / limit),
                totalProducts: total
            }
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch seller products',
            message: error.message
        });
    }
});

// Create new product (sellers only)
router.post('/', auth, requireSeller, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            images,
            stock
        } = req.body;

        // Validation
        if (!name || !description || !price || !category) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'description', 'price', 'category']
            });
        }

        const product = new Product({
            name,
            description,
            price: Number(price),
            category,
            images: images || [],
            stock: Number(stock) || 0,
            sellerId: req.user.userId,
            sellerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'Unknown Seller'
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        
        res.status(500).json({
            error: 'Failed to create product',
            message: error.message
        });
    }
});

// Update product (product owner only)
router.put('/:id', auth, requireSeller, requireProductOwnership, async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            images,
            stock,
            status
        } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (price) updateData.price = Number(price);
        if (category) updateData.category = category;
        if (images) updateData.images = images;
        if (stock !== undefined) updateData.stock = Number(stock);
        if (status) updateData.status = status;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }
        
        res.status(500).json({
            error: 'Failed to update product',
            message: error.message
        });
    }
});

// Delete product (product owner only)
router.delete('/:id', auth, requireSeller, requireProductOwnership, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to delete product',
            message: error.message
        });
    }
});

module.exports = router;