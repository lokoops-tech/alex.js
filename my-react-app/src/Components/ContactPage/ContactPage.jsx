import React, { useState } from 'react';
import SectionTitle from '../SectionTitle/SectionTitle';
import Button from '../Button/Button';
import {
    Facebook,
    Phone,
    Mail,
    MapPin,
    Clock,
    Linkedin
  } from 'lucide-react';
import './ContactPage.css'; // Import the page's CSS

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data submitted:', formData);
    // Here you would typically send the data to a backend API or an email service
    alert('Thank you for your message! We will get back to you shortly.');
    setFormData({ // Clear form after submission
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-page">
      <section className="contact-hero-banner">
        <div className="contact-hero-overlay"></div>
        <div className="contact-hero-content container">
          <h1 className="contact-hero-title">Get In Touch With Us</h1>
          <p className="contact-hero-subtitle">Let's Discuss Your Next Construction Project.</p>
        </div>
      </section>

      <section className="contact-info-section container">
        <SectionTitle
          title="Contact Information"
          subtitle="We're Here to Help"
        />
        <div className="contact-details-grid">
          <div className="detail-item">
            <span className="detail-icon"><Phone size={24} /></span>
            <h3>Phone Number</h3>
            <p><a href="tel:+254712345678">+254 712 345 678</a></p> {/* Replace with actual number */}
            <p><a href="tel:+25420123456">+254 20 123 456</a></p> {/* Example landline */}
          </div>
          <div className="detail-item">
            <span className="detail-icon"><Mail size={24} /></span>
            <h3>Email Address</h3>
            <p><a href="mailto:info@yourcompany.com">info@yourcompany.com</a></p> {/* Replace with actual email */}
            <p><a href="mailto:support@yourcompany.com">support@yourcompany.com</a></p>
          </div>
          <div className="detail-item">
            <span className="detail-icon"><MapPin size={24} /></span>
            <h3>Our Location</h3>
            <p>P.O. Box 1234-00100, Nairobi, Kenya</p> {/* Replace with actual address */}
            <p>123 Construction Road, Upper Hill, Nairobi</p>
          </div>
          <div className="detail-item">
            <span className="detail-icon"><Clock size={24} /></span>
            <h3>Business Hours</h3>
            <p>Mon - Fri: 8:00 AM - 5:00 PM</p>
            <p>Saturday: 9:00 AM - 1:00 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
      </section>

      <section className="contact-form-map-section container">
        <div className="contact-form-container">
          <SectionTitle
            title="Send Us a Message"
            subtitle="Get a Free Quote"
            className="text-left" /* Aligns title to left within its container */
          />
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone (Optional):</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Subject:</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message:</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            <Button type="submit" variant="secondary" className="submit-button">
              Send Message
            </Button>
          </form>
        </div>

        <div className="map-container">
          <SectionTitle
            title="Find Our Location"
            subtitle="Visit Our Office"
            className="text-left" /* Aligns title to left */
          />
          {/* Google Map Embed Placeholder */}
          <div className="google-map">
            {/* Replace this iframe with your actual Google Maps embed code.
              Go to Google Maps, search for the location, click 'Share', then 'Embed a map'.
              Copy the iframe code and paste it here.
            */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8080000000003!2d36.8172!3d-1.286389!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f111000000000%3A0x123456789abcdef!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1678888888888!5m2!1sen!2ske"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Our Office Location"
            ></iframe>
          </div>
          <div className="social-links">
            <h4>Connect With Us:</h4>
            <a href="https://facebook.com/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <span className="social-icon"><Facebook size={20} /></span>
            </a>
            <a href="https://linkedin.com/company/yourcompany" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <span className="social-icon"><Linkedin size={20} /></span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;