import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { voteProblem } from '../api/problems';
import { getToken } from '../utils/auth';
import config from '../config/config';
import StatusBadge from '../components/StatusBadge';
import {
  Building2,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Calendar,
  ThumbsUp,
  CheckCircle2,
  ShieldCheck,
  Clock,
  BellRing,
  Compass,
  FileText,
  Mail,
  Phone,
  Sparkles,
  AlertCircle,
  LogIn,
  UserPlus,
  Lock,
  X
} from 'lucide-react';
import './problemslist.css';
import '../styles/shared-image.css';

const ProblemsList = ({ showLandingPage = true }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [legalModal, setLegalModal] = useState(null);

  const isLoggedIn = !!getToken();
  const navigate = useNavigate();
  const location = useLocation();

  const problemsRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 76;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const scrollTimer = window.setTimeout(() => {
        scrollToSection(location.state.scrollTo);
      }, 150);

      return () => window.clearTimeout(scrollTimer);
    }
    return undefined;
  }, [location.state]);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.API_BASE_URL}/api/problems`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setProblems(data);
      } else {
        setProblems([]);
      }
    } catch (error) {
      console.error('Error loading problems:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      setVotingId(id);
      setProblems(prev =>
        prev.map(p => p._id === id ? { ...p, votes: (p.votes || 0) + 1 } : p)
      );
      await voteProblem(id);
    } catch (err) {
      console.error('Vote failed:', err);
      loadProblems();
    } finally {
      setVotingId(null);
    }
  };

  const handleVoteOrLogin = (problemId) => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: '/', action: 'vote', problemId } });
      return;
    }
    handleVote(problemId);
  };

  const handleReportOrLogin = () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { returnTo: '/report', action: 'report' } });
      return;
    }
    navigate('/report');
  };

  // Rule: Before authentication on landing page, display strictly ONLY 3 active issues
  const isBeforeLoginLanding = showLandingPage && !isLoggedIn;

  const activeTop3Problems = useMemo(() => {
    const active = problems
      .filter(p => ['pending', 'reviewing', 'in-progress'].includes((p.status || 'pending').toLowerCase()))
      .sort((a, b) => (b.votes || 0) - (a.votes || 0));

    if (active.length >= 3) {
      return active.slice(0, 3);
    }

    const remaining = problems
      .filter(p => !active.some(a => a._id === p._id))
      .sort((a, b) => (b.votes || 0) - (a.votes || 0));

    return [...active, ...remaining].slice(0, 3);
  }, [problems]);

  // Full filtered problems (only for authenticated dashboards)
  const filteredProblems = useMemo(() => {
    return problems
      .filter((problem) => {
        const matchesSearch =
          (problem.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (problem.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (problem.location || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' ||
          (problem.status || 'pending').toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'votes') {
          return (b.votes || 0) - (a.votes || 0);
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        return 0;
      });
  }, [problems, searchTerm, statusFilter, sortBy]);

  // Deciding which problems list to display
  const displayedProblems = isBeforeLoginLanding ? activeTop3Problems : filteredProblems;

  // Aggregate platform stats
  const stats = useMemo(() => {
    const total = problems.length;
    const resolved = problems.filter(p => ['completed', 'resolved'].includes((p.status || '').toLowerCase())).length;
    const reviewing = problems.filter(p => ['reviewing', 'in-progress'].includes((p.status || '').toLowerCase())).length;
    const totalVotes = problems.reduce((acc, p) => acc + (p.votes || 0), 0);
    return { total, resolved, reviewing, totalVotes };
  }, [problems]);

  return (
    <div className="landing-page">
      {/* 3.A HOMEPAGE HERO & SECTIONS */}
      {showLandingPage && (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-pattern-bg" />
            <div className="app-container">
              <div className="hero-wrapper">
                <div className="hero-text-content">
                  <div className="hero-badge">
                    <Sparkles size={14} className="hero-badge-icon" />
                    <span>Civic Engagement Platform</span>
                  </div>

                  <h1 className="hero-title">
                    Empowering Citizens.<br />
                    <span className="hero-highlight">Resolving Civic Issues</span> Together.
                  </h1>

                  <p className="hero-description">
                    CivicSolver connects active residents with municipal leadership to identify, prioritize, and resolve neighborhood problems faster. Report issues, upvote community concerns, and track real-time resolution.
                  </p>

                  <div className="hero-action-buttons">
                    <button
                      type="button"
                      className="btn btn-primary btn-lg"
                      onClick={handleReportOrLogin}
                    >
                      <PlusCircle size={18} />
                      <span>Report an Issue</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-lg"
                      onClick={() => scrollToSection('problems')}
                    >
                      <Search size={18} />
                      <span>Explore Active Issues</span>
                    </button>
                  </div>

                  {/* Hero Quick Trust Points */}
                  <div className="hero-trust-bar">
                    <div className="trust-item">
                      <CheckCircle2 size={16} className="trust-icon" />
                      <span>Verified Municipal Review</span>
                    </div>
                    <div className="trust-item">
                      <ShieldCheck size={16} className="trust-icon" />
                      <span>Transparent Resolution</span>
                    </div>
                  </div>
                </div>

                {/* Hero Illustration / Graphic Card */}
                <div className="hero-visual-container">
                  <div className="hero-card-preview">
                    <div className="preview-header">
                      <div className="preview-indicator" />
                      <span className="preview-tag">Live Activity</span>
                    </div>

                    <div className="preview-issue-box">
                      <div className="preview-issue-top">
                        <span className="status-pill completed">
                          <CheckCircle2 size={12} /> Resolved
                        </span>
                        <span className="preview-votes">👍 48 votes</span>
                      </div>
                      <h4 className="preview-issue-title">Streetlight repairs on Oakwood Avenue</h4>
                      <p className="preview-issue-desc">Restored electrical junction and replaced high-output LED lamps.</p>
                      <div className="preview-issue-meta">
                        <span><MapPin size={12} /> Sector 4, Metro Zone</span>
                      </div>
                    </div>

                    <div className="preview-issue-box accent">
                      <div className="preview-issue-top">
                        <span className="status-pill reviewing">
                          <Clock size={12} /> In Review
                        </span>
                        <span className="preview-votes">👍 32 votes</span>
                      </div>
                      <h4 className="preview-issue-title">Road resurfacing near Main City Park</h4>
                      <div className="preview-issue-meta">
                        <span><MapPin size={12} /> Central District</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="hero-metrics-grid">
                <div className="stat-card-modern">
                  <div className="stat-icon-wrapper primary">
                    <FileText size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number-value">{stats.total || '90+'}</span>
                    <span className="stat-label-title">Community Reports</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-wrapper success">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number-value">{stats.resolved || '54+'}</span>
                    <span className="stat-label-title">Issues Resolved</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-wrapper warning">
                    <Clock size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number-value">{stats.reviewing || '18'}</span>
                    <span className="stat-label-title">Under Active Review</span>
                  </div>
                </div>

                <div className="stat-card-modern">
                  <div className="stat-icon-wrapper info">
                    <ThumbsUp size={24} />
                  </div>
                  <div className="stat-details">
                    <span className="stat-number-value">{stats.totalVotes || '1,200+'}</span>
                    <span className="stat-label-title">Total Citizen Votes</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features Section */}
          <section id="features" ref={featuresRef} className="features-section">
            <div className="app-container">
              <div className="section-title-block">
                <span className="section-eyebrow">Platform Capabilities</span>
                <h2 className="section-heading">Designed for Responsive Civic Governance</h2>
                <p className="section-subheading">
                  Everything citizens and local officials need to make cities cleaner, safer, and better organized.
                </p>
              </div>

              <div className="features-grid-cards">
                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <PlusCircle size={24} />
                  </div>
                  <h3 className="feature-title">Rapid Problem Reporting</h3>
                  <p className="feature-desc">
                    Citizens can quickly document potholes, broken lighting, trash dumps, and water leaks with photo evidence and precise locations.
                  </p>
                </div>

                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <ThumbsUp size={24} />
                  </div>
                  <h3 className="feature-title">Community Upvoting</h3>
                  <p className="feature-desc">
                    Democratic issue ranking allows residents to upvote pressing neighborhood problems so authorities know what to prioritize.
                  </p>
                </div>

                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <CheckCircle2 size={24} />
                  </div>
                  <h3 className="feature-title">Real-Time Status Tracking</h3>
                  <p className="feature-desc">
                    Transparent stages (Pending, In Review, Completed, Rejected) keep the public informed at every step of resolution.
                  </p>
                </div>

                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="feature-title">Head Administrator Portal</h3>
                  <p className="feature-desc">
                    Municipal heads and department leaders receive an administrative control board with sorting, filtering, and status management.
                  </p>
                </div>

                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <Compass size={24} />
                  </div>
                  <h3 className="feature-title">Location-Based Grouping</h3>
                  <p className="feature-desc">
                    Pinpoint neighborhood hotspots, track recurring issues across municipal zones, and plan resource deployment efficiently.
                  </p>
                </div>

                <div className="feature-modern-card">
                  <div className="feature-icon-box">
                    <BellRing size={24} />
                  </div>
                  <h3 className="feature-title">Transparent Accountability</h3>
                  <p className="feature-desc">
                    Empower citizens with verifiable civic records, establishing trust between local governance and the community.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" ref={howItWorksRef} className="how-it-works-section">
            <div className="app-container">
              <div className="section-title-block">
                <span className="section-eyebrow">Simple Workflow</span>
                <h2 className="section-heading">How CivicSolver Works</h2>
                <p className="section-subheading">
                  Three simple steps from identifying a civic problem to celebrating its resolution.
                </p>
              </div>

              <div className="steps-connected-timeline">
                <div className="timeline-step-card">
                  <div className="step-badge-number">01</div>
                  <div className="step-icon-round">
                    <FileText size={22} />
                  </div>
                  <h3 className="step-card-title">1. Report with Photos</h3>
                  <p className="step-card-desc">
                    Take a picture of the issue, specify your neighborhood location, and describe what needs attention.
                  </p>
                </div>

                <div className="timeline-connector-line" />

                <div className="timeline-step-card">
                  <div className="step-badge-number">02</div>
                  <div className="step-icon-round">
                    <ThumbsUp size={22} />
                  </div>
                  <h3 className="step-card-title">2. Community Upvotes</h3>
                  <p className="step-card-desc">
                    Neighbors discover reported issues and upvote to highlight urgent community priorities for city leaders.
                  </p>
                </div>

                <div className="timeline-connector-line" />

                <div className="timeline-step-card">
                  <div className="step-badge-number">03</div>
                  <div className="step-icon-round">
                    <CheckCircle2 size={22} />
                  </div>
                  <h3 className="step-card-title">3. Official Resolution</h3>
                  <p className="step-card-desc">
                    Local administrative heads review prioritized reports, dispatch repair teams, and update status to Resolved.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* 3.B COMMUNITY PROBLEMS SECTION */}
      <section id="problems" ref={problemsRef} className="community-problems-section">
        <div className="app-container">
          <div className="problems-section-header">
            <div>
              <span className="section-eyebrow">
                {isBeforeLoginLanding ? 'Active Priorities' : 'Community Directory'}
              </span>
              <h2 className="section-heading">
                {isBeforeLoginLanding ? 'Top 3 Active Issues' : 'Community Issues Directory'}
              </h2>
              <p className="section-subheading">
                {isBeforeLoginLanding
                  ? 'Displaying 3 active neighborhood issues. Sign in to access the full community dashboard, vote, and track resolutions.'
                  : 'Explore local reports, check resolution status, and vote to prioritize repairs.'}
              </p>
            </div>

            <div className="header-actions-group">
              <button
                type="button"
                onClick={handleReportOrLogin}
                className="btn btn-primary active-issues-report-btn"
                title="Report a new civic issue"
              >
                <PlusCircle size={20} strokeWidth={2.4} />
                <span>Report an Issue</span>
              </button>
            </div>
          </div>

          {/* Full Search & Filter Toolbar only for authenticated views */}
          {!isBeforeLoginLanding && (
            <div className="problems-toolbar">
              <div className="search-field-box">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search issues by title, location or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="search-clear-btn"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="filter-controls-group">
                <div className="select-wrapper">
                  <Filter size={15} className="select-icon" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewing">In Review</option>
                    <option value="completed">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="select-wrapper">
                  <ArrowUpDown size={15} className="select-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="filter-select"
                  >
                    <option value="votes">Most Upvoted</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Count for authenticated users */}
          {!isBeforeLoginLanding && (
            <div className="results-count-bar">
              <span>Showing <strong>{filteredProblems.length}</strong> {filteredProblems.length === 1 ? 'issue' : 'issues'}</span>
              {(searchTerm || statusFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="btn-reset-filters"
                >
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {/* Issues Grid */}
          {loading ? (
            <div className="loading-state-box">
              <div className="spinner" />
              <p>Loading community issues...</p>
            </div>
          ) : displayedProblems.length === 0 ? (
            <div className="empty-state-box">
              <div className="empty-icon-circle">
                <AlertCircle size={36} />
              </div>
              <h3>No active issues found</h3>
              <p>There are currently no active community problems reported in this area.</p>
              <button
                type="button"
                onClick={handleReportOrLogin}
                className="btn btn-primary active-issues-report-btn"
                title="Report a new civic issue"
              >
                <PlusCircle size={18} strokeWidth={2.4} />
                <span>Report the First Issue</span>
              </button>
            </div>
          ) : (
            <div className="problems-grid">
              {displayedProblems.map((problem) => (
                <article key={problem._id} className="problem-card">
                  <div className="problem-header">
                    <h3 className="problem-title">{problem.title}</h3>
                    <StatusBadge status={problem.status} />
                  </div>

                  {/* Problem Image or Placeholder */}
                  <div className="problem-card-image">
                    {problem.image?.url ? (
                      <img
                        src={problem.image.url}
                        alt={problem.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                    ) : (
                      <div className="problem-card-image-placeholder">
                        <Building2 size={32} strokeWidth={1.5} />
                        <span>CivicSolver Report</span>
                      </div>
                    )}
                  </div>

                  <p className="problem-description">{problem.description}</p>

                  <div className="problem-meta">
                    <div className="meta-row">
                      <MapPin size={15} />
                      <span>{problem.location || 'Location not specified'}</span>
                    </div>
                    <div className="meta-row">
                      <Calendar size={15} />
                      <span>{problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : (problem.date || 'Recently')}</span>
                    </div>
                  </div>

                  <div className="problem-footer">
                    <div className="problem-actions">
                      <div className="votes-display">
                        <ThumbsUp size={16} className="vote-icon" />
                        <span>{problem.votes || 0} votes</span>
                      </div>

                      <button
                        type="button"
                        className="vote-button"
                        onClick={() => handleVoteOrLogin(problem._id)}
                        disabled={votingId === problem._id}
                        title="Upvote this problem"
                      >
                        <ThumbsUp size={14} />
                        <span>{votingId === problem._id ? 'Voting...' : 'Upvote'}</span>
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Authentication-Based Access Control Banner (Only displayed to unauthenticated visitors) */}
          {isBeforeLoginLanding && (
            <div className="landing-auth-lock-card">
              <div className="auth-lock-header">
                <div className="auth-lock-icon">
                  <Lock size={26} />
                </div>
                <div className="auth-lock-text">
                  <h3 className="auth-lock-title">Sign in to view all community reports & details</h3>
                  <p className="auth-lock-desc">
                    Unauthenticated visitors can preview 3 active issues. Join as an active citizen or municipal head to access the complete community issues dashboard, upvote neighborhood repairs, and track resolution milestones.
                  </p>
                </div>
              </div>

              <div className="auth-lock-actions">
                <Link to="/login" className="btn btn-primary btn-lg auth-lock-btn">
                  <LogIn size={18} />
                  <span>Sign In to Access Dashboard</span>
                </Link>
                <Link to="/register" className="btn btn-secondary btn-lg auth-lock-btn">
                  <UserPlus size={18} />
                  <span>Create Free Citizen Account</span>
                </Link>
              </div>
            </div>
          )}
          {/* Prominent Report an Issue Call-to-Action Banner in Active Issues Section */}
          <div className="active-issues-cta-banner">
            <div className="active-issues-cta-left">
              <div className="cta-icon-badge">
                <PlusCircle size={26} strokeWidth={2.2} />
              </div>
              <div className="cta-text-wrap">
                <h3 className="cta-banner-title">Have an issue in your neighborhood?</h3>
                <p className="cta-banner-desc">
                  Report potholes, damaged streetlights, sanitation problems, or water leaks directly to local officials.
                </p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={handleReportOrLogin} 
              className="btn btn-primary active-issues-report-btn cta-banner-btn"
              title="Report a new civic issue"
            >
              <PlusCircle size={20} strokeWidth={2.4} />
              <span>Report an Issue</span>
            </button>
          </div>

        </div>
      </section>

      {/* Professional Footer */}
      {showLandingPage && (
        <footer className="footer-site">
          <div className="app-container">
            <div className="footer-main-grid">
              {/* Brand Column */}
              <div className="footer-brand-col">
                <div className="footer-brand-logo">
                  <div className="logo-icon-badge">
                    <Building2 size={20} strokeWidth={2.4} />
                  </div>
                  <span className="logo-text-group">
                    <span className="logo-civic">Civic</span>
                    <span className="logo-solver">Solver</span>
                  </span>
                </div>
                <p className="footer-tagline">
                  Modern CivicTech software empowering neighbors and municipal authorities to collaborate on faster, transparent problem resolution.
                </p>
                <div className="footer-trust-badge">
                  <ShieldCheck size={16} />
                  <span>Verified Civic Technology Platform</span>
                </div>
              </div>

              {/* Quick Links Column */}
              <div className="footer-nav-col">
                <h4 className="footer-heading">Platform</h4>
                <ul className="footer-links-list">
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('problems')}
                      className="footer-nav-btn"
                    >
                      Active Issues (Top 3)
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('features')}
                      className="footer-nav-btn"
                    >
                      Key Features
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => scrollToSection('how-it-works')}
                      className="footer-nav-btn"
                    >
                      How It Works
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={handleReportOrLogin}
                      className="footer-nav-btn"
                    >
                      Submit a Report
                    </button>
                  </li>
                </ul>
              </div>

              {/* Roles Column */}
              <div className="footer-nav-col">
                <h4 className="footer-heading">Access & Portals</h4>
                <ul className="footer-links-list">
                  <li><Link to="/login" className="footer-nav-link">Citizen Login</Link></li>
                  <li><Link to="/register" className="footer-nav-link">Create Account</Link></li>
                  <li><Link to="/login" className="footer-nav-link">Municipal Head Portal</Link></li>
                  <li><Link to="/dashboard" className="footer-nav-link">Citizen Dashboard</Link></li>
                </ul>
              </div>

              {/* Contact Column */}
              <div className="footer-nav-col">
                <h4 className="footer-heading">Support & Inquiries</h4>
                <div className="footer-contact-items">
                  <div className="contact-item-row">
                    <Mail size={16} />
                    <span>support@civicsolver.org</span>
                  </div>
                  <div className="contact-item-row">
                    <Phone size={16} />
                    <span>(800) 555-CIVIC</span>
                  </div>
                  <div className="contact-item-row">
                    <MapPin size={16} />
                    <span>Municipal Solutions Center</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom-bar">
              <p>&copy; {new Date().getFullYear()} CivicSolver. All rights reserved. Building cleaner, safer communities together.</p>
              <div className="footer-legal-links">
                <button
                  type="button"
                  onClick={() => setLegalModal('privacy')}
                  className="legal-link-btn"
                >
                  Privacy Policy
                </button>
                <span className="legal-dot">•</span>
                <button
                  type="button"
                  onClick={() => setLegalModal('terms')}
                  className="legal-link-btn"
                >
                  Terms of Service
                </button>
                <span className="legal-dot">•</span>
                <button
                  type="button"
                  onClick={() => setLegalModal('accessibility')}
                  className="legal-link-btn"
                >
                  Accessibility
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Informative Legal Modal */}
      {legalModal && (
        <div className="image-lightbox-modal" onClick={() => setLegalModal(null)}>
          <div className="lightbox-content legal-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <h4>
                {legalModal === 'privacy'
                  ? 'CivicSolver Privacy Policy'
                  : legalModal === 'terms'
                    ? 'CivicSolver Terms of Service'
                    : 'Accessibility Statement'}
              </h4>
              <button
                type="button"
                onClick={() => setLegalModal(null)}
                className="btn-close-modal"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>
            <div className="legal-modal-body">
              {legalModal === 'privacy' ? (
                <p>
                  CivicSolver is dedicated to safeguarding community privacy. User records, report images, and vote data are securely handled in compliance with modern municipal privacy standards. Citizen identities are protected and verified for civic transparency.
                </p>
              ) : legalModal === 'terms' ? (
                <p>
                  By using CivicSolver, community members agree to report genuine civic issues responsibly. Obscene content or false reports are prohibited and subject to immediate administrative moderation by local municipal authorities.
                </p>
              ) : (
                <p>
                  CivicSolver is committed to digital accessibility, adhering to WCAG 2.1 AA guidelines with keyboard navigability, high color contrast, screen reader compatibility, and responsive viewports on mobile devices.
                </p>
              )}
              <div style={{ marginTop: '1.25rem', textAlign: 'right' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setLegalModal(null)}
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemsList;
