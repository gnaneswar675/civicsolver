import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getToken, getUserRole } from '../utils/auth';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  FileText, 
  ThumbsUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import './homemain.css';

const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = getToken();
  const userRole = getUserRole();
  const [stats, setStats] = useState({
    totalReports: 1247,
    resolvedReports: 892,
    activeUsers: 3456,
    recentReports: [
      { id: 1, title: "Broken streetlight on Main St", votes: 23, status: "pending", location: "Downtown" },
      { id: 2, title: "Pothole near City Park", votes: 45, status: "reviewing", location: "Park District" },
      { id: 3, title: "Garbage collection missed", votes: 12, status: "completed", location: "North Sector" },
      { id: 4, title: "Water pipe leak near school", votes: 67, status: "pending", location: "East Ave" }
    ]
  });

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/report');
    } else {
      navigate('/register');
    }
  };

  return (
    <main className="home-main">
      <section className="hero-section">
        <div className="app-container">
          <div className="hero-wrapper">
            <div className="hero-text-content">
              <div className="hero-badge">
                <Sparkles size={14} />
                <span>Civic Technology Platform</span>
              </div>
              <h1 className="hero-title">
                Your Voice, <span className="hero-highlight">Your Community</span>
              </h1>
              <p className="hero-description">
                Report local issues, track their progress in real time, and work together with civic leaders to build a cleaner, safer neighborhood.
              </p>
              <div className="hero-action-buttons">
                <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                  <PlusCircle size={18} />
                  <span>{isLoggedIn ? 'Report an Issue' : 'Get Started'}</span>
                </button>
                <Link to="/problems" className="btn btn-secondary btn-lg">
                  <Search size={18} />
                  <span>View Problems</span>
                </Link>
              </div>
            </div>

            <div className="hero-visual-container">
              <div className="hero-card-preview">
                <div className="preview-header">
                  <div className="preview-indicator" />
                  <span className="preview-tag">Civic Categories</span>
                </div>
                <div className="category-chips-grid">
                  <span className="cat-chip">🏢 Municipal Infrastructure</span>
                  <span className="cat-chip">🌳 Environment & Waste</span>
                  <span className="cat-chip">🚦 Roads & Traffic</span>
                  <span className="cat-chip">💡 Streetlights & Utilities</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-metrics-grid">
            <div className="stat-card-modern">
              <div className="stat-icon-wrapper primary">
                <FileText size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-number-value">{stats.totalReports.toLocaleString()}</span>
                <span className="stat-label-title">Total Reports</span>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper success">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-number-value">{stats.resolvedReports.toLocaleString()}</span>
                <span className="stat-label-title">Issues Resolved</span>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper warning">
                <ShieldCheck size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-number-value">{stats.activeUsers.toLocaleString()}</span>
                <span className="stat-label-title">Active Citizens</span>
              </div>
            </div>

            <div className="stat-card-modern">
              <div className="stat-icon-wrapper info">
                <ThumbsUp size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-number-value">
                  {Math.round((stats.resolvedReports / stats.totalReports) * 100)}%
                </span>
                <span className="stat-label-title">Resolution Rate</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Reports */}
      <section className="recent-reports-section">
        <div className="app-container">
          <div className="section-title-block">
            <h2 className="section-heading">Recent Community Reports</h2>
            <p className="section-subheading">Latest issues submitted by your fellow residents</p>
          </div>

          <div className="problems-grid">
            {stats.recentReports.map(report => (
              <div key={report.id} className="problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">{report.title}</h3>
                  <StatusBadge status={report.status} />
                </div>
                <p className="problem-description">Reported in {report.location}. Upvoted by local citizens to prioritize repair work.</p>
                <div className="problem-footer">
                  <div className="problem-actions">
                    <div className="votes-display">
                      <ThumbsUp size={16} />
                      <span>{report.votes} votes</span>
                    </div>
                    <Link to="/problems" className="btn btn-outline btn-sm">
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
