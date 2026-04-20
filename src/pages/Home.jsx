import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, HeartHandshake, MapPin, Trophy, Leaf } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { user } = useContext(AuthContext);
  const [topDonors, setTopDonors] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/donors/top')
      .then(res => res.json())
      .then(data => setTopDonors(data))
      .catch(err => console.error(err));
  }, []);
  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title">Share Your Excess, <br/>Feed the Need</h1>
          <p className="hero-subtitle">
            Connect directly with local NGOs to donate leftover food from your events, restaurants, or home. 
            Reduce waste, spread smiles.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to={user.role === 'donor' ? '/donor' : '/ngo'} className="btn btn-primary">
                Go to Dashboard <ArrowRight size={20} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary">
                  Donate Food <ArrowRight size={20} />
                </Link>
                <Link to="/signup" className="btn btn-secondary">
                  Find Food
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="stats-section">
        <div className="container stats-grid">
          <div className="stat-card">
            <h3>10,000+</h3>
            <p>Meals Shared</p>
          </div>
          <div className="stat-card">
            <h3>500+</h3>
            <p>Active Donors</p>
          </div>
          <div className="stat-card">
            <h3>120+</h3>
            <p>Partner NGOs</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works container">
        <h2 className="section-title">How FeedHope Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <Utensils className="step-icon" size={32} />
            </div>
            <h3 className="step-title">1. List Leftovers</h3>
            <p className="step-desc">Have extra food? Create a quick listing with details like quantity, type, and expiry time.</p>
          </div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <MapPin className="step-icon" size={32} />
            </div>
            <h3 className="step-title">2. NGOs Locate</h3>
            <p className="step-desc">Nearby partnered NGOs get notified instantly and can browse available food in their area.</p>
          </div>

          <div className="step-card">
            <div className="step-icon-wrapper">
              <HeartHandshake className="step-icon" size={32} />
            </div>
            <h3 className="step-title">3. Claim & Collect</h3>
            <p className="step-desc">NGOs claim the food and coordinate for a seamless pickup. The food reaches those who need it!</p>
          </div>
        </div>
      </section>

      {/* Top Donors Section */}
      <section className="top-donors-section container">
        <h2 className="section-title"><Trophy className="inline-icon" size={28} /> Top Community Donors</h2>
        <div className="donors-grid">
          {topDonors.length > 0 ? topDonors.map((donor, index) => (
            <div key={donor.id} className="donor-card">
              <div className="donor-rank">#{index + 1}</div>
              <div className="donor-info">
                <h3>{donor.name}</h3>
                <p><MapPin size={14} className="inline-icon"/> {donor.location || 'Local'}</p>
              </div>
              <div className="donor-stats">
                <span className="stat-highlight">{donor.mealsProvided}</span> Meals
              </div>
            </div>
          )) : (
            <p className="no-donors">No donors yet. Be the first to donate!</p>
          )}
        </div>
      </section>

      {/* Impact Banner */}
      <section id="about" className="impact-banner">
        <div className="impact-overlay"></div>
        <div className="container impact-content">
          <Leaf size={48} className="impact-icon" />
          <h2>Built to nourish. Designed to sustain.</h2>
          <p>Every meal rescued is a step towards zero hunger and a healthier planet. Join our mission to eliminate food waste and support communities sustainably.</p>
          <div className="impact-actions">
            <Link to="/about" onClick={() => window.scrollTo(0, 0)} className="btn btn-primary btn-large">Our Story</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container cta-content">
          <h2>Ready to make an impact?</h2>
          <p>Join thousands of others making a difference in their communities every single day.</p>
          {user ? (
            <Link to={user.role === 'donor' ? '/donor' : '/ngo'} className="btn btn-primary btn-large">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/signup" onClick={() => window.scrollTo(0, 0)} className="btn btn-primary btn-large">
              Create Your Profile
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
