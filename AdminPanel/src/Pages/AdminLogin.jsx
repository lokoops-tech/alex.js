import React, { useState } from 'react';
import './AdminLogin.css'; // Import the CSS file we created earlier

const API_BASE_URL = 'http://localhost:5000'; // Adjust this to your API base URL

const AdminAuth = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear message when user starts typing
        if (message) {
            setMessage('');
        }
    };

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setMessage('Please fill in all required fields');
            setMessageType('error');
            return false;
        }
        
        if (!isLogin && !formData.username) {
            setMessage('Username is required for signup');
            setMessageType('error');
            return false;
        }
        
        if (formData.password.length < 6) {
            setMessage('Password must be at least 6 characters long');
            setMessageType('error');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setMessage('');

        try {
            const endpoint = isLogin ? `${API_BASE_URL}/admin/login` : `${API_BASE_URL}/admin/signup`;
            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : formData;

            console.log('Sending request to:', endpoint);
            console.log('Payload:', payload);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('Response:', data);

            if (response.ok) {
                setMessage(data.message || (isLogin ? 'Login successful!' : 'Admin account created successfully!'));
                setMessageType('success');
                
                if (isLogin && data.token) {
                    // Store token in localStorage
                    localStorage.setItem('adminToken', data.token);
                    localStorage.setItem('adminData', JSON.stringify(data.admin));
                    console.log('Admin logged in:', data.admin);
                    
                    // Call the success callback to redirect to dashboard
                    setTimeout(() => {
                        onLoginSuccess();
                    }, 1000); // Small delay to show success message
                } else if (!isLogin) {
                    // For signup, switch to login mode
                    setTimeout(() => {
                        setIsLogin(true);
                        setFormData({ username: '', email: '', password: '' });
                        setMessage('Account created! Please sign in.');
                        setMessageType('success');
                    }, 1500);
                }
            } else {
                setMessage(data.message || 'An error occurred');
                setMessageType('error');
            }
        } catch (error) {
            console.error('Network error:', error);
            setMessage('Network error. Please check if the server is running.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setFormData({ username: '', email: '', password: '' });
        setMessage('');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h2>{isLogin ? 'Admin Login' : 'Admin Signup'}</h2>
                    <p>{isLogin ? 'Sign in to your admin account' : 'Create a new admin account'}</p>
                </div>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="username">Username *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required={!isLogin}
                                placeholder="Enter your username"
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your password (min 6 characters)"
                            minLength="6"
                        />
                    </div>

                    <button 
                        type="submit"
                        className={`auth-button ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>
                        {isLogin ? "Don't have an admin account?" : "Already have an admin account?"}{' '}
                        <button 
                            type="button" 
                            className="toggle-button"
                            onClick={toggleMode}
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminAuth;