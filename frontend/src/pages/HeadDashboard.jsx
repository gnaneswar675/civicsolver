import React, { useEffect, useState, useMemo } from 'react';
import { fetchProblems, updateProblemStatus } from '../api/problems';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  Search, 
  Filter, 
  MapPin, 
  Calendar,
  AlertCircle, 
  Eye, 
  X, 
  FileText, 
  RefreshCw 
} from 'lucide-react';
import './headashboard.css';
import '../styles/shared-image.css';

const HeadDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'votes', direction: 'descending' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const loadProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProblems();
      if (Array.isArray(data)) {
        setProblems(data);
      } else {
        setProblems([]);
      }
    } catch (err) {
      setError('Failed to load issues for administrative triage.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      // Optimistic update
      setProblems(currentProblems => 
        currentProblems.map(problem => 
          problem._id === id 
            ? { ...problem, status: newStatus }
            : problem
        )
      );

      await updateProblemStatus(id, newStatus);
    } catch (err) {
      console.error('Status update failed:', err);
      setError('Status update failed. Reverting to server state...');
      loadProblems();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (columnName) => {
    if (sortConfig.key !== columnName) return '↕';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  // Filtered & sorted data
  const filteredProblems = useMemo(() => {
    let list = problems.filter((problem) => {
      const matchesSearch = 
        (problem.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (problem.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (problem.location || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = 
        statusFilter === 'all' || 
        (problem.status || 'pending').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      list.sort((a, b) => {
        if (sortConfig.key === 'votes') {
          return sortConfig.direction === 'ascending' 
            ? (a.votes || 0) - (b.votes || 0)
            : (b.votes || 0) - (a.votes || 0);
        }
        if (sortConfig.key === 'date') {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return sortConfig.direction === 'ascending' ? dateA - dateB : dateB - dateA;
        }
        if (sortConfig.key === 'status') {
          const valA = (a.status || '').toLowerCase();
          const valB = (b.status || '').toLowerCase();
          return sortConfig.direction === 'ascending'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return 0;
      });
    }

    return list;
  }, [problems, searchTerm, statusFilter, sortConfig]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = problems.length;
    const resolved = problems.filter(p => ['completed', 'resolved'].includes((p.status || '').toLowerCase())).length;
    const reviewing = problems.filter(p => ['reviewing', 'in-progress'].includes((p.status || '').toLowerCase())).length;
    const pending = problems.filter(p => ['pending'].includes((p.status || '').toLowerCase())).length;
    return { total, resolved, reviewing, pending };
  }, [problems]);

  return (
    <div className="head-dashboard-page">
      <div className="app-container">
        {/* Welcome Header */}
        <div className="head-welcome-banner">
          <div className="banner-text-content">
            <div className="head-role-pill">
              <ShieldCheck size={15} />
              <span>Municipal Administrative Center</span>
            </div>
            <h1 className="head-heading">Head Official Dashboard</h1>
            <p className="head-subheading">
              Welcome, <strong>Community Leader</strong>. Review citizen reports, triage public concerns, and update work order statuses for city maintenance teams.
            </p>
          </div>
          <div className="banner-stats-summary">
            <div className="summary-pill">
              <Clock size={16} className="pill-icon pending" />
              <span><strong>{stats.pending}</strong> Pending Review</span>
            </div>
          </div>
        </div>

        {/* Dashboard Statistics KPI Cards */}
        <div className="head-metrics-grid">
          <div className="stat-card-modern">
            <div className="stat-icon-wrapper primary">
              <FileText size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.total}</span>
              <span className="stat-label-title">Total Issues Reported</span>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon-wrapper warning">
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.reviewing}</span>
              <span className="stat-label-title">In Official Review</span>
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
            <div className="stat-icon-wrapper info">
              <AlertCircle size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.pending}</span>
              <span className="stat-label-title">Awaiting Initial Action</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="dashboard-error-banner" role="alert">
            <div className="error-text">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={loadProblems} className="btn btn-secondary btn-sm retry-btn">
              <RefreshCw size={14} />
              <span>Reload</span>
            </button>
          </div>
        )}

        {/* Toolbar: Search & Filter */}
        <div className="head-toolbar-card">
          <div className="search-field-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search reports by title, location or keyword..."
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
                <option value="pending">Pending Only</option>
                <option value="reviewing">Reviewing Only</option>
                <option value="completed">Completed Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="results-count-bar">
          <span>Managing <strong>{filteredProblems.length}</strong> {filteredProblems.length === 1 ? 'problem' : 'problems'}</span>
          {(searchTerm || statusFilter !== 'all') && (
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="btn-reset-filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Content View: Desktop Table & Mobile Cards */}
        {loading ? (
          <div className="loading-state-box">
            <div className="spinner" />
            <p>Loading administrative dashboard data...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon-circle">
              <AlertCircle size={36} />
            </div>
            <h3>No reports found</h3>
            <p>There are no citizen reports matching the specified filter criteria.</p>
            <button 
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW (Visible on larger screens >= 900px) */}
            <div className="desktop-table-wrapper">
              <table className="head-admin-table" aria-label="Issue management table">
                <thead>
                  <tr>
                    <th className="col-title">Issue Title</th>
                    <th className="col-desc">Description</th>
                    <th className="col-location">Location</th>
                    <th className="col-date sortable" onClick={() => handleSort('date')}>
                      <span>Reported</span>
                      <span className="sort-symbol">{getSortIndicator('date')}</span>
                    </th>
                    <th className="col-votes sortable" onClick={() => handleSort('votes')}>
                      <span>Votes</span>
                      <span className="sort-symbol">{getSortIndicator('votes')}</span>
                    </th>
                    <th className="col-image">Photo</th>
                    <th className="col-status sortable" onClick={() => handleSort('status')}>
                      <span>Status Action</span>
                      <span className="sort-symbol">{getSortIndicator('status')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((problem) => (
                    <tr key={problem._id} className="table-row">
                      <td className="cell-title">
                        <span className="problem-title-text">{problem.title}</span>
                      </td>

                      <td className="cell-desc">
                        <div className="desc-scroll-box" title={problem.description}>
                          {problem.description}
                        </div>
                      </td>

                      <td className="cell-location">
                        <div className="location-pill">
                          <MapPin size={13} className="loc-icon" />
                          <span>{problem.location || 'Not specified'}</span>
                        </div>
                      </td>

                      <td className="cell-date">
                        <div className="date-text">
                          {problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : (problem.date || 'Recently')}
                        </div>
                      </td>

                      <td className="cell-votes">
                        <div className="vote-badge-count">
                          <ThumbsUp size={13} />
                          <span>{problem.votes || 0}</span>
                        </div>
                      </td>

                      <td className="cell-image">
                        {problem.image?.url ? (
                          <div 
                            className="table-thumbnail-box" 
                            onClick={() => setSelectedImage({ url: problem.image.url, title: problem.title })}
                            title="Click to expand photo"
                          >
                            <img src={problem.image.url} alt={problem.title} />
                            <div className="thumb-zoom-overlay">
                              <Eye size={14} />
                            </div>
                          </div>
                        ) : (
                          <span className="no-image-text">No photo</span>
                        )}
                      </td>

                      <td className="cell-status">
                        <select
                          value={(problem.status || 'pending').toLowerCase()}
                          onChange={(e) => handleStatusChange(problem._id, e.target.value)}
                          disabled={updatingId === problem._id}
                          className={`head-status-select status-${(problem.status || 'pending').toLowerCase()}`}
                          aria-label={`Change status for ${problem.title}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">In Review</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE & TABLET CARD VIEW (Visible below 900px to completely prevent horizontal overflow) */}
            <div className="mobile-admin-cards-container">
              {filteredProblems.map((problem) => (
                <div key={problem._id} className="mobile-admin-card">
                  <div className="mobile-card-top">
                    <h3 className="mobile-card-title">{problem.title}</h3>
                    <div className="vote-badge-count">
                      <ThumbsUp size={13} />
                      <span>{problem.votes || 0}</span>
                    </div>
                  </div>

                  {problem.image?.url && (
                    <div 
                      className="mobile-card-image"
                      onClick={() => setSelectedImage({ url: problem.image.url, title: problem.title })}
                    >
                      <img src={problem.image.url} alt={problem.title} loading="lazy" />
                    </div>
                  )}

                  <p className="mobile-card-desc">{problem.description}</p>

                  <div className="mobile-card-meta">
                    <div className="meta-pill">
                      <MapPin size={13} />
                      <span>{problem.location || 'Location not specified'}</span>
                    </div>
                    <div className="meta-pill">
                      <Calendar size={13} />
                      <span>{problem.createdAt ? new Date(problem.createdAt).toLocaleDateString() : (problem.date || 'Recently')}</span>
                    </div>
                  </div>

                  <div className="mobile-card-action-bar">
                    <span className="action-label">Update Official Status:</span>
                    <select
                      value={(problem.status || 'pending').toLowerCase()}
                      onChange={(e) => handleStatusChange(problem._id, e.target.value)}
                      disabled={updatingId === problem._id}
                      className={`head-status-select mobile-select status-${(problem.status || 'pending').toLowerCase()}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">In Review</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </>
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

export default HeadDashboard;
