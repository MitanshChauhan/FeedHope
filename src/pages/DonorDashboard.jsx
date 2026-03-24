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
  const [formData, setFormData] = useState({ title: '', qty: '', expiry: '' });

  useEffect(() => {
    if (user?.id) {
      fetch(`http://localhost:5000/api/listings/user/${user.id}`)
        .then(res => res.json())
        .then(data => setDonations(data))
        .catch(err => console.error(err));
    }

    if (socket) {
      const updateStatus = (id, status) => {
        setDonations(prev => prev.map(item => item.id === parseInt(id) ? { ...item, status } : item));
      };
      
      socket.on('listing_claimed', (id) => updateStatus(id, 'Claimed'));
      socket.on('listing_pickedup', (id) => updateStatus(id, 'Picked Up'));
      socket.on('listing_completed', (id) => updateStatus(id, 'Completed'));

      return () => {
        socket.off('listing_claimed');
        socket.off('listing_pickedup');
        socket.off('listing_completed');
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
        setFormData({ title: '', qty: '', expiry: '' });
        setShowForm(false);
      }
    } catch (error) {
      console.error('Failed to create listing', error);
    }
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
          <div className="form-row">
            <div className="form-group">
              <label>Quantity / Servings</label>
              <input 
                type="text" 
                placeholder="e.g. 10 people"
                value={formData.qty}
                onChange={(e) => setFormData({...formData, qty: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Expires In</label>
              <select 
                value={formData.expiry}
                onChange={(e) => setFormData({...formData, expiry: e.target.value})}
              >
                <option value="">Select time</option>
                <option value="1 hour">1 hour</option>
                <option value="3 hours">3 hours</option>
                <option value="End of day">End of day</option>
                <option value="Tomorrow">Tomorrow</option>
              </select>
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
                  <span>{item.qty}</span>
                </div>
                <div className="detail-row">
                  <Clock size={16} className="detail-icon" />
                  <span>Expires in: {item.expiry || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
