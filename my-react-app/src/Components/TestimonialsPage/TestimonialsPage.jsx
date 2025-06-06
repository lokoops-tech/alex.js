import React from 'react';
import SectionTitle from '../SectionTitle/SectionTitle';
import TestimonialCard from '../TestimonialsCard/TestimonialCard';
import Button from '../Button/Button';
import './TestimonialsPage.css'; // Import the page's CSS
import testimonials from '../../Assets/test';
const TestimonialsPage = () => {
  // Example testimonial data - REPLACE with your client's actual testimonials and images
 

  return (
    <div className="testimonials-page">
      <section className="testimonials-hero-banner">
        <div className="testimonials-hero-overlay"></div>
        <div className="testimonials-hero-content container">
          <h1 className="testimonials-hero-title">What Our Clients Say</h1>
          <p className="testimonials-hero-subtitle">Hear Directly From Those We've Served.</p>
        </div>
      </section>

      <section className="testimonials-list-section container">
        <SectionTitle
          title="Building Trust, One Project at a Time"
          subtitle="Client Success Stories"
        />
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <TestimonialCard
              key={testimonial.id}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              company={testimonial.company}
              image={testimonial.image}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </section>

      <section className="testimonials-cta-banner">
        <div className="testimonials-cta-overlay"></div>
        <div className="testimonials-cta-content container text-center">
          <h2>Ready to Become Our Next Success Story?</h2>
          <p>We're eager to discuss your project and deliver the same exceptional results.</p>
          <Button variant="secondary" href="/contact">Get Your Free Consultation</Button>
        </div>
      </section>
    </div>
  );
};

export default TestimonialsPage;