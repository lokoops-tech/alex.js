import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './Pages/AdminLayout';
import AdminAuth from './Pages/AdminLogin';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    
    if (token && adminData) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  // Function to handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!isAuthenticated ? (
        <AdminAuth onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Routes>
          <Route path="/admin/*" element={<AdminLayout onLogout={handleLogout} />} />
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};

export default App;