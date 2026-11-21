import React, { useState, useRef } from 'react';
import { createProblem } from '../api/problems';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  FileText, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import './reportproblem.css';

const ReportProblem = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const processFile = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size should be less than 5MB.');
      return;
    }

    setForm(prev => ({ ...prev, image: file }));
    setError('');

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError('Please enter a descriptive problem title.');
      return;
    }

    if (!form.description.trim()) {
      setError('Please describe the issue in detail.');
      return;
    }

    if (!form.location.trim()) {
      setError('Please provide the street address or location landmark.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('location', form.location.trim());
    formData.append('date', form.date);
    if (form.image) {
      formData.append('image', form.image);
    }

    try {
      await createProblem(formData);
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setError('Error submitting problem report. Please verify your connection and try again.');
      console.error('Error reporting problem:', err);
    }
  };

  return (
    <div className="report-problem-page">
      <div className="app-container">
        {/* Navigation Breadcrumb */}
        <div className="report-nav-header">
          <Link to="/dashboard" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        <div className="report-layout-grid">
          {/* Main Form Column */}
          <div className="report-form-card">
            <div className="report-card-header">
              <div className="report-badge">
                <Sparkles size={14} />
                <span>Citizen Civic Submission</span>
              </div>
              <h1 className="report-title">Report a Community Problem</h1>
              <p className="report-subtitle">
                Provide accurate details and photos to help local authorities inspect, prioritize, and dispatch repair crews.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="auth-alert-box error" role="alert">
                <AlertCircle size={18} className="alert-icon" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Popup */}
            {showSuccess && (
              <div className="success-banner" role="status">
                <CheckCircle2 size={24} className="success-icon" />
                <div>
                  <h4 className="success-title">Problem Reported Successfully!</h4>
                  <p className="success-desc">Your report has been submitted to the community board. Redirecting...</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="problem-submit-form" noValidate>
              {/* Problem Title */}
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Problem Title <span className="required-star">*</span>
                </label>
                <div className="input-with-icon">
                  <FileText size={18} className="input-icon" />
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. Broken streetlight on corner of 5th Ave"
                    value={form.title}
                    onChange={handleChange}
                    required
                    disabled={loading || showSuccess}
                    className="form-input with-left-icon"
                  />
                </div>
              </div>

              {/* Detailed Description */}
              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Detailed Description <span className="required-star">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the issue, its severity, and safety impact on pedestrians or drivers..."
                  value={form.description}
                  onChange={handleChange}
                  required
                  disabled={loading || showSuccess}
                  className="form-textarea"
                  rows={4}
                />
              </div>

              {/* Location & Date Two-column row */}
              <div className="form-row-two-col">
                <div className="form-group">
                  <label className="form-label" htmlFor="location">
                    Location / Landmark <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <MapPin size={18} className="input-icon" />
                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="e.g. Sector 4, near Central Park"
                      value={form.location}
                      onChange={handleChange}
                      required
                      disabled={loading || showSuccess}
                      className="form-input with-left-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="date">
                    Incident / Observed Date <span className="required-star">*</span>
                  </label>
                  <div className="input-with-icon">
                    <Calendar size={18} className="input-icon" />
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      disabled={loading || showSuccess}
                      className="form-input with-left-icon"
                    />
                  </div>
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div className="form-group">
                <label className="form-label">
                  Photo Evidence <span className="optional-tag">(Recommended)</span>
                </label>

                {!imagePreview ? (
                  <div 
                    className={`dropzone-box ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={loading || showSuccess}
                      style={{ display: 'none' }}
                    />
                    <div className="dropzone-icon-circle">
                      <UploadCloud size={28} />
                    </div>
                    <p className="dropzone-instruction">
                      <strong>Click to upload</strong> or drag and drop a photo
                    </p>
                    <p className="dropzone-hint">
                      PNG, JPG, or WebP up to 5MB
                    </p>
                  </div>
                ) : (
                  <div className="image-preview-card">
                    <div className="preview-thumb-box">
                      <img src={imagePreview} alt="Preview" className="preview-img" />
                    </div>
                    <div className="preview-file-details">
                      <span className="file-name">{form.image?.name || 'Selected image'}</span>
                      <span className="file-size">
                        {form.image ? `${Math.round(form.image.size / 1024)} KB` : ''}
                      </span>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="btn-remove-preview"
                      title="Remove image"
                      disabled={loading || showSuccess}
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg submit-report-btn"
                disabled={loading || showSuccess}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    <span>Submitting Problem Report...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Submit Problem to Community</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Sidebar Guidelines Column */}
          <aside className="report-sidebar">
            <div className="guidance-card">
              <div className="guidance-header">
                <Info size={18} className="guidance-icon" />
                <h3 className="guidance-title">Reporting Guidelines</h3>
              </div>
              <ul className="guidance-list">
                <li>
                  <strong>Be Specific:</strong> Name the nearest cross-street or landmark to help inspection crews pinpoint the location.
                </li>
                <li>
                  <strong>Include Photos:</strong> Clear daylight photos of potholes, fallen branches, or damaged infrastructure receive 3x faster municipal response.
                </li>
                <li>
                  <strong>Safety Hazards:</strong> If an issue poses an immediate life-safety emergency, please contact 911 or local emergency services directly.
                </li>
                <li>
                  <strong>Community Engagement:</strong> Once submitted, neighbors can upvote your issue to prioritize it on the municipal schedule.
                </li>
              </ul>
            </div>

            <div className="municipal-trust-card">
              <Building2 size={24} className="trust-building-icon" />
              <h4>Municipal Review Process</h4>
              <p>Reports are routed to village and city heads for triage within 24-48 business hours.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ReportProblem;
