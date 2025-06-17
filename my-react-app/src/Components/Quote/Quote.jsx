import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, X } from 'lucide-react';
import validator from 'validator';
import './QuoteSection.css'; // Import the CSS file
const API_URL = "http://localhost:5000/quotes/newquote"; 

// Custom validation functions
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  // Basic phone validation that accepts international numbers
  const re = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return re.test(phone);
};

const QuoteRequestSection = ({ isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    projectTitle: '',
    projectDescription: '',
    projectType: '',
    location: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // New state for success message display
  
  // Actual API call to backend
  const submitQuote = async (quoteData) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit quote');
      }
      
      console.log("quote data", quoteData);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    items[index] = { 
      ...items[index], 
      [field]: field === 'quantity' || field === 'unitPrice' ? parseFloat(value) || 0 : value 
    };
    setFormData(prev => ({ ...prev, items }));
  };
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };
  
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Client Name validation
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    } else if (formData.clientName.trim().length < 2 || formData.clientName.trim().length > 100) {
      newErrors.clientName = 'Name must be between 2 and 100 characters';
    }
    
    // Client Email validation
    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required';
    } else if (!validateEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email';
    }
    
    // Client Phone validation
    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required';
    } else if (!validatePhone(formData.clientPhone)) {
      newErrors.clientPhone = 'Please enter a valid phone number';
    }
    
    // Project Title validation
    if (!formData.projectTitle.trim()) {
      newErrors.projectTitle = 'Project title is required';
    } else if (formData.projectTitle.trim().length < 5 || formData.projectTitle.trim().length > 200) {
      newErrors.projectTitle = 'Title must be between 5 and 200 characters';
    }
    
    // Project Description validation
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = 'Description is required';
    } else if (formData.projectDescription.trim().length < 20 || formData.projectDescription.trim().length > 2000) {
      newErrors.projectDescription = 'Description must be between 20 and 2000 characters';
    }
    
    // Project Type validation
    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }
    
    // Location validation
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    // Items validation
    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item-${index}-description`] = 'Item description is required';
      } else if (item.description.trim().length < 3 || item.description.trim().length > 500) {
        newErrors[`item-${index}-description`] = 'Description must be between 3 and 500 characters';
      }
      
      if (item.quantity <= 0) {
        newErrors[`item-${index}-quantity`] = 'Quantity must be greater than 0';
      }
      
      if (item.unitPrice < 0) {
        newErrors[`item-${index}-unitPrice`] = 'Unit price cannot be negative';
      }
    });
    
    // At least one item validation
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('validation_error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('sending');
    
    try {
      // Prepare the data to match the API schema
      const quoteData = {
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        projectTitle: formData.projectTitle,
        projectDescription: formData.projectDescription,
        projectType: formData.projectType,
        location: formData.location,
        items: formData.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };
      
      console.log("response", quoteData);
      const response = await submitQuote(quoteData);
      
      if (response.success) {
        setSubmitStatus('success');
        setShowSuccessMessage(true); // Show success message
        
        // Reset form after user closes the success message
        // We no longer auto-close after 5 seconds
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting quote:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusMessage = () => {
    switch (submitStatus) {
      case 'sending':
        return { type: 'info', message: 'Sending your quote request...' };
      case 'success':
        return { type: 'success', message: 'Quote request sent successfully! We\'ll get back to you within 24 hours.' };
      case 'error':
        return { type: 'error', message: 'Failed to send quote request. Please try again.' };
      case 'validation_error':
        return { type: 'error', message: 'Please fix the errors below and try again.' };
      default:
        return null;
    }
  };
  
  const handleSuccessClose = () => {
    // Reset form and close modal when user clicks the close button
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      projectTitle: '',
      projectDescription: '',
      projectType: '',
      location: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });
    setSubmitStatus('');
    setShowSuccessMessage(false);
    onClose();
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="quote-overlay">
      <div className="quote-modal">
        <div className="quote-header">
          <h2>Request a Quote</h2>
          <button className="close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>
        <div className="quote-content">
          {showSuccessMessage ? (
            <div className="success-message">
              <div className="success-icon">
                <CheckCircle size={32} />
              </div>
              <h3>Quote Request Submitted!</h3>
              <p>Thank you for your request. We'll review your requirements and get back to you within 24 hours with a detailed quote.</p>
              <button 
                className="btn btn-secondary" 
                onClick={handleSuccessClose}
              >
                Close
              </button>
            </div>
          ) : (
            <form className="quote-form" onSubmit={handleSubmit}>
              {/* Status Message */}
              {getStatusMessage() && (
                <div className={`status-message ${getStatusMessage().type}`}>
                  {getStatusMessage().type === 'success' && <CheckCircle size={16} />}
                  {getStatusMessage().type === 'error' && <AlertCircle size={16} />}
                  {getStatusMessage().type === 'info' && <Send size={16} />}
                  {getStatusMessage().message}
                </div>
              )}
              {/* Basic Information */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="clientName">Full Name *</label>
                  <input
                    type="text"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={errors.clientName ? 'error-input' : ''}
                    placeholder="Enter your full name"
                    disabled={isSubmitting}
                  />
                  {errors.clientName && <div className="error-text">{errors.clientName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="clientEmail">Email Address *</label>
                  <input
                    type="email"
                    id="clientEmail"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className={errors.clientEmail ? 'error-input' : ''}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                  />
                  {errors.clientEmail && <div className="error-text">{errors.clientEmail}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="clientPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="clientPhone"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    className={errors.clientPhone ? 'error-input' : ''}
                    placeholder="Enter your phone number"
                    disabled={isSubmitting}
                  />
                  {errors.clientPhone && <div className="error-text">{errors.clientPhone}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="projectType">Project Type *</label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className={errors.projectType ? 'error-input' : ''}
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
                  {errors.projectType && <div className="error-text">{errors.projectType}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="location">Project Location *</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={errors.location ? 'error-input' : ''}
                    placeholder="City, County"
                    disabled={isSubmitting}
                  />
                  {errors.location && <div className="error-text">{errors.location}</div>}
                </div>
              </div>
              {/* Project Details */}
              <div className="form-group">
                <label htmlFor="projectTitle">Project Title *</label>
                <input
                  type="text"
                  id="projectTitle"
                  name="projectTitle"
                  value={formData.projectTitle}
                  onChange={handleInputChange}
                  className={errors.projectTitle ? 'error-input' : ''}
                  placeholder="Brief title for your project"
                  disabled={isSubmitting}
                />
                {errors.projectTitle && <div className="error-text">{errors.projectTitle}</div>}
              </div>
              <div className="form-group full-width">
                <label htmlFor="projectDescription">Project Description *</label>
                <textarea
                  id="projectDescription"
                  name="projectDescription"
                  value={formData.projectDescription}
                  onChange={handleInputChange}
                  className={errors.projectDescription ? 'error-input' : ''}
                  rows="4"
                  placeholder="Please provide detailed information about your project requirements"
                  disabled={isSubmitting}
                />
                {errors.projectDescription && <div className="error-text">{errors.projectDescription}</div>}
              </div>
              {/* Quote Items */}
              <div className="items-section">
                <div className="items-header">
                  <h3>Specific Items/Services *</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="add-item-btn"
                    disabled={isSubmitting}
                  >
                    Add Item
                  </button>
                </div>
                {errors.items && <div className="error-text">{errors.items}</div>}
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="form-group">
                      <label htmlFor={`item-${index}-description`}>Description *</label>
                      <input
                        type="text"
                        id={`item-${index}-description`}
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className={errors[`item-${index}-description`] ? 'error-input' : ''}
                        placeholder="Item or service description"
                        disabled={isSubmitting}
                  />
                      {errors[`item-${index}-description`] && (
                        <div className="error-text">{errors[`item-${index}-description`]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor={`item-${index}-quantity`}>Quantity *</label>
                      <input
                        type="number"
                        id={`item-${index}-quantity`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className={errors[`item-${index}-quantity`] ? 'error-input' : ''}
                        min="0.01"
                        step="0.01"
                        disabled={isSubmitting}
                  />
                      {errors[`item-${index}-quantity`] && (
                        <div className="error-text">{errors[`item-${index}-quantity`]}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label htmlFor={`item-${index}-unitPrice`}>Est. Unit Price (KSh) *</label>
                      <input
                        type="number"
                        id={`item-${index}-unitPrice`}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className={errors[`item-${index}-unitPrice`] ? 'error-input' : ''}
                        min="0"
                        step="0.01"
                        disabled={isSubmitting}
                  />
                      {errors[`item-${index}-unitPrice`] && (
                        <div className="error-text">{errors[`item-${index}-unitPrice`]}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="remove-item-btn"
                      disabled={formData.items.length <= 1 || isSubmitting}
                      title="Remove item"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {calculateTotal() > 0 && (
                  <div className="total-section">
                    <p className="total-amount">
                      Estimated Total: KSh {calculateTotal().toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Quote Request
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestSection;