import React, { useState } from 'react';
import {
  Facebook,
  Linkedin,
  X, // This is the new X (Twitter) icon from Lucide
  Instagram,
  Mail,
  Phone,
  MapPin,
  Star // For review form feedback or placeholder
} from 'lucide-react'; // Import necessary icons
import Button from '../Button/Button';
import './Footer.css'; // Import the component's CSS

const Footer = () => {
  const [reviewData, setReviewData] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: 5 // Default rating
  });

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    console.log('Review data submitted:', reviewData);
    // In a real application, you'd send this to a backend or a review management service
    alert('Thank you for your review! We appreciate your feedback.');
    setReviewData({ // Clear form
      name: '',
      email: '',
      feedback: '',
      rating: 5
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-content-grid">
        {/* Column 1: Company Info */}
        <div className="footer-column company-info">
          <h3>Lokoops</h3>
          <p>
            Building dreams, brick by brick. We are dedicated to delivering
            high-quality construction solutions that stand the test of time.
          </p>
          <a href="/about" className="footer-link-more">Learn More &rarr;</a>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column quick-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/" className="footer-link">Home</a></li>
            <li><a href="/about" className="footer-link">About Us</a></li>
            <li><a href="/services" className="footer-link">Services</a></li>
            <li><a href="/projects" className="footer-link">Our Projects</a></li>
            <li><a href="/testimonials" className="footer-link">Testimonials</a></li>
            <li><a href="/contact" className="footer-link">Contact Us</a></li>
          </ul>
        </div>

        {/* Column 3: Contact Info */}
        <div className="footer-column contact-info-short">
          <h4>Contact Us</h4>
          <p><Mail className="contact-icon" size={18} /> info@yourcompany.com</p>
          <p><Phone className="contact-icon" size={18} /> +254 712 345 678</p>
          <p><MapPin className="contact-icon" size={18} /> 123 Construction Rd, Nairobi</p>
        </div>

        {/* Column 4: Review Form */}
        <div className="footer-column review-form-column">
          <h4>Leave a Review</h4>
          <form className="review-form" onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name (Optional)"
                value={reviewData.name}
                onChange={handleReviewChange}
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email (Optional)"
                value={reviewData.email}
                onChange={handleReviewChange}
              />
            </div>
            <div className="form-group">
              <textarea
                name="feedback"
                rows="3"
                placeholder="Your feedback..."
                value={reviewData.feedback}
                onChange={handleReviewChange}
                required
              ></textarea>
            </div>
            <div className="form-group rating-group">
              <label htmlFor="rating">Your Rating:</label>
              <select
                id="rating"
                name="rating"
                value={reviewData.rating}
                onChange={handleReviewChange}
                className="rating-select"
              >
                {[5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num}>{num} {Array(num).fill('⭐').join('')}</option>
                ))}
              </select>
            </div>
            <Button type="submit" variant="secondary" className="review-submit-btn">
              Submit Review
            </Button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Section */}
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <div className="social-links">
            <a href="https://facebook.com/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="https://twitter.com/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <X size={24} /> {/* X (Twitter) Icon */}
            </a>
            <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <Linkedin size={24} />
            </a>
            <a href="https://instagram.com/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={24} />
            </a>
          </div>
          <p className="copyright">&copy; {currentYear} Lokoop. All rights reserved.|Designed By Lokops</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;