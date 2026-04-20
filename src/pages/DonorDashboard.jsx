import { useState, useEffect, useContext } from 'react';
import { Plus, Clock, Tag, MapPin, CheckCircle2, Truck, PackageCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext';
import './DonorDashboard.css';

export default function DonorDashboard() {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [donations, setDonations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', qty: '', unit: 'kg', expiry: '', image: '' });
  const [now, setNow] = useState(new Date());

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000); // UI update every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/listings/user/${user.id}`)
        .then(res => res.json())
        .then(data => setDonations(data))
        .catch(err => console.error(err));
    }

    if (socket) {
      const handleListingUpdated = ({ id, newAvailable, newStatus }) => {
        setDonations(prev => prev.map(item => 
          item.id === parseInt(id) 
            ? { ...item, available_qty: newAvailable, status: newStatus } 
            : item
        ));
      };

      const handleClaimUpdated = ({ id, status }) => {
        setDonations(prev => prev.map(item => ({
          ...item,
          claims: item.claims?.map(claim => 
            claim.id === parseInt(id) ? { ...claim, status } : claim
          ) || []
        })));
      };
      
      socket.on('listing_updated', handleListingUpdated);
      socket.on('claim_updated', handleClaimUpdated);

      return () => {
        socket.off('listing_updated', handleListingUpdated);
        socket.off('claim_updated', handleClaimUpdated);
      };
    }
  }, [user, socket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.qty) return;
    
    try {
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          donor_id: user.id,
          donor_name: user.name,
        }),
      });

      if (response.ok) {
        const { listing } = await response.json();
        setDonations([listing, ...donations]);
        setFormData({ title: '', qty: '', unit: 'kg', expiry: '', image: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create listing', error);
    }
  };

  const getTimeRemaining = (expiryStr) => {
    if (!expiryStr || isNaN(Date.parse(expiryStr))) return expiryStr || 'N/A';
    const expiry = new Date(expiryStr);
    const diff = expiry - now;
    if (diff <= 0) return 'Expired';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m remaining`;
  };

  return (
    <div className="container donor-container animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Donor Dashboard</h1>
          <p className="dashboard-subtitle">Manage your food listings and impact.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={20} /> New Listing
        </button>
      </div>

      {showForm && (
        <form className="donation-form glass-card animate-fade-in" onSubmit={handleSubmit}>
          <h3>Post a New Donation</h3>
          <div className="form-group">
            <label>What are you donating?</label>
            <input 
              type="text" 
              placeholder="e.g. 10 Boxes of Veg Biryani"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Food Image (Optional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
            />
            {formData.image && <img src={formData.image} alt="Preview" style={{ marginTop: '10px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />}
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Amount</label>
              <input 
                type="number" 
                min="0.1"
                step="0.1"
                placeholder="e.g. 10"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Unit</label>
              <select 
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                <option value="kg">kg</option>
                <option value="boxes">boxes</option>
                <option value="servings">servings</option>
                <option value="liters">liters</option>
                <option value="packets">packets</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Exact Expiry Time</label>
              <input 
                type="datetime-local"
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Publish Listing</button>
          </div>
        </form>
      )}

      <div className="donations-list">
        <h2>Your Recent Listings</h2>
        <div className="list-grid">
          {donations.map(item => (
            <div key={item.id} className="donation-card">
              {item.image && (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              )}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <div className="card-header">
                  <h4>{item.title}</h4>
                  <span className={`status-badge ${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                    {item.status === 'Claimed' && <CheckCircle2 size={14} className="status-icon" />}
                    {item.status === 'Picked Up' && <Truck size={14} className="status-icon" />}
                    {item.status === 'Completed' && <PackageCheck size={14} className="status-icon" />}
                    {item.status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="detail-row">
                    <Tag size={16} className="detail-icon" />
                    <span>
                      {item.available_qty < item.original_qty ? (
                        <b>{item.available_qty} {item.unit} left</b>
                      ) : (
                        <>{item.original_qty || item.qty} {item.unit}</>
                      )}
                      {item.available_qty < item.original_qty && ` (from ${item.original_qty})`}
                    </span>
                  </div>
                  <div className="detail-row">
                    <Clock size={16} className="detail-icon" />
                    <span className={getTimeRemaining(item.expiry) === 'Expired' ? 'text-danger fw-bold' : ''}>
                      {getTimeRemaining(item.expiry)}
                    </span>
                  </div>
                  
                  {item.claims && item.claims.length > 0 && (
                    <div className="claims-section">
                      <h5 style={{fontSize:'0.85rem', marginTop: '15px', marginBottom: '8px', color: 'var(--text-secondary)'}}>Claims by NGOs:</h5>
                      <ul style={{listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem'}}>
                        {item.claims.map(claim => (
                          <li key={claim.id} style={{display: 'flex', justifyContent: 'space-between', padding: '6px', background: 'var(--bg-light)', borderRadius: '4px', marginBottom: '4px'}}>
                            <span><strong>{claim.ngo_name}</strong> took {claim.claimed_qty} {item.unit}</span>
                            <span className={`status-badge ${claim.status.replace(/\s+/g, '-').toLowerCase()}`} style={{fontSize: '0.7rem', padding: '2px 6px'}}>
                              {claim.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
