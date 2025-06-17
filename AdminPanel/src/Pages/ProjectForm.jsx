import React, { useState, useEffect } from 'react';
import { PlusCircle, XCircle, Upload, Image as ImageIcon } from 'lucide-react';
import Button from './Button';
import './ProjectForm.css';
import { createProject, updateProject } from '../API/ProjectApis';
import { useNavigate } from 'react-router-dom';

const ProjectForm = ({ project = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'residential',
    client: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'ongoing',
    thumbnail: null,
    galleryImages: [],
    existingThumbnail: null,
    existingGalleryImages: []
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        category: project.category || 'residential',
        client: project.client || '',
        location: project.location || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        status: project.status || 'ongoing',
        thumbnail: null,
        galleryImages: [],
        existingThumbnail: project.thumbnail || null,
        existingGalleryImages: project.galleryImages || []
      });
      
      if (project.thumbnail) {
        setThumbnailPreview(project.thumbnail);
      }
      if (project.galleryImages && project.galleryImages.length > 0) {
        setGalleryPreviews(project.galleryImages);
      }
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        thumbnail: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImageChange = (e, index) => {
    const files = e.target.files;
    if (files && files[0]) {
      const newGalleryImages = [...formData.galleryImages];
      newGalleryImages[index] = files[0];
      
      setFormData((prevData) => ({
        ...prevData,
        galleryImages: newGalleryImages
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...galleryPreviews];
        newPreviews[index] = reader.result;
        setGalleryPreviews(newPreviews);
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const addGalleryImageField = () => {
    setGalleryPreviews([...galleryPreviews, null]);
  };

  const removeGalleryImageField = (index) => {
    const newPreviews = [...galleryPreviews];
    newPreviews.splice(index, 1);
    setGalleryPreviews(newPreviews);

    const newImages = [...formData.galleryImages];
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      galleryImages: newImages
    }));

    if (formData.existingGalleryImages[index]) {
      setFormData(prev => ({
        ...prev,
        existingGalleryImages: prev.existingGalleryImages.filter((_, i) => i !== index)
      }));
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Prepare form data to send
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('client', formData.client);
      data.append('location', formData.location);
      data.append('startDate', formData.startDate);
      if (formData.endDate) data.append('endDate', formData.endDate);
      data.append('status', formData.status);
      
      if (formData.thumbnail) {
        data.append('thumbnail', formData.thumbnail);
      }
      
      formData.galleryImages.forEach((image) => {
        if (image) {
          data.append('galleryImages', image);
        }
      });

      // Make API call
      const response = project 
        ? await updateProject(project._id, data)
        : await createProject(data);

      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate('/projects'); // Default redirect if no onSuccess provided
      }
    } catch (err) {
      setError(err.message || 'Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="project-form-container">
      <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
      <form onSubmit={handleSubmit} className="project-form" encType="multipart/form-data">
        <div className="form-group">
          <label htmlFor="title">Project Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="renovation">Renovation</option>
            <option value="planning">Planning</option>
            <option value="construction">Construction</option>
            <option value="interior">Interior Design</option>
            <option value="landscaping">Landscaping</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="client">Client:</label>
          <input
            type="text"
            id="client"
            name="client"
            value={formData.client}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="planned">Planned</option>
            <option value="on hold">On Hold</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail Image:</label>
          <div className="file-upload-wrapper">
            <label className="file-upload-label">
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                onChange={handleThumbnailChange}
                accept="image/*"
                className="file-upload-input"
              />
              <span className="file-upload-button">
                <Upload size={16} /> Choose File
              </span>
              {thumbnailPreview || formData.existingThumbnail ? (
                <span className="file-name">
                  {formData.thumbnail ? formData.thumbnail.name : 'Current image'}
                </span>
              ) : 'No file chosen'}
            </label>
          </div>
          {(thumbnailPreview || formData.existingThumbnail) && (
            <div className="image-preview">
              <img 
                src={thumbnailPreview || formData.existingThumbnail} 
                alt="Thumbnail preview" 
              />
            </div>
          )}
        </div>

        <div className="form-group gallery-section">
          <label>Project Gallery Images:</label>
          {galleryPreviews.map((preview, index) => (
            <div key={index} className="gallery-image-input">
              <div className="file-upload-wrapper">
                <label className="file-upload-label">
                  <input
                    type="file"
                    onChange={(e) => handleGalleryImageChange(e, index)}
                    accept="image/*"
                    className="file-upload-input"
                  />
                  <span className="file-upload-button">
                    <ImageIcon size={16} /> Choose Image
                  </span>
                  {preview || formData.existingGalleryImages[index] ? (
                    <span className="file-name">
                      {formData.galleryImages[index] ? 
                        formData.galleryImages[index].name : 'Current image'}
                    </span>
                  ) : 'No file chosen'}
                </label>
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => removeGalleryImageField(index)}
                  title="Remove image"
                >
                  <XCircle size={20} />
                </button>
              </div>
              {(preview || formData.existingGalleryImages[index]) && (
                <div className="image-preview">
                  <img 
                    src={preview || formData.existingGalleryImages[index]} 
                    alt={`Gallery preview ${index + 1}`} 
                  />
                </div>
              )}
            </div>
          ))}
          <Button 
            type="button" 
            onClick={addGalleryImageField} 
            variant="secondary" 
            className="add-image-btn"
          >
            <PlusCircle size={20} /> Add Another Image
          </Button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;