import React from 'react';
import SectionTitle from '../SectionTitle/SectionTitle';
import './AboutPage.css'; // Import the page's CSS

const AboutPage = () => {
  return (
    <div className="about-page">
      <section className="about-hero-banner">
        <div className="about-hero-overlay"></div>
        <div className="about-hero-content container">
          <h1 className="about-hero-title">About Our Company</h1>
          <p className="about-hero-subtitle">Building Trust, Delivering Excellence.</p>
        </div>
      </section>

      <section className="about-intro-section container">
        <SectionTitle 
          title="Our Journey of Building Excellence" 
          subtitle="Who We Are" 
        />
        <div className="about-intro-content">
          <p>
            Founded in [Year of Establishment], [Your Company Name] began with a singular vision:
            to revolutionize the construction industry by blending innovative techniques with time-honored craftsmanship.
            What started as a small team with a big dream has grown into a leading construction firm in Nairobi,
            renowned for its commitment to quality, integrity, and client satisfaction.
          </p>
          <p>
            Over the years, we've successfully completed a diverse portfolio of projects, from bespoke residential
            homes and modern commercial complexes to intricate renovations. Each project is a testament to our
            dedication, meticulous planning, and the unwavering hard work of our skilled professionals.
          </p>
        </div>
      </section>

      <section className="mission-vision-section">
        <div className="container mission-vision-grid">
          <div className="mission-card">
            <h3>Our Mission</h3>
            <p>
              To deliver superior construction services that consistently exceed client expectations,
              upholding the highest standards of quality, safety, and efficiency. We are dedicated
              to building lasting structures and relationships.
            </p>
          </div>
          <div className="vision-card">
            <h3>Our Vision</h3>
            <p>
              To be the most trusted and sought-after construction company in Kenya, recognized for
              our innovative solutions, sustainable practices, and the profound positive impact we
              have on communities through our built environments.
            </p>
          </div>
        </div>
      </section>

      <section className="our-values-section container">
        <SectionTitle 
          title="Values That Guide Us" 
          subtitle="Our Foundation" 
        />
        <div className="values-grid">
          <div className="value-item">
            <span className="value-icon">🏗️</span> {/* Example icon */}
            <h4>Integrity</h4>
            <p>Operating with honesty, transparency, and ethical conduct in all our dealings.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">👷</span>
            <h4>Quality Craftsmanship</h4>
            <p>Committed to precision and excellence in every detail of our work.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">🤝</span>
            <h4>Client Centricity</h4>
            <p>Placing our clients' needs at the forefront, fostering strong, collaborative relationships.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">⛑️</span>
            <h4>Safety First</h4>
            <p>Prioritizing the well-being of our team, clients, and the public on every site.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">💡</span>
            <h4>Innovation</h4>
            <p>Embracing new technologies and methods to deliver efficient and sustainable solutions.</p>
          </div>
          <div className="value-item">
            <span className="value-icon">⏰</span>
            <h4>Timely Delivery</h4>
            <p>Ensuring projects are completed on schedule without compromising quality.</p>
          </div>
        </div>
      </section>

      <section className="certifications-section container">
        <SectionTitle 
          title="Our Credentials" 
          subtitle="Accreditation & Trust" 
        />
        <div className="certifications-content">
          <p>
            [Your Company Name] holds all necessary licenses and certifications, ensuring
            we operate to the highest industry standards. We are proud members of various
            professional associations, reflecting our commitment to excellence and continuous
            improvement in the construction sector.
          </p>
          <ul className="cert-list">
            <li>National Construction Authority (NCA) Registered</li>
            <li>[Other relevant certification, e.g., ISO 9001:2015]</li>
            <li>[Any industry awards or recognitions]</li>
          </ul>
        </div>
      </section>

      {/* Optionally, you can add a "Meet the Team" section here */}
      {/* <section className="team-section container">
        <SectionTitle title="Meet Our Leadership" subtitle="The Driving Force" />
        <div className="team-grid">
          <div className="team-member">
            <img src="/images/team/john-doe.jpg" alt="John Doe" />
            <h4>John Doe</h4>
            <p>CEO & Founder</p>
          </div>
          {/* Add more team members as needed }
        </div>
      </section> */}
    </div>
  );
};

export default AboutPage;