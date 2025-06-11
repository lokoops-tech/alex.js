import React, { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'; 
import Button from '../Button/Button';
import './QuoteSection.css';

const QuoteSection = ({ isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectType: '',
    location: '',
    budget: '',
    timeline: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [emailJSInitialized, setEmailJSInitialized] = useState(false);

  // Initialize EmailJS when component mounts
  useEffect(() => {
    const initializeEmailJS = () => {
      try {
        // Initialize EmailJS with your public key
        emailjs.init('6OvX4-mZfc9VVzXt5');
        setEmailJSInitialized(true);
        console.log('EmailJS initialized successfully');
      } catch (error) {
        console.error('Failed to initialize EmailJS:', error);
        setSubmitStatus('init_error');
      }
    };

    initializeEmailJS();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['name', 'email', 'phone', 'projectType'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setSubmitStatus('validation_error');
      console.error('Missing required fields:', missingFields);
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('email_error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!emailJSInitialized) {
      setSubmitStatus('init_error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('sending');

    // EmailJS configuration
    const serviceID = 'service_wqng82z';
    const templateID = 'template_x5mzkja';

    // Template parameters that will be sent to your email template
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      from_phone: formData.phone,
      project_type: formData.projectType,
      project_location: formData.location || 'Not specified',
      project_budget: formData.budget || 'Not specified',
      project_timeline: formData.timeline || 'Not specified',
      project_description: formData.description || 'No description provided',
      to_name: 'Construction Team',
      reply_to: formData.email,
    };

    console.log('Sending email with params:', templateParams);
    console.log('Service ID:', serviceID);
    console.log('Template ID:', templateID);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const emailPromise = emailjs.send(
        serviceID,
        templateID,
        templateParams
      );

      const response = await Promise.race([emailPromise, timeoutPromise]);

      console.log('Email sent successfully:', response);
      
      if (response.status === 200) {
        setSubmitStatus('success');
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            phone: '',
            projectType: '',
            location: '',
            budget: '',
            timeline: '',
            description: ''
          });
          setSubmitStatus('');
          onClose();
        }, 3000);
      } else {
        throw new Error(`EmailJS returned status: ${response.status}`);
      }

    } catch (error) {
      console.error('Email sending failed:', error);
      
      // More specific error handling
      if (error.message === 'Request timeout') {
        setSubmitStatus('timeout_error');
      } else if (error.status === 400) {
        setSubmitStatus('template_error');
      } else if (error.status === 403) {
        setSubmitStatus('auth_error');
      } else {
        setSubmitStatus('error');
      }
      
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        text: error.text
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = () => {
    switch (submitStatus) {
      case 'validation_error':
        return 'Please fill in all required fields.';
      case 'email_error':
        return 'Please enter a valid email address.';
      case 'init_error':
        return 'Email service initialization failed. Please refresh the page.';
      case 'timeout_error':
        return 'Request timed out. Please check your internet connection and try again.';
      case 'template_error':
        return 'Email template error. Please contact support.';
      case 'auth_error':
        return 'Authentication failed. Please contact support.';
      case 'error':
      default:
        return 'Something went wrong. Please try again or contact us directly.';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="quote-overlay">
      <div className="quote-modal">
        <div className="quote-header">
          <h2>Get Your Free Quote</h2>
          <button className="close-btn" onClick={onClose}>
            <span>&times;</span>
          </button>
        </div>

        <div className="quote-content">
          {submitStatus === 'success' ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h3>Quote Request Sent!</h3>
              <p>Thank you for your interest. We'll get back to you within 24 hours with a detailed quote.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="quote-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your phone number"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectType">Project Type *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select project type</option>
                    <option value="residential">Residential Construction</option>
                    <option value="commercial">Commercial Construction</option>
                    <option value="renovation">Renovation/Remodeling</option>
                    <option value="repair">Repair Services</option>
                    <option value="road">Road Construction</option>
                    <option value="architectural">Architectural Design</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Project Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, County"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Estimated Budget</label>
                  <select
                    id="budget"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Select budget range</option>
                    <option value="under-50k">Under KSh 50,000</option>
                    <option value="50k-100k">KSh 50,000 - 100,000</option>
                    <option value="100k-500k">KSh 100,000 - 500,000</option>
                    <option value="500k-1m">KSh 500,000 - 1,000,000</option>
                    <option value="1m-5m">KSh 1M - 5M</option>
                    <option value="over-5m">Over KSh 5M</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="timeline">Preferred Timeline</label>
                  <select
                    id="timeline"
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  >
                    <option value="">Select timeline</option>
                    <option value="asap">ASAP</option>
                    <option value="1-3months">1-3 months</option>
                    <option value="3-6months">3-6 months</option>
                    <option value="6-12months">6-12 months</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Project Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Please describe your project in detail..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Status Messages */}
              {submitStatus === 'sending' && (
                <div className="info-message">
                  Sending your quote request...
                </div>
              )}

              {submitStatus && !['success', 'sending'].includes(submitStatus) && (
                <div className="error-message">
                  {getErrorMessage()}
                </div>
              )}

              {!emailJSInitialized && (
                <div className="warning-message">
                  Email service is initializing...
                </div>
              )}

              <div className="form-actions">
                <Button 
                  type="button" 
                  variant="outline-primary" 
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="secondary"
                  disabled={isSubmitting || !emailJSInitialized}
                >
                  {isSubmitting ? 'Sending...' : 'Get Free Quote'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteSection;