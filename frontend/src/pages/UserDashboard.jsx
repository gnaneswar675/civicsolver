import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchProblems, voteProblem } from '../api/problems';
import StatusBadge from '../components/StatusBadge';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MapPin, 
  Calendar, 
  ThumbsUp, 
  CheckCircle2, 
  Building2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  FileText
} from 'lucide-react';
import './userdashboard.css';
import '../styles/shared-image.css';

const UserDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes');

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
      setError('Unable to load community problems. Please verify your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    try {
      setVotingId(id);
      // Optimistic vote update
      setProblems(prev => 
        prev.map(p => p._id === id ? { ...p, votes: (p.votes || 0) + 1 } : p)
      );
      await voteProblem(id);
    } catch (err) {
      setError('Failed to record your vote. Reloading latest issues...');
      await loadProblems();
    } finally {
      setVotingId(null);
    }
  };

  useEffect(() => {
    loadProblems();
  }, []);

  // Filter & sort
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

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = problems.length;
    const resolved = problems.filter(p => ['completed', 'resolved'].includes((p.status || '').toLowerCase())).length;
    const totalVotes = problems.reduce((sum, p) => sum + (p.votes || 0), 0);
    const resolvedPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;
    return { total, resolved, totalVotes, resolvedPercentage };
  }, [problems]);

  return (
    <div className="citizen-dashboard-page">
      <div className="app-container">
        {/* Welcome Banner */}
        <div className="dashboard-welcome-banner">
          <div className="welcome-text-group">
            <div className="welcome-badge">
              <Sparkles size={14} />
              <span>Citizen Portal</span>
            </div>
            <h1 className="dashboard-main-heading">Citizen Dashboard</h1>
            <p className="dashboard-lead-text">
              Track issues you care about, upvote urgent neighborhood fixes, and monitor municipal progress in real time.
            </p>
          </div>

          <div className="welcome-cta-group">
            <Link to="/report" className="btn btn-primary btn-lg cta-report-action">
              <PlusCircle size={20} />
              <span>Report an Issue</span>
            </Link>
          </div>
        </div>

        {/* Statistics Metric Cards */}
        <div className="dashboard-metrics-row">
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
            <div className="stat-icon-wrapper success">
              <CheckCircle2 size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.resolved}</span>
              <span className="stat-label-title">Issues Resolved ({stats.resolvedPercentage}%)</span>
            </div>
          </div>

          <div className="stat-card-modern">
            <div className="stat-icon-wrapper info">
              <ThumbsUp size={24} />
            </div>
            <div className="stat-details">
              <span className="stat-number-value">{stats.totalVotes}</span>
              <span className="stat-label-title">Total Community Upvotes</span>
            </div>
          </div>
        </div>

        {/* Error Banner with Retry */}
        {error && (
          <div className="dashboard-error-banner" role="alert">
            <div className="error-text">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
            <button onClick={loadProblems} className="btn btn-secondary btn-sm retry-btn">
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Search, Filter & Sort Bar */}
        <div className="dashboard-toolbar">
          <div className="search-field-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search by title, location or description..."
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

        {/* Loading State */}
        {loading ? (
          <div className="loading-state-box">
            <div className="spinner" />
            <p>Loading community issues...</p>
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="empty-state-box">
            <div className="empty-icon-circle">
              <AlertCircle size={36} />
            </div>
            <h3>No community issues found</h3>
            <p>
              {searchTerm || statusFilter !== 'all' 
                ? 'No issues matched your current search or filter. Try clearing filters.'
                : 'No problems reported yet. Be the first to report an issue in your area!'}
            </p>
            {searchTerm || statusFilter !== 'all' ? (
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="btn btn-secondary btn-sm"
              >
                Reset Filters
              </button>
            ) : (
              <Link to="/report" className="btn btn-primary btn-sm">
                <PlusCircle size={16} />
                <span>Report the First Issue</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="problems-grid">
            {filteredProblems.map((problem) => (
              <article key={problem._id} className="problem-card">
                <div className="problem-header">
                  <h3 className="problem-title">{problem.title}</h3>
                  <StatusBadge status={problem.status} />
                </div>

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
                      className="vote-button" 
                      onClick={() => handleVote(problem._id)}
                      disabled={votingId === problem._id}
                      title="Vote on this issue"
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
      </div>
    </div>
  );
};

export default UserDashboard;
