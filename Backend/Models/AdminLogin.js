const mongoose = require('mongoose');

const adminLoginSchema = new mongoose.Schema({
    username: {  // Changed from userName to username
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true  // Added to ensure emails are stored in lowercase
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6  // Added minimum length validation
    },
    isSuperAdmin: {  // Added this field since it's used in the route
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const AdminLogin = mongoose.model('AdminLogin', adminLoginSchema);

module.exports = AdminLogin;