const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Fallback in-memory storage for when MongoDB is not available
let users = [];

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, userType } = req.body;

        // Validation
        if (!firstName || !lastName || !email || !password || !userType) {
            return res.status(400).json({
                error: 'All fields are required',
                required: ['firstName', 'lastName', 'email', 'password', 'userType']
            });
        }

        // Try MongoDB first, fallback to in-memory
        try {
            // Check if user already exists in MongoDB
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(409).json({
                    error: 'User already exists',
                    message: 'A user with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user in MongoDB
            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                userType
            });

            await newUser.save();

            // Remove password from response
            const userResponse = newUser.toObject();
            delete userResponse.password;

            res.status(201).json({
                message: 'User registered successfully',
                user: userResponse
            });

        } catch (dbError) {
            console.log('MongoDB not available, using in-memory storage');
            
            // Fallback to in-memory storage
            const existingUser = users.find(user => user.email === email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'User already exists',
                    message: 'A user with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user in memory
            const newUser = {
                id: users.length + 1,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                userType,
                createdAt: new Date().toISOString(),
                isVerified: false
            };

            users.push(newUser);

            // Remove password from response
            const { password: _, ...userResponse } = newUser;

            res.status(201).json({
                message: 'User registered successfully',
                user: userResponse
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message
        });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        let user = null;
        
        // Try MongoDB first, fallback to in-memory
        try {
            user = await User.findOne({ email });
        } catch (dbError) {
            console.log('MongoDB not available, using in-memory storage');
            user = users.find(user => user.email === email);
        }

        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        // Generate JWT token
        const tokenData = {
            userId: user._id || user.id,
            email: user.email,
            userType: user.userType,
            firstName: user.firstName,
            lastName: user.lastName
        };

        const token = jwt.sign(
            tokenData,
            process.env.JWT_SECRET || 'lib-marketplace-secret',
            { expiresIn: '24h' }
        );

        // Remove password from response
        const userResponse = user.toObject ? user.toObject() : { ...user };
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message
        });
    }
});

// Get current user endpoint
router.get('/me', (req, res) => {
    // This would normally use authentication middleware
    res.json({
        message: 'User profile endpoint',
        note: 'Authentication middleware not implemented yet'
    });
});

module.exports = router;