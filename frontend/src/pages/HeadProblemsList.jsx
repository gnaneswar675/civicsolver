import React, { useEffect, useState, useMemo } from 'react';
import { fetchProblems } from '../api/problems';
import StatusBadge from '../components/StatusBadge';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  FileText, 
  X
} from 'lucide-react';
import './headproblemslist.css';
import '../styles/shared-image.css';

const HeadProblemsList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadProblems();
  }, []);

  const loadProblems = async () => {
    try {
      setLoading(true);
      const data = await fetchProblems();
      if (Array.isArray(data)) {
        setProblems(data);
      } else {
        setProblems([]);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

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

  const stats = useMemo(() => {
    const total = problems.length;
    const resolved = problems.filter(p => ['completed', 'resolved'].includes((p.status || '').toLowerCase())).length;
    const pending = problems.filter(p => ['pending'].includes((p.status || '').toLowerCase())).length;
    const reviewing = problems.filter(p => ['reviewing', 'in-progress'].includes((p.status || '').toLowerCase())).length;
    return { total, resolved, pending, reviewing };
  }, [problems]);

  return (
    <div className="head-problems-page">
      <div className="app-container">
        {/* Header */}
        <div className="head-overview-banner">
          <div className="overview-text-group">
            <div className="overview-badge">
              <ShieldCheck size={14} />
              <span>Municipal Overview</span>
            </div>
            <h1 className="overview-heading">Community Problems Overview</h1>
            <p className="overview-lead-text">
              Comprehensive municipal view of all citizen-reported infrastructure issues, voter urgency, and resolution statuses across all city sectors.
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="overview-metrics-grid">
          <div className="stat-card-modern">
            <div className="stat-icon-wrapper primary">
              <FileText size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.total}</span>
              <span className="stat-label-title">Total Reports Logged</span>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon-wrapper success">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.resolved}</span>
              <span className="stat-label-title">Resolved & Completed</span>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon-wrapper warning">
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.reviewing}</span>
              <span className="stat-label-title">Under Inspection / Review</span>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon-wrapper info">
              <AlertCircle size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.pending}</span>
              <span className="stat-label-title">Awaiting Action</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="overview-toolbar-card">
          <div className="search-field-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search reports by title, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
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

        {/* Results Counter */}
        <div className="results-count-bar">
          <span>Showing <strong>{filteredProblems.length}</strong> {filteredProblems.length === 1 ? 'issue' : 'issues'}</span>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="btn-reset-filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="loading-state-box">
            <div className="spinner" />
            <p>Loading community issues overview...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon-circle">
              <AlertCircle size={36} />
            </div>
            <h3>No reports found</h3>
            <p>No community issues match the current filter selection.</p>
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="problems-grid">
            {filteredProblems.map((problem) => (
              <article key={problem._id} className="problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">{problem.title}</h3>
                  <StatusBadge status={problem.status} />
                </div>

                <div 
                  className="problem-card-image"
                  onClick={() => problem.image?.url && setSelectedImage({ url: problem.image.url, title: problem.title })}
                >
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
                      <span>{problem.votes || 0} community votes</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Modal for viewing high-res image */}
        {selectedImage && (
          <div className="image-lightbox-modal" onClick={() => setSelectedImage(null)}>
            <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
              <div className="lightbox-header">
                <h4>{selectedImage.title}</h4>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="btn-close-modal"
                  aria-label="Close image preview"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="lightbox-body">
                <img src={selectedImage.url} alt={selectedImage.title} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeadProblemsList;
