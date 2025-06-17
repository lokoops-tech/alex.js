import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../Components/Button/Button';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // --- MOCK AUTHENTICATION FOR DEMONSTRATION ---
    // In a real application, you would send username/password to your backend's login API
    // e.g., const response = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    // const data = await response.json();
    // if (data.success) { localStorage.setItem('adminToken', data.token); navigate('/admin/dashboard'); } else { setError(data.message); }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      if (username === 'admin' && password === 'password123') { // Replace with actual validation or API call
        localStorage.setItem('adminToken', 'mock_jwt_token_for_admin_session'); // Store a mock token
        navigate('/admin/dashboard'); // Redirect to admin dashboard
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An unexpected error occurred during login.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <Button type="submit" variant="primary" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;