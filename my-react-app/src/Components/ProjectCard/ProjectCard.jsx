import React from 'react';
import './ProjectCard.css'; // Import the component's CSS

const ProjectCard = ({ image, title, category, onClick }) => {
  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-image-wrapper">
        <img src={image} alt={title} className="project-image" />
        <div className="project-overlay">
          <span className="project-view-icon">🔍</span> {/* Simple view icon */}
        </div>
      </div>
      <div className="project-info">
        <h3 className="project-title">{title}</h3>
        <p className="project-category">{category}</p>
      </div>
    </div>
  );
};

export default ProjectCard;