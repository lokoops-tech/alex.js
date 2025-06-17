// src/admin/pages/ProjectManagementPage.jsx
import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Eye } from 'lucide-react'; // Icons
import ProjectForm from './ProjectForm';
import Button from './Button';
import Modal from './Modal';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} from '../API/ProjectApis';
import './ProjectManagement.css';

const ProjectManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Project object for editing
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);


  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllProjects();
      setProjects(data); // Backend sends array directly
    } catch (err) {
      setError("Failed to load projects: " + (err.message || 'Unknown error'));
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProject(null); // Ensure we're creating new, not editing
    setIsFormOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleViewDetails = async (id) => {
    try {
      const projectDetails = await getProjectById(id);
      setSelectedProjectDetails(projectDetails);
      setShowDetailsModal(true);
    } catch (err) {
      setError("Failed to fetch project details: " + (err.message || 'Unknown error'));
      console.error("View project details error:", err);
    }
  };


  const handleDeleteConfirm = (project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await deleteProject(projectToDelete._id);
      await fetchProjects(); // Refresh the list
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (err) {
      setError("Failed to delete project: " + (err.message || 'Unknown error'));
      console.error("Delete project error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
      } else {
        await createProject(formData);
      }
      await fetchProjects(); // Refresh the list
      setIsFormOpen(false);
      setEditingProject(null);
    } catch (err) {
      setError("Failed to save project: " + (err.message || 'Unknown error'));
      console.error("Form submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    setError(null); // Clear any form-related errors
  };

  if (loading) {
    return <div className="project-management-container">Loading projects...</div>;
  }

  if (error && !isFormOpen && !showDeleteConfirm) { // Only show global error if not in a modal/form
    return <div className="project-management-container error-message">{error}</div>;
  }

  return (
    <div className="project-management-container">
      <div className="projects-header">
        <h1>Project Management</h1>
        <Button onClick={handleCreateNew} variant="primary">
          <PlusCircle size={20} /> Add New Project
        </Button>
      </div>

      {isFormOpen && (
        <Modal onClose={handleFormCancel}>
          <ProjectForm
            project={editingProject}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            isLoading={isSubmitting}
            error={error} // Pass submission-related errors to form
          />
        </Modal>
      )}

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirmation-modal">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete project: <strong>{projectToDelete?.title}</strong>?</p>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <Button onClick={handleDelete} variant="danger" disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button onClick={() => setShowDeleteConfirm(false)} variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showDetailsModal && selectedProjectDetails && (
        <Modal onClose={() => setShowDetailsModal(false)}>
          <div className="project-details-modal">
            <h2>Project Details: {selectedProjectDetails.title}</h2>
            <p><strong>Description:</strong> {selectedProjectDetails.description}</p>
            <p><strong>Category:</strong> {selectedProjectDetails.category}</p>
            <p><strong>Client:</strong> {selectedProjectDetails.client}</p>
            <p><strong>Location:</strong> {selectedProjectDetails.location}</p>
            <p><strong>Status:</strong> {selectedProjectDetails.status}</p>
            <p><strong>Dates:</strong> {selectedProjectDetails.startDate ? new Date(selectedProjectDetails.startDate).toLocaleDateString() : 'N/A'} - {selectedProjectDetails.endDate ? new Date(selectedProjectDetails.endDate).toLocaleDateString() : 'N/A'}</p>

            {selectedProjectDetails.thumbnailUrl && (
              <div className="project-detail-thumbnail">
                <h3>Thumbnail</h3>
                <img src={selectedProjectDetails.thumbnailUrl} alt={selectedProjectDetails.title} />
              </div>
            )}

            {selectedProjectDetails.galleryImages && selectedProjectDetails.galleryImages.length > 0 && (
              <div className="project-detail-gallery">
                <h3>Gallery Images</h3>
                <div className="gallery-grid">
                  {selectedProjectDetails.galleryImages.map((imgUrl, index) => (
                    <img key={index} src={imgUrl} alt={`${selectedProjectDetails.title} gallery ${index + 1}`} />
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <Button onClick={() => setShowDetailsModal(false)} variant="secondary">Close</Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="projects-table-wrapper">
        {projects.length === 0 ? (
          <p className="no-projects-message">No projects found. Add your first project!</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Client</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>{project.title}</td>
                  <td>{project.category}</td>
                  <td>{project.client}</td>
                  <td>{project.location}</td>
                  <td>{project.status}</td>
                  <td className="actions-cell">
                    <Button onClick={() => handleViewDetails(project._id)} variant="ghost" title="View Details">
                      <Eye size={20} />
                    </Button>
                    <Button onClick={() => handleEdit(project)} variant="ghost" title="Edit">
                      <Edit size={20} />
                    </Button>
                    <Button onClick={() => handleDeleteConfirm(project)} variant="danger-ghost" title="Delete">
                      <Trash2 size={20} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectManagementPage;