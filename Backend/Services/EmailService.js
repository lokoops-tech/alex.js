const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const Quote = require('../Models/Quote');
const transporter = require('../Config/Email');

class EmailService {
   constructor() {
        this.transporter = transporter;
        this.templates = new Map();
        this.initializeTemplates();
    }
    
    initializeTemplates() {
        const templates = {
            'quote-confirmation': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote Request Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .quote-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-badge { background-color: #17a2b8; color: white; padding: 5px 12px; border-radius: 15px; font-size: 12px; display: inline-block; margin: 10px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
        .highlight { color: #007bff; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Quote Request Received</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            
            <p>Thank you for submitting your quote request! We have successfully received your project details and our team is now reviewing your requirements.</p>
            
            <div class="status-badge">Under Review</div>
            
            <div class="quote-details">
                <h3>📋 Quote Details:</h3>
                <p><strong>Quote Number:</strong> <span class="highlight">{{quoteNumber}}</span></p>
                <p><strong>Project Title:</strong> {{projectTitle}}</p>
                <p><strong>Description:</strong> {{projectDescription}}</p>
                <p><strong>Estimated Total:</strong> <span class="highlight">${{totalAmount}}</span></p>
                <p><strong>Submitted:</strong> {{createdAt}}</p>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>🔍 What happens next?</h4>
                <ol>
                    <li>Our team will carefully review your project requirements</li>
                    <li>We'll prepare a detailed quote with itemized costs</li>
                    <li>You'll receive the complete quote via email within 1-2 business days</li>
                    <li>You can then review and decide on the next steps</li>
                </ol>
            </div>
            
            <p>If you need to provide additional information or have any questions about your quote request, please don't hesitate to contact us and reference your quote number: <strong>{{quoteNumber}}</strong></p>
            
            <p>We appreciate your interest in our services and look forward to working with you!</p>
            
            <p>Best regards,<br><strong>The Quote Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated confirmation. Please save this email for your records.</p>
            <p>Quote Reference: {{quoteNumber}} | Status: Under Review</p>
        </div>
    </div>
</body>
</html>`,
            'quote-sent': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Quote is Ready</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .quote-summary { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f2f2f2; font-weight: bold; }
        .total-row { background-color: #e8f5e8; font-weight: bold; }
        .cta-button { display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
        .highlight { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Your Quote is Ready!</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            <p>Great news! We've completed the review of your project and are excited to present your custom quote for <strong>{{projectTitle}}</strong>.</p>
            
            <div class="quote-summary">
                <h3>📊 Quote Summary:</h3>
                <p><strong>Quote Number:</strong> <span class="highlight">{{quoteNumber}}</span></p>
                <p><strong>Valid Until:</strong> {{validUntil}}</p>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{#each items}}
                        <tr>
                            <td>{{description}}</td>
                            <td>{{quantity}}</td>
                            <td>${{unitPrice}}</td>
                            <td>${{subtotal}}</td>
                        </tr>
                        {{/each}}
                        <tr class="total-row">
                            <td colspan="3"><strong>Total Amount</strong></td>
                            <td><strong>${{totalAmount}}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <p>This quote is valid until <strong>{{validUntil}}</strong>. To proceed with this project, please reply to this email or contact us directly.</p>
            
            <div style="text-align: center;">
                <a href="{{quoteViewUrl}}" class="cta-button">📄 View Full Quote</a>
            </div>
            
            <p>Thank you for considering our services. We look forward to the opportunity to work with you!</p>
            
            <p>Best regards,<br><strong>The Quote Team</strong></p>
        </div>
        <div class="footer">
            <p>Quote Number: {{quoteNumber}} | Valid Until: {{validUntil}}</p>
        </div>
    </div>
</body>
</html>`,
            'quote-approved': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote Approved - Next Steps</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .next-steps { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
        .highlight { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Quote Approved!</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            <p>Excellent news! Your quote for <strong>{{projectTitle}}</strong> has been approved and we're ready to move forward.</p>
            
            <div class="next-steps">
                <h3>📋 Next Steps:</h3>
                <ol>
                    <li>We'll send you a detailed contract within 24 hours</li>
                    <li>A 50% deposit will be required to commence the project</li>
                    <li>Our project manager will contact you to schedule a kickoff meeting</li>
                    <li>Estimated project timeline: {{projectDuration.estimated}} {{projectDuration.unit}}</li>
                </ol>
                
                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <p><strong>Project Total:</strong> <span class="highlight">${{totalAmount}}</span></p>
                    <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
                </div>
            </div>
            
            <p>Thank you for choosing us for your project. We're excited to get started and deliver exceptional results!</p>
            
            <p>Best regards,<br><strong>The Project Team</strong></p>
        </div>
        <div class="footer">
            <p>Quote Number: {{quoteNumber}} | Status: ✅ Approved</p>
        </div>
    </div>
</body>
</html>`,
            'quote-rejected': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote Status Update</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .feedback-section { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Quote Status Update</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            <p>Thank you for considering our services for <strong>{{projectTitle}}</strong>.</p>
            
            <p>We understand that our current quote may not meet your requirements at this time. We genuinely appreciate the opportunity to have provided you with a proposal.</p>
            
            <div class="feedback-section">
                <h3>💬 We Value Your Feedback</h3>
                <p>If you'd like to share any feedback about our quote or discuss ways we could better meet your needs in the future, please don't hesitate to reach out.</p>
                
                <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
            </div>
            
            <p>Should your requirements change or if you have other projects in the future, we'd be happy to work with you again.</p>
            
            <p>Best regards,<br><strong>The Quote Team</strong></p>
        </div>
        <div class="footer">
            <p>Quote Number: {{quoteNumber}} | Status: Not Accepted</p>
        </div>
    </div>
</body>
</html>`,
            'quote-reminder': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote Reminder - Expiring Soon</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ffc107; color: #333; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .reminder-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ffc107; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .cta-button { display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
        .urgent { color: #dc3545; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Quote Reminder</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            <p>This is a friendly reminder that your quote for <strong>{{projectTitle}}</strong> will expire soon.</p>
            
            <div class="reminder-box">
                <h3>📋 Quote Details:</h3>
                <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
                <p><strong>Total Amount:</strong> ${{totalAmount}}</p>
                <p><strong>Expires On:</strong> {{validUntil}}</p>
                <p><strong>Days Remaining:</strong> <span class="urgent">{{daysUntilExpiration}}</span></p>
            </div>
            
            <p>To secure this quote and move forward with your project, please contact us before the expiration date.</p>
            
            <div style="text-align: center;">
                <a href="{{quoteViewUrl}}" class="cta-button">📄 View Quote</a>
            </div>
            
            <p>If you have any questions or need to discuss the quote, please don't hesitate to reach out.</p>
            
            <p>Best regards,<br><strong>The Quote Team</strong></p>
        </div>
        <div class="footer">
            <p>Quote Number: {{quoteNumber}} | Expires: {{validUntil}}</p>
        </div>
    </div>
</body>
</html>`,
            'quote-expired': `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Quote Expired - New Quote Available</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #6c757d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background-color: #f9f9f9; }
        .expired-notice { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #dc3545; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; background-color: #f8f9fa; border-radius: 0 0 8px 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Quote Expired</h1>
        </div>
        <div class="content">
            <p>Dear <strong>{{clientName}}</strong>,</p>
            <p>Your quote for <strong>{{projectTitle}}</strong> has expired as of {{validUntil}}.</p>
            
            <div class="expired-notice">
                <h3>📋 Expired Quote Details:</h3>
                <p><strong>Quote Number:</strong> {{quoteNumber}}</p>
                <p><strong>Project:</strong> {{projectTitle}}</p>
                <p><strong>Amount:</strong> ${{totalAmount}}</p>
            </div>
            
            <p>If you're still interested in this project, we'd be happy to provide you with a new, updated quote. Please note that market conditions and our availability may have changed, so the new quote may differ from the expired one.</p>
            
            <p>Please contact us if you'd like to proceed with a new quote for this project.</p>
            
            <p>Best regards,<br><strong>The Quote Team</strong></p>
        </div>
        <div class="footer">
            <p>Quote Number: {{quoteNumber}} | Status: ❌ Expired</p>
        </div>
    </div>
</body>
</html>`
        };
        
        // Compile all templates and store them in the Map
        for (const [name, template] of Object.entries(templates)) {
            this.templates.set(name, handlebars.compile(template));
        }
    }
async sendEmail(to, subject, templateName, templateData, attachments = []) {
    try {
        if (!this.transporter) {
            throw new Error('Email transporter not initialized');
        }
        const template = this.templates.get(templateName);
        if (!template) {
            throw new Error(`Template ${templateName} not found`);
        }
        
        // Set default values for common template fields
        const defaults = {
            clientName: '',
            quoteNumber: '',
            projectTitle: '',
            projectDescription: '',
            totalAmount: '0.00',
            createdAt: new Date().toLocaleDateString(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            daysUntilExpiration: 30,
            quoteViewUrl: process.env.FRONTEND_URL || '#',
            projectDuration: {
                estimated: 14,
                unit: 'days'
            }
        };

        // Merge defaults with provided data
        const processedData = { ...defaults, ...templateData };

        // Ensure totalAmount is properly formatted
        if (typeof processedData.totalAmount === 'number') {
            processedData.totalAmount = processedData.totalAmount.toFixed(2);
        } else if (typeof processedData.totalAmount !== 'string') {
            processedData.totalAmount = '0.00';
        }

        // Process items array if present
        if (processedData.items && Array.isArray(processedData.items)) {
            processedData.items = processedData.items.map(item => ({
                description: item.description || '',
                quantity: item.quantity || 0,
                unitPrice: typeof item.unitPrice === 'number' ? item.unitPrice.toFixed(2) : '0.00',
                subtotal: (item.quantity || 0) * (typeof item.unitPrice === 'number' ? item.unitPrice : 0)
            }));
        }

        const html = template(processedData);
        const mailOptions = {
            from: {
                name: process.env.EMAIL_FROM_NAME || 'Quote System',
                address: process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || process.env.GMAIL_USER
            },
            to,
            subject,
            html,
            attachments
        };
        
        const result = await this.transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

    async sendQuoteConfirmation(quoteId) {
        try {
            const quote = await Quote.findById(quoteId);
            if (!quote) {
                throw new Error(`Quote with ID ${quoteId} not found`);
            }
            const templateData = {
                clientName: quote.clientName,
                quoteNumber: quote.quoteNumber,
                projectTitle: quote.projectTitle,
                projectDescription: quote.projectDescription,
                totalAmount: quote.totalAmount ? quote.totalAmount.toFixed(2) : '0.00',
                createdAt: quote.createdAt.toLocaleDateString()
            };
            const result = await this.sendEmail(
                quote.clientEmail,
                `Quote Request Received - ${quote.quoteNumber}`,
                'quote-confirmation',
                templateData
            );
            console.log(`Quote confirmation sent to ${quote.clientEmail} for quote ${quote.quoteNumber}`);
            return result;
        } catch (error) {
            console.error(`Failed to send quote confirmation for quote ID ${quoteId}:`, error);
            throw error;
        }
    }

    async sendQuoteToClient(quoteId) {
        try {
            const quote = await Quote.findById(quoteId);
            if (!quote) {
                throw new Error(`Quote with ID ${quoteId} not found`);
            }
            // Calculate subtotals and total amount
            const itemsWithSubtotals = quote.items.map(item => ({
                ...item.toObject(),
                unitPrice: item.unitPrice.toFixed(2),
                subtotal: (item.quantity * item.unitPrice).toFixed(2)
            }));
            const totalAmount = itemsWithSubtotals.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);
            const templateData = {
                clientName: quote.clientName,
                quoteNumber: quote.quoteNumber,
                projectTitle: quote.projectTitle,
                projectDescription: quote.projectDescription,
                items: itemsWithSubtotals,
                totalAmount: totalAmount,
                validUntil: quote.validUntil.toLocaleDateString(),
                quoteViewUrl: `${process.env.FRONTEND_URL}/quotes/${quote._id}/view`,
                terms: quote.terms
            };
            const result = await this.sendEmail(
                quote.clientEmail,
                `Your Quote is Ready - ${quote.quoteNumber}`,
                'quote-sent',
                templateData
            );
            return result;
        } catch (error) {
            console.error(`Failed to send quote to client for quote ID ${quoteId}:`, error);
            throw error;
        }
    }

    async sendStatusUpdate(quoteId) {
        try {
            const quote = await Quote.findById(quoteId);
            if (!quote) {
                throw new Error(`Quote with ID ${quoteId} not found`);
            }
            const templateName = quote.status === 'approved' ? 'quote-approved' : 'quote-rejected';
            
            const templateData = {
                clientName: quote.clientName,
                quoteNumber: quote.quoteNumber,
                projectTitle: quote.projectTitle,
                totalAmount: quote.totalAmount ? quote.totalAmount.toFixed(2) : '0.00',
                projectDuration: quote.projectDuration,
                status: quote.status
            };
            const subject = quote.status === 'approved' 
                ? `Great News! Quote Approved - ${quote.quoteNumber}`
                : `Quote Status Update - ${quote.quoteNumber}`;
            const result = await this.sendEmail(
                quote.clientEmail,
                subject,
                templateName,
                templateData
            );
            return result;
        } catch (error) {
            console.error(`Failed to send status update for quote ID ${quoteId}:`, error);
            throw error;
        }
    }

    async sendQuoteReminder(quoteId) {
        try {
            const quote = await Quote.findById(quoteId);
            if (!quote) {
                throw new Error(`Quote with ID ${quoteId} not found`);
            }
            const templateData = {
                clientName: quote.clientName,
                quoteNumber: quote.quoteNumber,
                projectTitle: quote.projectTitle,
                totalAmount: quote.totalAmount ? quote.totalAmount.toFixed(2) : '0.00',
                validUntil: quote.validUntil.toLocaleDateString(),
                daysUntilExpiration: quote.daysUntilExpiration,
                quoteViewUrl: `${process.env.FRONTEND_URL}/quotes/${quote._id}/view`
            };
            const result = await this.sendEmail(
                quote.clientEmail,
                `Reminder: Quote Expires Soon - ${quote.quoteNumber}`,
                'quote-reminder',
                templateData
            );
            return result;
        } catch (error) {
            console.error(`Failed to send quote reminder for quote ID ${quoteId}:`, error);
            throw error;
        }
    }

    async sendQuoteExpired(quoteId) {
        try {
            const quote = await Quote.findById(quoteId);
            if (!quote) {
                throw new Error(`Quote with ID ${quoteId} not found`);
            }
            const templateData = {
                clientName: quote.clientName,
                quoteNumber: quote.quoteNumber,
                projectTitle: quote.projectTitle,
                totalAmount: quote.totalAmount ? quote.totalAmount.toFixed(2) : '0.00',
                validUntil: quote.validUntil.toLocaleDateString()
            };
            const result = await this.sendEmail(
                quote.clientEmail,
                `Quote Expired - ${quote.quoteNumber}`,
                'quote-expired',
                templateData
            );
            return result;
        } catch (error) {
            console.error(`Failed to send quote expired notification for quote ID ${quoteId}:`, error);
            throw error;
        }
    }

    async sendBulkReminders(quoteIds) {
        const results = [];
        
        for (const quoteId of quoteIds) {
            try {
                await this.sendQuoteReminder(quoteId);
                results.push({ quoteId, success: true });
            } catch (error) {
                console.error(`Failed to send reminder for quote ID ${quoteId}:`, error);
                results.push({ quoteId, success: false, error: error.message });
            }
        }
        
        return results;
    }
    
    async testEmailConfig() {
        try {
            const testResult = await this.transporter.verify();
            console.log('Email configuration test passed:', testResult);
            return { success: true, message: 'Email configuration is working' };
        } catch (error) {
            console.error('Email configuration test failed:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = new EmailService();