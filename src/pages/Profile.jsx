import { useState, useContext, useEffect } from 'react';
import { Camera, Mail, Phone, MapPin, Award, Heart, Edit3, Save, X, Building, Info } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    phone: user?.phone || '',
    location: user?.location || '',
    description: user?.description || ''
  });

  const [stats, setStats] = useState({ totalDonations: 0, mealsProvided: 0 });
  const [ngos, setNgos] = useState([]);

  useEffect(() => {
    // Sync local state when user updates
    setEditFormData({
      phone: user?.phone || '',
      location: user?.location || '',
      description: user?.description || ''
    });

    if (user?.role === 'donor') {
      // Fetch stats
      fetch(`http://localhost:5000/api/users/${user.id}/stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Failed to fetch stats", err));

      // Fetch NGOs
      fetch(`http://localhost:5000/api/ngos`)
        .then(res => res.json())
        .then(data => setNgos(data))
        .catch(err => console.error("Failed to fetch NGOs", err));
    }
  }, [user]);

  if (!user) {
    return <div className="container profile-container"><div className="glass-card"><p>Please log in to view profile.</p></div></div>;
  }

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data.user);
        setIsEditing(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      alert("Network error updating profile");
    }
  };

  const isDonor = user.role === 'donor';

  return (
    <div className="container profile-container animate-fade-in">
      <div className="profile-header-card glass-card">
        <div className="profile-avatar-wrapper">
          <img src="/default-pfp.png" alt="Profile avatar" className="profile-pfp" />
          <button className="avatar-edit-btn" title="Change Avatar">
            <Camera size={18} />
          </button>
        </div>
        <div className="profile-title-area">
          <h1 className="profile-name">{user.name}</h1>
          <span className="profile-role">{isDonor ? 'Donor' : 'NGO'}</span>
          <p className="profile-joined">Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
        </div>
        {!isEditing && (
          <button className="btn btn-secondary edit-profile-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={18} /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content-grid">
        {/* Left Column: Details */}
        <div className="profile-details-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>Contact Information</h2>
            {isEditing && (
              <div className="edit-actions">
                <button className="btn btn-outline" onClick={() => setIsEditing(false)}><X size={16} /> Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}><Save size={16} /> Save</button>
              </div>
            )}
          </div>
          <ul className="details-list">
            <li>
              <Mail className="detail-icon" />
              <div>
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email}</span>
              </div>
            </li>

            <li>
              <Phone className="detail-icon" />
              <div style={{ width: '100%' }}>
                <span className="detail-label">Phone</span>
                {isEditing ? (
                  <input type="text" name="phone" value={editFormData.phone} onChange={handleEditChange} className="form-input" placeholder="e.g. +1 (555) 123-4567" />
                ) : (
                  <span className="detail-value">{user.phone || 'Not provided'}</span>
                )}
              </div>
            </li>

            <li>
              <MapPin className="detail-icon" />
              <div style={{ width: '100%' }}>
                <span className="detail-label">Location</span>
                {isEditing ? (
                  <input type="text" name="location" value={editFormData.location} onChange={handleEditChange} className="form-input" placeholder="e.g. Downtown NY" />
                ) : (
                  <span className="detail-value">{user.location || 'Not provided'}</span>
                )}
              </div>
            </li>

            {!isDonor && (
              <li>
                <Info className="detail-icon" />
                <div style={{ width: '100%' }}>
                  <span className="detail-label">Organization Description</span>
                  {isEditing ? (
                    <textarea name="description" value={editFormData.description} onChange={handleEditChange} className="form-input" rows="4" placeholder="Tell us about your organization..." style={{ resize: 'vertical' }}></textarea>
                  ) : (
                    <span className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{user.description || 'No description provided.'}</span>
                  )}
                </div>
              </li>
            )}
          </ul>
        </div>

        {/* Right Column: Impact Stats */}
        <div className="profile-stats-container">
          {isDonor ? (
            <>
              <div className="impact-card glass-card">
                <div className="impact-icon-wrapper donor-icon">
                  <Award size={32} />
                </div>
                <div className="impact-info">
                  <h3>{stats.totalDonations}</h3>
                  <p>Total Donations</p>
                </div>
              </div>

              <div className="impact-card glass-card">
                <div className="impact-icon-wrapper ngo-icon">
                  <Heart size={32} />
                </div>
                <div className="impact-info">
                  <h3>{stats.mealsProvided}</h3>
                  <p>Meals Provided</p>
                </div>
              </div>
            </>
          ) : (
            <div className="impact-card glass-card" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>NGO Dashboard</h3>
              <p style={{ color: 'var(--text-muted)' }}>Welcome to your organization profile. Keep your details updated so Donors can find you easily!</p>
            </div>
          )}
        </div>
      </div>

      {isDonor && (
        <div className="nearby-ngos-section glass-card" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Building size={24} color="var(--primary-color)" /> Nearby NGOs</h2>
          {ngos.length === 0 ? (
            <p className="no-ngos">No NGOs found nearby.</p>
          ) : (
            <div className="ngo-grid">
              {ngos.map(ngo => (
                <div key={ngo.id} className="ngo-card">
                  <h3>{ngo.name}</h3>
                  <p className="ngo-location"><MapPin size={14} /> {ngo.location || 'Location not specified'}</p>
                  <p className="ngo-desc">{ngo.description ? (ngo.description.substring(0, 60) + '...') : 'No description available'}</p>
                  <div className="ngo-contact">
                    {ngo.phone && <span><Phone size={12} /> {ngo.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
