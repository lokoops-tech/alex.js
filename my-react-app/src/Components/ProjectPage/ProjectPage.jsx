import React, { useState } from 'react';
import SectionTitle from '../SectionTitle/SectionTitle';
import ProjectCard from '../ProjectCard/ProjectCard';
import projects from '../../Assets/Project';
import './ProjectsPage.css'; // Import the page's CSS

const ProjectsPage = () => {
  const [filter, setFilter] = useState('All'); // State for project filtering

  // Example project data - REPLACE with your client's actual projects and images

  const categories = ['All', 'Residential', 'Commercial', 'Renovation']; // Define your categories

  const filteredProjects = filter === 'All'
    ? projects
    : projects.filter(project => project.category === filter);

  // Function to handle clicking on a project card (e.g., open a modal or navigate to a detail page)
  const handleProjectClick = (projectId) => {
    console.log(`Clicked project with ID: ${projectId}. You can implement a modal or routing here.`);
    // Example: navigate(`/projects/${projectId}`); // Requires react-router-dom
    // Example: openProjectModal(projectId); // If you implement a modal
  };

  return (
    <div className="projects-page">
      <section className="projects-hero-banner">
        <div className="projects-hero-overlay"></div>
        <div className="projects-hero-content container">
          <h1 className="projects-hero-title">Our Completed Projects</h1>
          <p className="projects-hero-subtitle">Showcasing Our Commitment to Excellence and Innovation.</p>
        </div>
      </section>

      <section className="projects-portfolio-section container">
        <SectionTitle
          title="Explore Our Work"
          subtitle="A Glimpse of Our Legacy"
        />

        <div className="filter-buttons">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                image={project.image}
                title={project.title}
                category={project.category}
                onClick={() => handleProjectClick(project.id)}
              />
            ))
          ) : (
            <p className="no-projects-message">No projects found for this category.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;