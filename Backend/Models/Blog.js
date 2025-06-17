const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    time: {
        type: Date,
        default: Date.now
    },
    author: {
        type: String,
        required: true
    },
    images: [{
        type: String,  // URLs to images
        required: false
    }],
    content: {
        type: String,
        required: true
    },
    // Add construction-specific fields
    projectType: {
        type: String,
        enum: ['residential', 'commercial', 'infrastructure', 'renovation', 'other'],
        default: 'general blog'
    },
    location: {
        type: String,
        required: false
    },
    status: {
        type: String,
        enum: ['planning', 'in-progress', 'completed', 'on-hold'],
        default: 'planning'
    },
    // Track blog views for popular posts
    views: {
        type: Number,
        default: 0
    },
    // Allow comments/updates
    comments: [{
        author: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for better query performance
blogSchema.index({ createdAt: -1 });
blogSchema.index({ projectType: 1 });
blogSchema.index({ status: 1 });

// Virtual for formatted date
blogSchema.virtual('formattedDate').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Method to increment views
blogSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;