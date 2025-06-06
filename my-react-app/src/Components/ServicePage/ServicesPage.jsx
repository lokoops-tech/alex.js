import React from 'react';
import SectionTitle from '../SectionTitle/SectionTitle';
import Button from '../Button/Button';
import ServiceCard from '../ServiceCard/ServiceCard';
import services from '../../Assets/Services';
import './ServicesPage.css';

const ServicesPage = () => {
  // Example service data - replace with your client's actual services
  return (
    <div className="services-page">
      <section className="services-hero-banner">
        <div className="services-hero-overlay"></div>
        <div className="services-hero-content container">
          <h1 className="services-hero-title">Our Expert Construction Services</h1>
          <p className="services-hero-subtitle">Bringing Your Projects to Life with Precision and Quality.</p>
        </div>
      </section>

      <section className="services-list-section container">
        <SectionTitle
          title="What We Offer"
          subtitle="Comprehensive Solutions"
        />
        <div className="services-grid">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              icon={service.icon}
              image={service.image}
              title={service.title}
              description={service.description}
              link={service.link}
            />
          ))}
        </div>
      </section>

      <section className="services-cta-banner">
        <div className="services-cta-overlay"></div>
        <div className="services-cta-content container text-center">
          <h2>Ready to Start Your Next Project?</h2>
          <p>Contact us today for a free consultation and let's discuss how we can bring your vision to life.</p>
          <Button variant="secondary" href="/contact">Request a Quote</Button>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;