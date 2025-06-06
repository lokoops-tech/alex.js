import React from 'react';
import './ServiceCard.css'; // Import the component's CSS
import Button from '../Button/Button';

const ServiceCard = ({ icon, image, title, description, link }) => {
  return (
    <div className="service-card">
      <div className="service-icon-container">
        {icon && <span className="service-icon">{icon}</span>}
        {image && <img src={image} alt={title} className="service-image" />}
      </div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
      {link && (
        <Button variant="outline-secondary" href={link} className="service-learn-more">
          Learn More
        </Button>
      )}
    </div>
  );
};

export default ServiceCard;