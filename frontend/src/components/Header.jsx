import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getToken, logout, getUserRole } from '../utils/auth';
import { 
  Building2, 
  Menu, 
  X, 
  PlusCircle, 
  LogOut, 
  User, 
  ShieldCheck, 
  Layers, 
  ListOrdered, 
  LogIn, 
  UserPlus 
} from 'lucide-react';
import './header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLoggedIn = !!getToken();
  const role = getUserRole();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/', { replace: true });
  };

  const navigateToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/' || location.pathname === '') {
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
    } else {
      navigate('/', {
        state: { scrollTo: sectionId },
        replace: true
      });
    }
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className={`site-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-inner">
        {/* Brand Logo */}
        <Link to={role === 'head' ? '/head' : '/'} className="brand-logo" aria-label="CivicSolver Home">
          <div className="logo-icon-badge">
            <Building2 size={20} strokeWidth={2.4} />
          </div>
          <div className="logo-text-group">
            <span className="logo-civic">Civic</span>
            <span className="logo-solver">Solver</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" aria-label="Primary Navigation">
          {!isLoggedIn ? (
            <>
              <button 
                type="button" 
                onClick={() => navigateToSection('problems')} 
                className="header-nav-link"
              >
                Active Issues
              </button>
              <button 
                type="button" 
                onClick={() => navigateToSection('features')} 
                className="header-nav-link"
              >
                Features
              </button>
              <button 
                type="button" 
                onClick={() => navigateToSection('how-it-works')} 
                className="header-nav-link"
              >
                How It Works
              </button>

              <div className="nav-divider" />

              {/* Explicit, visible header action buttons */}
              <Link to="/login" className="header-btn header-btn-signin">
                <LogIn size={15} />
                <span>Sign In</span>
              </Link>

              <Link to="/register" className="header-btn header-btn-register">
                <UserPlus size={15} />
                <span>Register</span>
              </Link>

              <button 
                type="button"
                onClick={() => navigate('/login', { state: { returnTo: '/report', action: 'report' } })}
                className="header-btn header-btn-report"
              >
                <PlusCircle size={15} />
                <span>Report Issue</span>
              </button>
            </>
          ) : role === 'head' ? (
            <>
              <Link 
                to="/head" 
                className={`header-nav-link ${isCurrent('/head') || isCurrent('/head/dashboard') ? 'active' : ''}`}
              >
                <Layers size={16} />
                <span>Head Dashboard</span>
              </Link>
              <Link 
                to="/head/problems" 
                className={`header-nav-link ${isCurrent('/head/problems') ? 'active' : ''}`}
              >
                <ListOrdered size={16} />
                <span>All Community Issues</span>
              </Link>

              <div className="nav-divider" />

              <div className="user-role-badge head-badge">
                <ShieldCheck size={14} />
                <span>Head Official</span>
              </div>

              <button type="button" onClick={handleLogout} className="header-btn header-btn-logout" title="Sign Out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/dashboard" 
                className={`header-nav-link ${isCurrent('/dashboard') ? 'active' : ''}`}
              >
                <Layers size={16} />
                <span>Citizen Dashboard</span>
              </Link>

              <div className="nav-divider" />

              <Link to="/report" className="header-btn header-btn-report">
                <PlusCircle size={15} />
                <span>Report Issue</span>
              </Link>

              <div className="user-role-badge citizen-badge">
                <User size={14} />
                <span>Citizen</span>
              </div>

              <button type="button" onClick={handleLogout} className="header-btn header-btn-logout" title="Sign Out">
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          )}
        </nav>

        {/* Mobile Top Bar Quick Actions - visible even before opening menu */}
        <div className="mobile-header-actions">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="mobile-quick-btn signin">
                <span>Sign In</span>
              </Link>
              <button 
                type="button"
                onClick={() => navigate('/login', { state: { returnTo: '/report', action: 'report' } })}
                className="mobile-quick-btn report"
              >
                <PlusCircle size={15} />
                <span>Report</span>
              </button>
            </>
          ) : (
            role === 'head' ? (
              <Link to="/head" className="mobile-quick-btn report">
                <Layers size={15} />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link to="/report" className="mobile-quick-btn report">
                <PlusCircle size={15} />
                <span>Report</span>
              </Link>
            )
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button 
            type="button"
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-menu-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
            <div className="mobile-menu-content">
            {!isLoggedIn ? (
              <>
                <button 
                  type="button" 
                  onClick={() => navigateToSection('problems')} 
                  className="mobile-nav-link"
                >
                  <ListOrdered size={18} />
                  <span>Active Issues (Top 3)</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => navigateToSection('features')} 
                  className="mobile-nav-link"
                >
                  <Layers size={18} />
                  <span>Key Features</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => navigateToSection('how-it-works')} 
                  className="mobile-nav-link"
                >
                  <ShieldCheck size={18} />
                  <span>How It Works</span>
                </button>

                <div className="mobile-menu-divider" />

                <div className="mobile-actions-stack">
                  <Link to="/login" className="mobile-drawer-btn signin">
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </Link>
                  <Link to="/register" className="mobile-drawer-btn register">
                    <UserPlus size={18} />
                    <span>Register Free Account</span>
                  </Link>
                  <button 
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login', { state: { returnTo: '/report', action: 'report' } });
                    }}
                    className="mobile-drawer-btn report"
                  >
                    <PlusCircle size={18} />
                    <span>Report a Community Issue</span>
                  </button>
                </div>
              </>
            ) : role === 'head' ? (
              <>
                <div className="mobile-user-status head">
                  <ShieldCheck size={18} />
                  <div>
                    <span className="user-role-label">Head Administrator</span>
                    <span className="user-sublabel">Managing Municipal Issues</span>
                  </div>
                </div>

                <Link to="/head" className="mobile-nav-link">
                  <Layers size={18} />
                  <span>Head Dashboard (All Issues)</span>
                </Link>
                <Link to="/head/problems" className="mobile-nav-link">
                  <ListOrdered size={18} />
                  <span>Community Problems Overview</span>
                </Link>

                <div className="mobile-menu-divider" />

                <button type="button" onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <div className="mobile-user-status citizen">
                  <User size={18} />
                  <div>
                    <span className="user-role-label">Citizen Member</span>
                    <span className="user-sublabel">Viewing Full Community Dashboard</span>
                  </div>
                </div>

                <Link to="/dashboard" className="mobile-nav-link">
                  <Layers size={18} />
                  <span>Citizen Dashboard (All Issues)</span>
                </Link>
                <Link to="/report" className="mobile-drawer-btn report">
                  <PlusCircle size={18} />
                  <span>Report New Issue</span>
                </Link>

                <div className="mobile-menu-divider" />

                <button type="button" onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            )}
          </div>
        </div>
      </>
    )}
    </header>
  );
};

export default Header;
