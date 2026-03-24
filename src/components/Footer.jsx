import { Link } from 'react-router-dom';
import { HeartHandshake, Mail, MapPin, Phone, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

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
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
          </div>
        </div>

        {/* Column 2: Donate */}
        <div className="footer-col">
          <h4 className="footer-heading">Donate</h4>
          <ul className="footer-links">
            <li><Link to="/signup">List Food</Link></li>
            <li><Link to="/signup">How it Works</Link></li>
            <li><Link to="/signup">Success Stories</Link></li>
            <li><Link to="/signup">Become a Donor</Link></li>
          </ul>
        </div>

        {/* Column 3: NGOs */}
        <div className="footer-col">
          <h4 className="footer-heading">NGOs</h4>
          <ul className="footer-links">
            <li><Link to="/signup">Claim Food</Link></li>
            <li><Link to="/signup">Our Partners</Link></li>
            <li><Link to="/signup">Impact Statistics</Link></li>
            <li><Link to="/signup">Register as NGO</Link></li>
          </ul>
        </div>

        {/* Column 4: Company */}
        <div className="footer-col">
          <h4 className="footer-heading">Company</h4>
          <ul className="footer-contact">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>4 Bungalow Road Mumbai </span>
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
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
            <li><Link to="/">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {year} FeedHope Platform. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
            <Link to="/">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
