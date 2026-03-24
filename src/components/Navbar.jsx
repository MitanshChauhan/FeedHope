import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HeartHandshake, User, Menu, X, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' }
  ];

  if (user?.role === 'donor') {
    navLinks.push({ name: 'Donor Dashboard', path: '/donor' });
  } else if (user?.role === 'ngo') {
    navLinks.push({ name: 'NGO Dashboard', path: '/ngo' });
  }

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
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
              <Link to="/profile" className="profile-btn">
                <User size={20} />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828' }}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogIn size={20} />
                <span>Log In</span>
              </Link>
              <Link to="/signup" className="profile-btn">
                <UserPlus size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle desktop-hidden" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/profile" className="mobile-profile-btn" onClick={() => setIsOpen(false)}>
                <User size={20} />
                <span>{user.name}</span>
              </Link>
              <button onClick={handleLogout} className="mobile-link" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#c62828', width: '100%', textAlign: 'left' }}>
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LogIn size={20} />
                <span>Log In</span>
              </Link>
              <Link to="/signup" className="mobile-profile-btn" onClick={() => setIsOpen(false)}>
                <UserPlus size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
