import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, MapPin, Phone, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { user } = useContext(AuthContext);
  const year = new Date().getFullYear();

  const handleSmoothScroll = (e, targetId) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="footer">
      <div className="container footer-container">
        {/* Column 1: Brand */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            <HeartHandshake className="logo-icon" size={32} />
            <span className="logo-text">FeedHope</span>
          </Link>
          <p className="brand-desc">
            Premium food donation platform connecting surplus meals with those in need. Sustainably sharing, beautifully caring.
          </p>
          <div className="social-links">
            <a href="https://instagram.com/feed.hope" target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={20} /> <span>feed.hope</span></a>
            <a href="mailto:feedhope@gmail.com" aria-label="Email"><Mail size={20} /> <span>feedhope@gmail.com</span></a>
          </div>
        </div>

        {/* Column 2: Donate */}
        <div className="footer-col">
          <h4 className="footer-heading">Donate</h4>
          <ul className="footer-links">
            <li><Link to={user ? '/donor' : '/signup'} onClick={() => window.scrollTo(0, 0)}>List Food</Link></li>
            <li><Link to="/#how-it-works" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>How it Works</Link></li>
            <li><Link to="/#stats" onClick={(e) => handleSmoothScroll(e, 'stats')}>Success Stories</Link></li>
            <li><Link to={user ? '/donor' : '/signup'} onClick={() => window.scrollTo(0, 0)}>Become a Donor</Link></li>
          </ul>
        </div>

        {/* Column 3: NGOs */}
        <div className="footer-col">
          <h4 className="footer-heading">NGOs</h4>
          <ul className="footer-links">
            <li><Link to={user ? '/ngo' : '/signup'} onClick={() => window.scrollTo(0, 0)}>Claim Food</Link></li>
            <li><Link to="/#how-it-works" onClick={(e) => handleSmoothScroll(e, 'how-it-works')}>Our Partners</Link></li>
            <li><Link to="/#stats" onClick={(e) => handleSmoothScroll(e, 'stats')}>Impact Statistics</Link></li>
            <li><Link to={user ? '/ngo' : '/signup'} onClick={() => window.scrollTo(0, 0)}>Register as NGO</Link></li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-contact">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>4 Bungalow Road Mumbai</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+91 98765 43210</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>hello@feedhope.org</span>
            </li>
          </ul>
          <ul className="footer-links mt-3">
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About Us</Link></li>
            <li><Link to="/privacy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link></li>
            <li><Link to="/terms" onClick={() => window.scrollTo(0, 0)}>Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {year} FeedHope Platform. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="/privacy" onClick={() => window.scrollTo(0, 0)}>Privacy</Link>
            <Link to="/terms" onClick={() => window.scrollTo(0, 0)}>Terms</Link>
            <Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
