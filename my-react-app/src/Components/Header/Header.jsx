import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './Header.css'; // Import the component's CSS

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo">
          <p className="logo-img">lokoops</p>
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle navigation menu">
          <span className="hamburger-icon"></span>
          <span className="hamburger-icon"></span>
          <span className="hamburger-icon"></span>
        </button>

        <nav className={`main-nav ${isOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            <li className="nav-item">
              {/* Use Link instead of a href */}
              <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About Us</Link>
            </li>
            <li className="nav-item">
              <Link to="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</Link>
            </li>
            <li className="nav-item">
              <Link to="/projects" className="nav-link" onClick={() => setIsOpen(false)}>Projects</Link>
            </li>
            <li className="nav-item">
              {/* Assuming you will add a /blog-news route in App.jsx */}
              <Link to="/blog-news" className="nav-link" onClick={() => setIsOpen(false)}>Blogs & News</Link> 
            </li>
            {/* You might want to add a link to the testimonials page here as well */}
            <li className="nav-item">
              <Link to="/testimonials" className="nav-link" onClick={() => setIsOpen(false)}>Testimonials</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact Us</Link>
            </li>
          </ul>
        </nav>
        {/* This second nav block for the call/whatsapp link might be better integrated into the first nav or styled separately */}
        <div className={`main-nav ${isOpen ? 'active' : ''}`}> 
          <ul className='nav-list'>
            <li className="nav-item">
              {/* For external links like call/whatsapp, a regular <a> tag is fine, but consider styling for consistency */}
              <a href="tel:+254718315313" className="nav-link" onClick={() => setIsOpen(false)}>Call/WhatsApp +254718315313</a>
            </li> 
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
