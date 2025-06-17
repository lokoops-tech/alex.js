const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['residential', 'commercial', 'renovation', 'planning', 'construction', 'interior', 'landscaping', 'other']
    },
    client: {
        type: String,
        required: false
    },
    location: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        required: true,
        enum: ['ongoing', 'completed', 'planned', 'on hold'],
        default: 'ongoing'
    },
    thumbnail: {
        type: String, // This will store the path to the uploaded image
        required: true
    },
    galleryImages: [{
        type: String // Array of paths to gallery images
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', projectSchema);