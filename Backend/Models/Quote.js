const mongoose = require('mongoose');
const validator = require('validator');

const QuoteItemSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'Item description is required'],
        trim: true,
        minlength: [3, 'Description must be at least 3 characters'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0.01, 'Quantity must be greater than 0']
    },
    unitPrice: {
        type: Number,
        required: [true, 'Unit price is required'],
        min: [0, 'Unit price cannot be negative']
    }
}, { _id: true });

const QuoteSchema = new mongoose.Schema({
    // Quote Identification (automatically generated)
    quoteNumber: {
        type: String,
        unique: true,
        trim: true
    },

    // Client Information
    clientName: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    clientEmail: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please enter a valid email']
    },
    clientPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isMobilePhone(v, 'any');
            },
            message: 'Please enter a valid phone number'
        }
    },

    // Project Information
    projectTitle: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    projectDescription: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    projectType: {
        type: String,
        required: [true, 'Project type is required'],
        enum: ['residential', 'commercial', 'renovation', 'repair', 'road', 'architectural', 'other'],
        default: 'other'
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },

    // Quote Items
    items: {
        type: [QuoteItemSchema],
        required: true,
        validate: {
            validator: items => items && items.length > 0,
            message: 'At least one item is required'
        }
    },

    // Pricing
    subtotal: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'KSH'
    },

    // Status
    status: {
        type: String,
        enum: ['draft', 'pending', 'sent', 'approved', 'rejected'],
        default: 'pending'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Generate quote number before saving
QuoteSchema.pre('save', async function(next) {
    if (!this.isNew) {
        return next();
    }

    try {
        // Find the highest quote number
        const lastQuote = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
        
        let nextNumber = 1;
        if (lastQuote && lastQuote.quoteNumber) {
            // Extract number from existing quote (format: "QUOTE-0001")
            const matches = lastQuote.quoteNumber.match(/\d+$/);
            if (matches && matches[0]) {
                nextNumber = parseInt(matches[0]) + 1;
            }
        }

        // Format with leading zeros (e.g., QUOTE-0025)
        this.quoteNumber = `QUOTE-${nextNumber.toString().padStart(4, '0')}`;
        next();
    } catch (err) {
        next(err);
    }
});

// Calculate totals before saving
QuoteSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.subtotal = this.items.reduce((sum, item) => 
            sum + (item.quantity * item.unitPrice), 0);
        this.totalAmount = this.subtotal;
    }
    next();
});

module.exports = mongoose.model('Quote', QuoteSchema);