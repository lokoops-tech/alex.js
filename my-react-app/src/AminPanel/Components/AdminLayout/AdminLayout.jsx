import React from 'react';
import { NavLink, Outlet } from 'react-router-dom'; // For navigation and nested routes
import { LayoutDashboard, FileText, Users, Image, MessageSquare, LogOut } from 'lucide-react'; // Lucide icons for admin sidebar
import './AdminLayout.css';

const AdminLayout = () => {
  // Mock logout function for now. This will later interact with your auth context.
  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.removeItem('adminToken'); // Clear mock token
    window.location.href = '/admin/login'; // Redirect to login page
  };

  return (
    <div className="admin-dashboard-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 className="admin-logo">[Admin Panel]</h2> {/* Customize your admin logo/title */}
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li>
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <LayoutDashboard size={20} /> Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/quotes"
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <FileText size={20} /> Quotes
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/projects" // Placeholder for Projects Management
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <Image size={20} /> Projects
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/reviews" // Placeholder for Reviews Management
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <MessageSquare size={20} /> Reviews
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/users" // Placeholder for User Management (if applicable)
                className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              >
                <Users size={20} /> Users
              </NavLink>
            </li>
            {/* Add more admin links here */}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="admin-main-content">
        <header className="admin-header">
          <h1 className="admin-page-title">Welcome to the Admin Panel</h1> {/* Dynamic title will be added later */}
          {/* Add user info / quick actions here */}
        </header>
        <div className="admin-content-area">
          <Outlet /> {/* Renders the child route components */}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;