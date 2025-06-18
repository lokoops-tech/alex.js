import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import profileIcon from '../assets/avatar1.png';
import BlogManager from './AddBlogManager';
import ProjectManagementPage from './ProjectManagement';
import ProjectForm from './ProjectForm';
import EmployeeAdminSystem from './AdminSystem';
import './AdminLayout.css';

// Import your other components here
// import AddProject from './AddProject';
// import ManageBlogs from './ManageBlogs';
// import AddUser from './AddUser';
// import ManageUsers from './ManageUsers';
// import Settings from './Settings';
// import Analytics from './Analytics';

const AdminLayout = ({ children, onLogout }) => {
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 'add-project', label: 'Add Project', icon: '🚀', path: '/admin/addproject' },
    { id: 'manage-projects', label: 'Manage Projects', icon: '📁', path: '/admin/manageprojects' },
    { id: 'add-blog', label: 'Add Blog', icon: '✍️', path: '/admin/addblog' },
    { id: 'manage-blogs', label: 'Manage Inventory', icon: '📝', path: '/admin/manageblogs' },
    { id: 'add-user', label: 'Add User', icon: '👤', path: '/admin/adduser' },
    { id: 'manage-users', label: 'Manage Employees', icon: '👥', path: '/admin/manageusers' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' },
    { id: 'analytics', label: 'Analytics', icon: '📈', path: '/admin/analytics' }
  ];

  // Update active menu item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const currentMenuItem = menuItems.find(item => item.path === currentPath);
    if (currentMenuItem) {
      setActiveMenuItem(currentMenuItem.id);
    }
  }, [location.pathname]);

  // Navigate to dashboard by default when component mounts
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate, location.pathname]);

  const handleMenuClick = (menuId) => {
    const menuItem = menuItems.find(item => item.id === menuId);
    if (menuItem) {
      setActiveMenuItem(menuId);
      navigate(menuItem.path);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      onLogout();
    }
  };

  // Dashboard component
  const Dashboard = () => (
    <div className="default-content">
      <div className="welcome-card">
        <h2>Welcome to Admin Dashboard</h2>
        <p>Hello {adminData.username || adminData.email}! Select an option from the sidebar to get started.</p>
        <div className="quick-actions">
          <button 
            className="quick-action-btn"
            onClick={() => handleMenuClick('add-project')}
          >
            <span>🚀</span>
            Add New Project
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleMenuClick('add-blog')}
          >
            <span>✍️</span>
            Create Blog Post
          </button>
          <button 
            className="quick-action-btn"
            onClick={() => handleMenuClick('analytics')}
          >
            <span>📈</span>
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );

  // Placeholder components for routes that don't have components yet
  const PlaceholderComponent = ({ title }) => (
    <div className="placeholder-content">
      <h2>{title}</h2>
      <p>This page is under development.</p>
    </div>
  );

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            {!sidebarCollapsed && <h2>Admin Panel</h2>}
            <button className="toggle-btn" onClick={toggleSidebar}>
              {sidebarCollapsed ? '▶️' : '◀️'}
            </button>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-link ${activeMenuItem === item.id ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item.id)}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`admin-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <h1 className="page-title">
              {menuItems.find(item => item.id === activeMenuItem)?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="header-right">
            <div className="header-actions">
              <button className="notification-btn">🔔</button>
              <div className="user-profile">
                <img src={profileIcon} alt="Profile" className="profile-avatar" />
                <span className="profile-name">{adminData.username || adminData.email || 'Admin User'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area with Router */}
        <div className="admin-content">
          <div className="content-wrapper">
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="addproject" element={<ProjectForm title="Add Project" />} />
              <Route path="manageprojects" element={<ProjectManagementPage />} />
              <Route path="addblog" element={<BlogManager />} />
              <Route path="manageblogs" element={<PlaceholderComponent title="Manage Inventory" />} />
              <Route path="adduser" element={<PlaceholderComponent title="Add User" />} />
              <Route path="manageusers" element={<EmployeeAdminSystem title="Manage Employees" />} />
              <Route path="settings" element={<PlaceholderComponent title="Settings" />} />
              <Route path="analytics" element={<PlaceholderComponent title="Analytics" />} />
              {/* Default route - redirect to dashboard */}
              <Route index element={<Dashboard />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;