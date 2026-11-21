import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import config from '../config/config';
import { 
  Building2, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import './register.css';

const Register = () => {
  const [form, setForm] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '',
    role: 'citizen' 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleSelect = (selectedRole) => {
    setForm({ ...form, role: selectedRole });
    if (error) setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!form.username.trim()) {
      setError('Please choose a username.');
      return;
    }

    if (form.password.length < 4) {
      setError('Password should be at least 4 characters.');
      return;
    }

    if (form.confirmPassword && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role: form.role
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Username may already be in use.');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { 
          state: { registered: true, message: 'Account created! Please sign in.' } 
        });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      console.error('Registration failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper register-card-wrapper">
        {/* Header */}
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
          <h1 className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">
            Join thousands of active citizens and leaders making local communities cleaner and safer.
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="auth-alert-box error" role="alert">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert-box success" role="alert">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>Account registered successfully! Redirecting to login...</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="auth-form" noValidate>
          {/* Role Selector Cards */}
          <div className="form-group">
            <label className="form-label">I am joining as:</label>
            <div className="role-selector-grid">
              <button
                type="button"
                className={`role-choice-card ${form.role === 'citizen' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('citizen')}
              >
                <div className="role-choice-header">
                  <div className="role-icon-circle citizen">
                    <User size={18} />
                  </div>
                  <div className="role-check-indicator">
                    {form.role === 'citizen' && <div className="role-dot" />}
                  </div>
                </div>
                <div className="role-choice-body">
                  <span className="role-title">Citizen Member</span>
                  <span className="role-desc">Report problems and upvote community repairs</span>
                </div>
              </button>

              <button
                type="button"
                className={`role-choice-card ${form.role === 'head' ? 'selected' : ''}`}
                onClick={() => handleRoleSelect('head')}
              >
                <div className="role-choice-header">
                  <div className="role-icon-circle head">
                    <ShieldCheck size={18} />
                  </div>
                  <div className="role-check-indicator">
                    {form.role === 'head' && <div className="role-dot" />}
                  </div>
                </div>
                <div className="role-choice-body">
                  <span className="role-title">Municipal Head</span>
                  <span className="role-desc">Review and manage official issue resolutions</span>
                </div>
              </button>
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                id="reg-username"
                name="username"
                type="text"
                placeholder="Choose a unique username"
                value={form.username}
                onChange={handleChange}
                required
                disabled={loading || success}
                className="form-input with-left-icon"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password (min. 4 chars)"
                value={form.password}
                onChange={handleChange}
                required
                disabled={loading || success}
                className="form-input with-left-icon with-right-icon"
                autoComplete="new-password"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg auth-submit-btn"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Register with CivicSolver</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="auth-footer-nav">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
