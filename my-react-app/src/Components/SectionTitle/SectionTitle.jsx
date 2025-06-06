import React from 'react';
import './SectionTitle.css'; // Import the component's CSS

const SectionTitle = ({ title, subtitle, className = '' }) => {
  return (
    <div className={`section-title-container ${className}`}>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      <h2 className="section-main-title">{title}</h2>
      <div className="section-title-underline"></div>
    </div>
  );
};

export default SectionTitle;