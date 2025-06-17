const express = require('express');
const router = express.Router();
const Quote = require('../Models/Quote');
const emailService = require('../Services/EmailService');
const { body, validationResult, param, query } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const createQuoteLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 quote requests per windowMs
    message: 'Too many quote requests, please try again later.'
});

const generalLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});

// Validation middleware
const validateQuoteCreation = [
    body('clientName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Client name must be between 2 and 100 characters'),
    body('clientEmail')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('clientPhone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    body('projectTitle')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Project title must be between 5 and 200 characters'),
    body('projectDescription')
        .trim()
        .isLength({ min: 20, max: 2000 })
        .withMessage('Project description must be between 20 and 2000 characters'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('At least one item is required'),
    body('items.*.description')
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('Item description must be between 3 and 500 characters'),
    body('items.*.quantity')
        .isFloat({ min: 0.01 })
        .withMessage('Quantity must be greater than 0'),
    body('items.*.unitPrice')
        .isFloat({ min: 0 })
        .withMessage('Unit price must be a positive number')
];

const validateQuoteUpdate = [
    param('id').isMongoId().withMessage('Invalid quote ID'),
    body('status')
        .optional()
        .isIn(['draft', 'pending', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'converted'])
        .withMessage('Invalid status value')
];

// WebSocket integration function
function broadcastQuoteUpdate(io, quoteId, eventType, data) {
    if (io) {
        io.emit('quoteUpdate', {
            quoteId,
            eventType,
            timestamp: new Date(),
            data
        });
    }
}

// Middleware to attach WebSocket instance
function attachSocketIO(io) {
    return (req, res, next) => {
        req.io = io;
        next();
    };
}

// Routes

// GET /api/quotes/allquotes - Get all quotes with pagination and filtering
router.get('/allquotes', generalLimit, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['draft', 'pending', 'sent', 'viewed', 'approved', 'rejected', 'expired', 'converted']),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'totalAmount', 'validUntil']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            page = 1,
            limit = 10,
            status,
            clientEmail,
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};
        if (status) filter.status = status;
        if (clientEmail) filter.clientEmail = clientEmail;
        if (search) {
            filter.$text = { $search: search };
        }

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [quotes, totalCount] = await Promise.all([
            Quote.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('createdBy', 'name email')
                .populate('updatedBy', 'name email'),
            Quote.countDocuments(filter)
        ]);

        res.json({
            success: true,
            data: {
                quotes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNext: skip + quotes.length < totalCount,
                    hasPrev: parseInt(page) > 1
                }
            }
        });
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quotes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/quotes/statistics - Get quote statistics
router.get('/statistics', generalLimit, async (req, res) => {
    try {
        const [stats, expiring] = await Promise.all([
            Quote.getQuoteStats(),
            Quote.findExpiring(7)
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                expiringCount: expiring.length,
                expiringQuotes: expiring.map(q => ({
                    id: q._id,
                    quoteNumber: q.quoteNumber,
                    clientName: q.clientName,
                    totalAmount: q.totalAmount,
                    validUntil: q.validUntil,
                    daysUntilExpiration: q.daysUntilExpiration
                }))
            }
        });
    } catch (error) {
        console.error('Error fetching quote stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/quotes/getquote/:id - Get single quote
router.get('/getquote/:id', generalLimit, [
    param('id').isMongoId().withMessage('Invalid quote ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID',
                errors: errors.array()
            });
        }

        const quote = await Quote.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email');

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        res.json({
            success: true,
            data: quote
        });
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch quote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/quotes/newquote - Create new quote
router.post('/newquote', createQuoteLimit, validateQuoteCreation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const quoteData = {
            ...req.body,
            createdBy: req.user?.id
        };

        const quote = new Quote(quoteData);
        await quote.save();

        broadcastQuoteUpdate(req.io, quote._id, 'created', {
            quoteNumber: quote.quoteNumber,
            clientName: quote.clientName,
            totalAmount: quote.totalAmount
        });

        try {
            await emailService.sendQuoteConfirmation(quote._id);
            await quote.addEmailLog('confirmation', quote.clientEmail, 'Quote Request Received');
        } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Quote created successfully',
            data: quote
        });
    } catch (error) {
        console.error('Error creating quote:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Quote number already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create quote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PUT /api/quotes/updatequote/:id - Update quote
router.put('/updatequote/:id', generalLimit, validateQuoteUpdate, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const updateData = {
            ...req.body,
            updatedBy: req.user?.id
        };

        const quote = await Quote.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        broadcastQuoteUpdate(req.io, quote._id, 'updated', {
            quoteNumber: quote.quoteNumber,
            status: quote.status,
            totalAmount: quote.totalAmount
        });

        if (req.body.status && ['approved', 'rejected'].includes(req.body.status)) {
            try {
                await emailService.sendStatusUpdate(quote._id);
                await quote.addEmailLog(req.body.status, quote.clientEmail, `Quote ${req.body.status}`);
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError);
            }
        }

        res.json({
            success: true,
            message: 'Quote updated successfully',
            data: quote
        });
    } catch (error) {
        console.error('Error updating quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update quote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/quotes/sendquote/:id - Send quote to client
router.post('/sendquote/:id', generalLimit, [
    param('id').isMongoId().withMessage('Invalid quote ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID',
                errors: errors.array()
            });
        }

        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (quote.status !== 'draft' && quote.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Quote cannot be sent in its current status'
            });
        }

        await emailService.sendQuoteToClient(quote._id);
        
        quote.status = 'sent';
        await quote.save();
        await quote.addEmailLog('sent', quote.clientEmail, `Quote ${quote.quoteNumber}`);

        broadcastQuoteUpdate(req.io, quote._id, 'sent', {
            quoteNumber: quote.quoteNumber,
            clientEmail: quote.clientEmail
        });

        res.json({
            success: true,
            message: 'Quote sent successfully',
            data: quote
        });
    } catch (error) {
        console.error('Error sending quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send quote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/quotes/viewquote/:id - Mark quote as viewed (public endpoint)
router.post('/viewquote/:id', [
    param('id').isMongoId().withMessage('Invalid quote ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID'
            });
        }

        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        await quote.markAsViewed(
            req.ip || req.connection.remoteAddress,
            req.get('user-agent')
        );

        broadcastQuoteUpdate(req.io, quote._id, 'viewed', {
            quoteNumber: quote.quoteNumber,
            viewedAt: quote.clientViewed.viewedAt
        });

        res.json({
            success: true,
            message: 'Quote marked as viewed',
            data: {
                id: quote._id,
                quoteNumber: quote.quoteNumber,
                status: quote.status,
                viewedAt: quote.clientViewed.viewedAt
            }
        });
    } catch (error) {
        console.error('Error marking quote as viewed:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark quote as viewed'
        });
    }
});

// DELETE /api/quotes/deletequote/:id - Delete quote
router.delete('/deletequote/:id', generalLimit, [
    param('id').isMongoId().withMessage('Invalid quote ID')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid quote ID',
                errors: errors.array()
            });
        }

        const quote = await Quote.findById(req.params.id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: 'Quote not found'
            });
        }

        if (!['draft', 'rejected'].includes(quote.status)) {
            return res.status(400).json({
                success: false,
                message: 'Only draft or rejected quotes can be deleted'
            });
        }

        await Quote.findByIdAndDelete(req.params.id);

        broadcastQuoteUpdate(req.io, quote._id, 'deleted', {
            quoteNumber: quote.quoteNumber
        });

        res.json({
            success: true,
            message: 'Quote deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting quote:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete quote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = { router, attachSocketIO };