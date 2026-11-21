import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import config from '../config/config';
import { saveUserData, getToken } from '../utils/auth';
import { 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle 
} from 'lucide-react';
import './login.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { action, problemId } = location.state || {};

  useEffect(() => {
    const token = getToken();
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleLoginSuccess = () => {
    const returnTo = location.state?.returnTo;

    if (action === 'vote' && problemId) {
      navigate('/dashboard');
    } else if (action === 'report') {
      navigate('/report');
    } else if (returnTo) {
      navigate(returnTo);
    } else {
      navigate('/dashboard');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (response.ok && data.token) {
        saveUserData(data.token, data.role);
        setLoading(false);
        if (data.role === 'head') {
          navigate('/head/dashboard', { replace: true });
        } else {
          handleLoginSuccess();
        }
      } else {
        setLoading(false);
        setError(data.message || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setError('Unable to reach server. Please check your connection and try again.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        {/* Header Branding */}
        <div className="auth-header">
          <Link to="/" className="auth-brand" aria-label="CivicSolver">
            <div className="logo-icon-badge">
              <Building2 size={22} strokeWidth={2.4} />
            </div>
            <div className="logo-text-group">
              <span className="logo-civic">Civic</span>
              <span className="logo-solver">Solver</span>
            </div>
          </Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            {location.state?.message
              ? location.state.message
              : action === 'vote' 
                ? 'Sign in to record your community vote' 
                : action === 'report' 
                  ? 'Sign in to submit a local problem report' 
                  : 'Sign in to access your civic dashboard and track issues'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="auth-alert-box error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                id="username"
                name="username" 
                type="text"
                placeholder="Enter your username" 
                value={form.username}
                onChange={handleChange} 
                required 
                disabled={loading}
                className="form-input with-left-icon"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                id="password"
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="Enter your password" 
                value={form.password}
                onChange={handleChange} 
                required 
                disabled={loading}
                className="form-input with-left-icon with-right-icon"
                autoComplete="current-password"
              />
              <button 
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-lg auth-submit-btn" 
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In to CivicSolver</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="auth-footer-nav">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
