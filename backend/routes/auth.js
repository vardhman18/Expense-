const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// In production, use environment variables for these values
const JWT_SECRET = 'your-super-secret-key-change-in-production';
const TOKEN_EXPIRY = '24h';

// Store invalidated tokens (in production, use Redis or a database)
const invalidatedTokens = new Set();

// Middleware to validate token
const validateToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Invalid token format' });
        }

        // Check if token is invalidated (logged out)
        if (invalidatedTokens.has(token)) {
            return res.status(401).json({ message: 'Token is no longer valid' });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        req.token = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format' 
            });
        }

        // In a real application, verify against database
        // For demo purposes, accept any valid email/password
        const user = {
            id: '1',
            email,
            name: email.split('@')[0],
            role: 'user'
        };

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // Send response
        res.json({
            message: 'Login successful',
            user: {
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ 
            message: 'An error occurred during login' 
        });
    }
});

// Logout route
router.post('/logout', validateToken, (req, res) => {
    try {
        // Add the token to invalidated tokens set
        invalidatedTokens.add(req.token);

        // In production:
        // 1. Store invalidated tokens in Redis/DB
        // 2. Set up a cleanup job to remove expired tokens
        // 3. Use refresh tokens for better security

        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ 
            message: 'An error occurred during logout' 
        });
    }
});

// Validate token route (useful for frontend token verification)
router.post('/verify', validateToken, (req, res) => {
    res.json({ 
        valid: true,
        user: {
            email: req.user.email,
            role: req.user.role
        }
    });
});

// Cleanup invalidated tokens periodically (every hour)
setInterval(() => {
    invalidatedTokens.clear();
}, 3600000);

module.exports = router; 