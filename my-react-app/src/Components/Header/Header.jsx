import React, { useState } from 'react';
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
              <a href="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</a>
            </li>
            <li className="nav-item">
              <a href="/about" className="nav-link" onClick={() => setIsOpen(false)}>About Us</a>
            </li>
            <li className="nav-item">
              <a href="/services" className="nav-link" onClick={() => setIsOpen(false)}>Services</a>
            </li>
            <li className="nav-item">
              <a href="/projects" className="nav-link" onClick={() => setIsOpen(false)}>Projects</a>
            </li>
            <li className="nav-item">
              <a href="/blog-news" className="nav-link" onClick={() => setIsOpen(false)}>Blogs & News</a> 
            </li>
            
          </ul>
        </nav>
        <div className={`main-nav ${isOpen ? 'active' : ''}`}>
        <ul className='nav-list'>
        <li className="nav-item">
              <a href="/call" className="nav-link" onClick={() => setIsOpen(false)}>call/whatsapp +254718315313</a>
            </li> 
            </ul>
      </div>
      </div>
      
    </header>
  );
};

export default Header;