const jwt = require('jsonwebtoken');

// Authentication middleware
const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Access denied',
                message: 'No token provided'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'lib-marketplace-secret');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            error: 'Invalid token',
            message: 'Token is not valid'
        });
    }
};

// Seller authorization middleware
const requireSeller = (req, res, next) => {
    if (req.user.userType !== 'seller') {
        return res.status(403).json({
            error: 'Access denied',
            message: 'Only sellers can perform this action'
        });
    }
    next();
};

// Product ownership middleware
const requireProductOwnership = async (req, res, next) => {
    try {
        const Product = require('../models/Product');
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({
                error: 'Product not found'
            });
        }

        if (product.sellerId !== req.user.userId) {
            return res.status(403).json({
                error: 'Access denied',
                message: 'You can only modify your own products'
            });
        }

        req.product = product;
        next();
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            message: error.message
        });
    }
};

module.exports = {
    auth,
    requireSeller,
    requireProductOwnership
};