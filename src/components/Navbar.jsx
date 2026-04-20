import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartHandshake, User, Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' }
  ];

  if (user?.role === 'donor') {
    navLinks.push({ name: 'Dashboard', path: '/donor' });
  } else if (user?.role === 'ngo') {
    navLinks.push({ name: 'Dashboard', path: '/ngo' });
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <Link to={user ? (user.role === 'donor' ? '/donor' : '/ngo') : '/'} className="nav-logo">
            <HeartHandshake className="logo-icon" size={32} />
            <span className="logo-text">FeedHope</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links desktop-only">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/profile" className="profile-btn pill-btn">
                  <User size={18} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn nav-link action-btn">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="auth-btn-group">
                <Link to="/login" className="nav-link login-link">
                  <span>Log In</span>
                </Link>
                <Link to="/signup" className="profile-btn pill-btn">
                  <span>Sign Up</span>
                  <UserPlus size={18} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className={`mobile-toggle desktop-hidden ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Full-Screen Mobile Navigation Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-nav-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-link fade-in-up ${location.pathname === link.path ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="mobile-auth-section fade-in-up delay-2">
            {user ? (
              <>
                <Link to="/profile" className="mobile-profile-btn pill-btn large" onClick={() => setIsOpen(false)}>
                  <User size={22} />
                  <span>{user.name} Profile</span>
                </Link>
                <button onClick={handleLogout} className="mobile-logout-btn">
                  <LogOut size={22} />
                  <span>Log Out of FeedHope</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="mobile-profile-btn pill-btn large w-full" onClick={() => setIsOpen(false)}>
                  <UserPlus size={22} />
                  <span>Create Account</span>
                </Link>
                <Link to="/login" className="mobile-login-btn text-center mt-3" onClick={() => setIsOpen(false)}>
                  Already have an account? Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
