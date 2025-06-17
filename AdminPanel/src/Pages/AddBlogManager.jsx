import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, User, MapPin } from 'lucide-react';
import './BlogManager.css';

const API_BASE_URL = 'http://localhost:5000/blog'; // Adjust based on your backend URL
const UPLOADS_BASE_URL = 'http://localhost:5000/uploads'; // For displaying images

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    images: [],
    existingImages: [], // Separate existing images from new uploads
    projectType: 'other',
    location: '',
    status: 'planning'
  });

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/allblog`);
      if (!response.ok) {
        throw new Error('Failed to fetch blogs');
      }
      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      author: '',
      images: [],
      existingImages: [],
      projectType: 'other',
      location: '',
      status: 'planning'
    });
    setUploadProgress(0);
  };

  const openModal = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        author: blog.author,
        images: [], // New images to upload
        existingImages: blog.images || [], // Existing images from server
        projectType: blog.projectType || 'other',
        location: blog.location || '',
        status: blog.status || 'planning'
      });
      setIsEditing(true);
    } else {
      setCurrentBlog(null);
      resetForm();
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentBlog(null);
    resetForm();
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateImageFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.name}. Only JPEG, JPG, PNG, and GIF files are allowed.`);
    }

    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.name}. Maximum size is 5MB.`);
    }

    return true;
  };

  const handleImageAdd = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/gif';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      
      try {
        // Validate each file
        files.forEach(file => validateImageFile(file));
        
        if (files.length > 0) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
          }));
        }
      } catch (error) {
        setError(error.message);
      }
    };
    
    input.click();
  };

  const handleNewImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleExistingImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      existingImages: prev.existingImages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('projectType', formData.projectType);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('status', formData.status);
      
      // Append new images with the key 'images' (matching multer field name)
      formData.images.forEach((image) => {
        if (image instanceof File) {
          formDataToSend.append('images', image);
        }
      });

      // Send existing images as JSON string if editing
      if (isEditing && formData.existingImages.length > 0) {
        formDataToSend.append('existingImages', JSON.stringify(formData.existingImages));
      }

      let response;
      if (isEditing && currentBlog) {
        // Update existing blog
        response = await fetch(`${API_BASE_URL}/${currentBlog._id}`, {
          method: 'PATCH',
          body: formDataToSend,
        });
      } else {
        // Create new blog
        response = await fetch(`${API_BASE_URL}/newBlog`, {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      
      // Refresh blogs list
      await fetchBlogs();
      closeModal();
      
      // Show success message
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      setError(error.message);
      console.error('Error saving blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/${blogId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete blog');
        }

        fetchBlogs();
      } catch (err) {
        setError(err.message);
        console.error('Error deleting blog:', err);
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
    const matchesType = filterType === 'all' || blog.projectType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getProjectTypeIcon = (type) => {
    switch (type) {
      case 'residential': return '🏠';
      case 'commercial': return '🏢';
      case 'infrastructure': return '🛣️';
      case 'renovation': return '🔨';
      default: return '🏗️';
    }
  };

  const getImageUrl = (imagePath) => {
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // If it's a relative path, construct full URL
    return `${UPLOADS_BASE_URL}/${imagePath}`;
  };

  const renderImagePreview = (image, isNew = false) => {
    if (isNew && image instanceof File) {
      return URL.createObjectURL(image);
    }
    return getImageUrl(image);
  };

  return (
    <div className="blog-manager">
      <div className="header">
        <h1 className="title">Construction Blog Manager</h1>
        <p className="subtitle">Manage your construction project blogs</p>
      </div>

      {error && (
        <div className="error-message">
          Error: {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {loading && !isModalOpen && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      <div className="controls">
        <div className="controls-top">
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={20} />
            Add New Blog
          </button>
          
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>

          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="renovation">Renovation</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {loading && blogs.length === 0 ? (
        <div className="loading-placeholder">
          <p>Loading blogs...</p>
        </div>
      ) : (
        <div className="blog-grid">
          {filteredBlogs.map(blog => (
            <div key={blog._id} className="blog-card">
              <div className="card-header">
                <div className="card-title">
                  <span className="project-icon">
                    {getProjectTypeIcon(blog.projectType)}
                  </span>
                  <h3>{blog.title}</h3>
                </div>
                <div className="card-actions">
                  <button 
                    className="icon-btn edit-btn" 
                    onClick={() => openModal(blog)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className="icon-btn delete-btn" 
                    onClick={() => handleDelete(blog._id)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="card-meta">
                <span className="meta-item">
                  <User size={14} />
                  {blog.author}
                </span>
                <span className="meta-item">
                  <Calendar size={14} />
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                {blog.views && (
                  <span className="meta-item">
                    <Eye size={14} />
                    {blog.views} views
                  </span>
                )}
              </div>

              {blog.location && (
                <div className="location">
                  <MapPin size={14} />
                  {blog.location}
                </div>
              )}

              <div className="card-content">
                <p>{blog.content.substring(0, 150)}...</p>
              </div>

              {blog.images && blog.images.length > 0 && (
                <div className="card-images-preview">
                  {blog.images.slice(0, 3).map((image, index) => (
                    <div key={index} className="image-thumbnail">
                      <img 
                        src={getImageUrl(image)} 
                        alt={`Preview ${index + 1}`}
                        onError={(e) => {
                          console.error('Image load error:', image);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                  {blog.images.length > 3 && (
                    <div className="image-more">+{blog.images.length - 3} more</div>
                  )}
                </div>
              )}

              <div className="card-footer">
                <span className={`status-badge status-${blog.status}`}>
                  {blog.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="project-type">
                  {blog.projectType.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredBlogs.length === 0 && (
        <div className="empty-state">
          <h3>No blogs found</h3>
          <p>Try adjusting your search or filters, or create a new blog post.</p>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isEditing ? 'Edit Blog' : 'Create New Blog'}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span>Uploading... {uploadProgress}%</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Type</label>
                  <select
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="renovation">Renovation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="planning">Planning</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <div className="images-header">
                  <label className="form-label">Images</label>
                  <button 
                    type="button" 
                    onClick={handleImageAdd}
                    className="btn btn-secondary"
                  >
                    Add Image
                  </button>
                </div>
                
                {/* Display existing images when editing */}
                {isEditing && formData.existingImages.length > 0 && (
                  <div className="images-section">
                    <h4>Current Images:</h4>
                    <div className="images-list">
                      {formData.existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="image-item">
                          <img 
                            src={getImageUrl(image)} 
                            alt={`Existing ${index + 1}`} 
                            className="image-preview"
                            onError={(e) => {
                              console.error('Image load error:', image);
                              e.target.style.display = 'none';
                            }}
                          />
                          <span>{image.split('/').pop()}</span>
                          <button 
                            type="button"
                            onClick={() => handleExistingImageRemove(index)}
                            className="remove-image-btn"
                            title="Remove existing image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display new images to upload */}
                {formData.images.length > 0 && (
                  <div className="images-section">
                    <h4>New Images to Upload:</h4>
                    <div className="images-list">
                      {formData.images.map((image, index) => (
                        <div key={`new-${index}`} className="image-item">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`New ${index + 1}`} 
                            className="image-preview"
                          />
                          <span>{image.name}</span>
                          <button 
                            type="button"
                            onClick={() => handleNewImageRemove(index)}
                            className="remove-image-btn"
                            title="Remove new image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.images.length === 0 && formData.existingImages.length === 0 && (
                  <div className="no-images">
                    <p>No images selected. Click "Add Image" to upload images.</p>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Saving...' : (isEditing ? 'Update Blog' : 'Create Blog')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;