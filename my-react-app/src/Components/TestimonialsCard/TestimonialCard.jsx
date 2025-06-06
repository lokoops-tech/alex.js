import React from 'react';
import './TestimonialCard.css'; // Import the component's CSS

const TestimonialCard = ({ quote, author, role, company, image, rating }) => {
  // Function to render star ratings (optional)
  const renderStars = (numStars) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < numStars) {
        stars.push(<span key={i} className="star filled">⭐</span>); // Filled star
      } else {
        stars.push(<span key={i} className="star">☆</span>); // Empty star
      }
    }
    return <div className="stars-container">{stars}</div>;
  };

  return (
    <div className="testimonial-card">
      {rating && renderStars(rating)}
      <p className="testimonial-quote">"{quote}"</p>
      <div className="testimonial-author-info">
        {image && (
          <img src={image} alt={author} className="testimonial-author-img" />
        )}
        <div className="author-details">
          <h4 className="testimonial-author">{author}</h4>
          {(role || company) && (
            <p className="testimonial-meta">
              {role && <span>{role}</span>}
              {role && company && <span className="meta-separator"> | </span>}
              {company && <span>{company}</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;