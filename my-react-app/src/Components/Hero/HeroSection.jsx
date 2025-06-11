import React, { useState, useEffect } from 'react';
import Button from '../Button/Button';
import QuoteSection from '../Quote/Quote';
import done from '../../Assets/arch.jpg';
import craft from '../../Assets/craft3.jpeg';
import hero from '../../Assets/new1.webp';
import craft2 from '../../Assets/cons1.jpg';
import anime from '../../Assets/3D.jpg';
import repair from '../../Assets/repair.jpg'
import road from '../../Assets/road.jpg'
import './HeroSection.css';

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  // Using your actual images
  const images = [done, craft, craft2, hero, anime, repair, road];

  useEffect(() => {
    setIsVisible(true);
    
    // Auto-rotate background images
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleGetQuote = () => {
    setShowQuoteModal(true);
  };

  const handleCloseQuote = () => {
    setShowQuoteModal(false);
  };

  const handleViewProjects = () => {
    // Scroll to projects section or navigate to projects page
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If no projects section on current page, you can navigate to projects page
      window.location.href = '/projects';
    }
  };

  return (
    <>
      <section className="hero-section">
        {/* Animated Background Images */}
        <div className="hero-background">
          {images.map((image, index) => (
            <div
              key={index}
              className={`hero-bg-image ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>

        {/* Enhanced Overlay with Gradient */}
        <div className="hero-overlay"></div>
             
        {/* Floating Particles Animation */}
        <div className="hero-particles">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className={`hero-content container ${isVisible ? 'visible' : ''}`}>
                 
          {/* Animated Title */}
          <h1 className="hero-title">
            <span className="title-word-1">Building</span>{' '}
            <span className="title-word-2">Dreams</span>
            <br />
            <span className="title-subtitle">Brick by Brick</span>
          </h1>

          {/* Animated Subtitle */}
          <p className="hero-subtitle">
            Your trusted partner for quality residential, commercial, and renovation projects.
          </p>

          {/* Animated Buttons */}
          <div className="hero-buttons">
            <Button 
              variant="secondary" 
              onClick={handleGetQuote}
              className="quote-btn"
            >
              Get a Free Quote
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={handleViewProjects}
              className="projects-btn"
            >
              View Our Projects
            </Button>
          </div>

          {/* Scroll Indicator */}
          <div className="scroll-indicator">
            <div className="scroll-dot"></div>
          </div>
        </div>

        {/* Image Navigation Dots */}
        <div className="hero-nav-dots">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`nav-dot ${index === currentImageIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </section>

      {/* Quote Modal */}
      <QuoteSection 
        isVisible={showQuoteModal} 
        onClose={handleCloseQuote} 
      />
    </>
  );
};

export default HeroSection;