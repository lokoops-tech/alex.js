const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../Models/AdminLogin');

const router = express.Router();

// Track number of admin signups
let adminSignupCount = 0;
const MAX_ADMIN_SIGNUPS = 2;

// Initialize admin count on server start
const initializeAdminCount = async () => {
    try {
        adminSignupCount = await Admin.countDocuments();
    } catch (error) {
        console.error('Error initializing admin count:', error);
    }
};

// Call this when your server starts
initializeAdminCount();

// Admin Signup Route
router.post('/signup', async (req, res) => {
    try {
        // Check if maximum initial admins are already created
        const currentAdminCount = await Admin.countDocuments();
        if (currentAdminCount >= MAX_ADMIN_SIGNUPS) {
            return res.status(403).json({ 
                message: 'Initial admin signup limit reached. New admins can only be added by existing admins.' 
            });
        }

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: 'Please provide username, email, and password' 
            });
        }

        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if admin already exists (by email or username)
        const existingAdmin = await Admin.findOne({ 
            $or: [{ email: email.toLowerCase() }, { username }] 
        });
        
        if (existingAdmin) {
            return res.status(400).json({ 
                message: 'Admin with this email or username already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = new Admin({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            isSuperAdmin: currentAdminCount === 0 // First admin is super admin
        });

        await newAdmin.save();

        res.status(201).json({ 
            message: 'Admin created successfully',
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                isSuperAdmin: newAdmin.isSuperAdmin
            }
        });
    } catch (error) {
        console.error('Admin signup error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Admin Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Please provide email and password' 
            });
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if JWT_SECRET is set
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not set in environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // Create and assign token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username,
                isSuperAdmin: admin.isSuperAdmin 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Extended to 24 hours
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username, // Fixed: was admin.userName
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
});

// Get admin profile (optional - for testing)
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.id).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json(admin);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;