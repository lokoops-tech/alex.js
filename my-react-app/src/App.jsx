import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';// Make sure this path is correct for your global styles

// Import Public Website Components/Pages (adjusting paths based on your provided App.jsx)
import Header from "./Components/Header/Header";
import HeroSection from "./Components/Hero/HeroSection";
import ImpactMessage from "./Components/ImpactMessage/ImpactMessage";
import AboutPage from "./Components/AboutPage/AboutPage";
import ServicesPage from "./Components/ServicePage/ServicesPage";
import ProjectsPage from "./Components/ProjectPage/ProjectPage";
import ContactPage from "./Components/ContactPage/ContactPage";
import TestimonialsPage from "./Components/TestimonialsPage/TestimonialsPage";
import Footer from "./Components/Footer/Footer";

// Import Admin Panel Components/Pages
import AdminLayout from "./AminPanel/Components/AdminLayout/AdminLayout";
import LoginPage from "./AminPanel/Pages/LoginPage";
import QuoteDashboard from "./AminPanel/Pages/QuoteDashboard";// We will create this next for managing quotes
// Placeholder for other admin pages you'll create later
// import AdminDashboard from './admin/pages/AdminDashboard';
// import ProjectManagementPage from './admin/pages/ProjectManagementPage';
// import ReviewManagementPage from './admin/pages/ReviewManagementPage';

// A simple component to check if the user is authenticated for admin routes
// In a real application, this would involve checking a secure token (e.g., JWT)
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken'); // Checks for the mock token from LoginPage
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Website Routes */}
          {/* Route for the Homepage */}
          <Route
            path="/"
            element={
              <>
                <Header />
                <main>
                  <HeroSection />
                  <ImpactMessage />
                  {/* You can add previews of other sections here if needed for your homepage */}
                  <section style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: 'white' }}>
                    <h2>Your Main Website Content Goes Here!</h2>
                    <p>This is where your integrated homepage elements (like featured services, recent projects, etc.) would appear.</p>
                    <p>Use the navigation links in the header or footer to visit other pages.</p>
                  </section>
                </main>
                <Footer />
              </>
            }
          />
          {/* Routes for other main website pages */}
          <Route path="/about" element={<><Header /><main><AboutPage /></main><Footer /></>} />
          <Route path="/services" element={<><Header /><main><ServicesPage /></main><Footer /></>} />
          <Route path="/projects" element={<><Header /><main><ProjectsPage /></main><Footer /></>} />
          <Route path="/contact" element={<><Header /><main><ContactPage /></main><Footer /></>} />
          <Route path="/testimonials" element={<><Header /><main><TestimonialsPage /></main><Footer /></>} />

          {/* Admin Panel Routes */}
          {/* Login page for the admin panel */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected routes for the admin panel, wrapped by PrivateRoute */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            {/* Nested routes will render within the <Outlet /> in AdminLayout */}
            <Route index element={<QuoteDashboard />} /> {/* Default route for /admin, shows Quotes */}
            <Route path="dashboard" element={<QuoteDashboard />} /> {/* You can change this to a proper dashboard later */}
            <Route path="quotes" element={<QuoteDashboard />} /> {/* Route for Quotes management */}
            {/* Add more admin routes here as you build them, e.g.: */}
            {/* <Route path="projects" element={<ProjectManagementPage />} /> */}
            {/* <Route path="reviews" element={<ReviewManagementPage />} /> */}
          </Route>

          {/* Catch-all route for 404 Not Found pages */}
          <Route path="*" element={
            <>
              <Header />
              <main style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you are looking for does not exist.</p>
                <a href="/" style={{ color: 'var(--color-primary-orange)' }}>Go to Homepage</a>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;