import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Calendar, User, MapPin } from 'lucide-react';
import './BlogManager.css';

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    images: [],
    projectType: 'other',
    location: '',
    status: 'planning'
  });

  // Mock data for demonstration
  useEffect(() => {
    const mockBlogs = [
      {
        _id: '1',
        title: 'Modern Office Complex Construction',
        content: 'Starting construction of a 10-story modern office complex in downtown. The project includes sustainable building practices and cutting-edge technology integration.',
        author: 'John Smith',
        projectType: 'commercial',
        location: 'Downtown District',
        status: 'in-progress',
        views: 245,
        createdAt: new Date('2024-06-01'),
        images: []
      },
      {
        _id: '2', 
        title: 'Residential Villa Development',
        content: 'Luxury villa project featuring 5 bedrooms, modern amenities, and eco-friendly design elements. Expected completion in 8 months.',
        author: 'Sarah Johnson',
        projectType: 'residential',
        location: 'Hillside Heights',
        status: 'planning',
        views: 123,
        createdAt: new Date('2024-05-15'),
        images: []
      }
    ];
    setBlogs(mockBlogs);
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      author: '',
      images: [],
      projectType: 'other',
      location: '',
      status: 'planning'
    });
  };

  const openModal = (blog = null) => {
    if (blog) {
      setCurrentBlog(blog);
      setFormData({
        title: blog.title,
        content: blog.content,
        author: blog.author,
        images: blog.images || [],
        projectType: blog.projectType,
        location: blog.location,
        status: blog.status
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

  const handleImageAdd = () => {
    const imageUrl = prompt('Enter image URL:');
    if (imageUrl) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl]
      }));
    }
  };

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && currentBlog) {
        // Update existing blog
        const updatedBlog = {
          ...currentBlog,
          ...formData,
          updatedAt: new Date()
        };
        setBlogs(prev => prev.map(blog => 
          blog._id === currentBlog._id ? updatedBlog : blog
        ));
      } else {
        // Create new blog
        const newBlog = {
          _id: Date.now().toString(),
          ...formData,
          views: 0,
          createdAt: new Date(),
          comments: []
        };
        setBlogs(prev => [newBlog, ...prev]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      setBlogs(prev => prev.filter(blog => blog._id !== blogId));
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

  return (
    <div className="blog-manager">
      <div className="header">
        <h1 className="title">Construction Blog Manager</h1>
        <p className="subtitle">Manage your construction project blogs</p>
      </div>

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
              <span className="meta-item">
                <Eye size={14} />
                {blog.views} views
              </span>
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

      {filteredBlogs.length === 0 && (
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
                {formData.images.length > 0 && (
                  <div className="images-list">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-item">
                        <span>{image}</span>
                        <button 
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="remove-image-btn"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="btn btn-secondary"
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