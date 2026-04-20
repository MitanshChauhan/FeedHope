import { useState, useEffect, useContext } from 'react';
import { MapPin, Clock, Tag, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import './NgoDashboard.css';

export default function NgoDashboard() {
  const { user } = useContext(AuthContext);
  const [availableFood, setAvailableFood] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'claims'
  const [claimingId, setClaimingId] = useState(null);
  const [claimQty, setClaimQty] = useState('');
  const [now, setNow] = useState(new Date());

  const socket = useContext(SocketContext);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // 1. Fetch initial available data
    fetch('http://localhost:5000/api/listings')
      .then(res => res.json())
      .then(data => setAvailableFood(data))
      .catch(err => console.error(err));

    // 2. Fetch my claims
    if (user?.id) {
      fetch(`http://localhost:5000/api/listings/ngo/${user.id}`)
        .then(res => res.json())
        .then(data => setMyClaims(data))
        .catch(err => console.error(err));
    }

    // 3. Listen to real-time additions via WebSockets
    if (socket) {
      socket.on('new_listing', (listing) => {
        setAvailableFood(prev => [listing, ...prev]);
      });

      socket.on('listing_updated', ({ id, newAvailable, newStatus }) => {
        if (newStatus === 'Fully Claimed') {
          setAvailableFood(prev => prev.filter(f => f.id !== parseInt(id)));
        } else {
          setAvailableFood(prev => prev.map(f => f.id === parseInt(id) ? { ...f, available_qty: newAvailable, status: newStatus } : f));
        }
      });

      socket.on('claim_updated', ({ id, status }) => {
        setMyClaims(prev => prev.map(c => c.claim_id === parseInt(id) ? { ...c, claim_status: status } : c));
      });
    }

    return () => {
      if (socket) {
        socket.off('new_listing');
        socket.off('listing_updated');
        socket.off('claim_updated');
      }
    };
  }, [socket, user]);

  const submitClaim = async (id, maxQty) => {
    const qty = parseFloat(claimQty);
    if (!qty || qty <= 0 || qty > maxQty) return;

    try {
      const res = await fetch(`http://localhost:5000/api/listings/${id}/claim`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_id: user.id, ngo_name: user?.name || 'NGO', claimed_qty: qty })
      });
      const data = await res.json();

      if (res.ok) {
        const item = availableFood.find(f => f.id === id);
        if (item) {
          const newClaim = {
            ...item,
            claim_id: data.claim_id,
            claimed_qty: qty,
            claim_status: 'Claimed' // Default from server
          };
          setMyClaims(prev => [newClaim, ...prev]);
        }
        setClaimingId(null);
        setClaimQty('');
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (claimId, statusEndpoint, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/claims/${claimId}/${statusEndpoint}`, { method: 'PUT' });
      setMyClaims(prev => prev.map(f => f.claim_id === claimId ? { ...f, claim_status: newStatus } : f));
    } catch (e) {
      console.error(e);
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

  const filteredFood = availableFood.filter(food => 
    food.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    food.donor_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container ngo-container animate-fade-in">
      <div className="ngo-header">
        <div>
          <h1 className="dashboard-title">NGO Dashboard</h1>
          <p className="dashboard-subtitle">Find surplus food and manage your pickups.</p>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Food
        </button>
        <button 
          className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}
          onClick={() => setActiveTab('claims')}
        >
          My Pickups ({myClaims.filter(c => c.status !== 'Completed').length})
        </button>
      </div>

      {activeTab === 'available' && (
        <>
          <div className="filters-bar">
            <div className="search-box">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by food or donor name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary filter-btn">
              <Filter size={20} /> Filters
            </button>
          </div>

          <div className="food-grid">
            {filteredFood.length === 0 ? (
              <div className="empty-state">
                <AlertCircle size={48} className="empty-icon" />
                <h3>No food listings found</h3>
                <p>Try adjusting your search or check back later.</p>
              </div>
            ) : (
              filteredFood.map(item => (
                <div key={item.id} className="food-card">
                  {item.image && (
                    <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <div className="food-card-header">
                      <h3>{item.title}</h3>
                      <span className="distance-badge">Local</span>
                    </div>
                    
                    <div className="food-card-provider">
                      <MapPin size={16} className="detail-icon" />
                      <span>Donated by <strong>{item.donor_name}</strong></span>
                    </div>
                    
                    <div className="food-card-details">
                      <div className="detail-item">
                        <Tag size={16} className="detail-icon" />
                        <span>{item.available_qty} {item.unit} available</span>
                      </div>
                      <div className="detail-item">
                        <Clock size={16} className="detail-icon" />
                        <span className={getTimeRemaining(item.expiry) === 'Expired' ? 'text-danger fw-bold' : 'expiry-text'}>
                          Exp: {getTimeRemaining(item.expiry)}
                        </span>
                      </div>
                    </div>

                    <div className="food-card-action">
                      {claimingId === item.id ? (
                        <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                          <input 
                            type="number" 
                            max={item.available_qty} 
                            min="0.1" 
                            step="0.1"
                            placeholder="Amount"
                            value={claimQty}
                            onChange={(e) => setClaimQty(e.target.value)}
                            style={{flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)'}}
                          />
                          <button className="btn btn-primary" onClick={() => submitClaim(item.id, item.available_qty)}>Confirm</button>
                          <button className="btn btn-secondary" onClick={() => setClaimingId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="btn btn-primary" onClick={() => setClaimingId(item.id)} disabled={getTimeRemaining(item.expiry) === 'Expired'}>
                          Claim Partial/Full
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'claims' && (
        <div className="food-grid">
          {myClaims.length === 0 ? (
            <div className="empty-state">
              <CheckCircle size={48} className="empty-icon text-success" />
              <h3>No active pickups</h3>
              <p>When you claim food, it will appear here for tracking.</p>
            </div>
          ) : (
            myClaims.map(item => (
              <div key={item.claim_id} className={`food-card status-${item.claim_status.replace(/\s+/g, '-').toLowerCase()}`}>
                {item.image && (
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <div className="food-card-header">
                    <h3>{item.title}</h3>
                    <span className={`status-badge ${item.claim_status.toLowerCase()}`}>{item.claim_status}</span>
                  </div>
                  
                  <div className="food-card-provider">
                    <MapPin size={16} className="detail-icon" />
                    <span>Donated by <strong>{item.donor_name}</strong></span>
                  </div>
                  
                  <div className="food-card-details">
                    <div className="detail-item">
                      <Tag size={16} className="detail-icon" />
                      <span>Claimed: {item.claimed_qty} {item.unit}</span>
                    </div>
                  </div>

                  <div className="food-card-action claim-actions">
                    {item.claim_status === 'Claimed' && (
                      <button className="btn btn-secondary w-full" onClick={() => handleStatusUpdate(item.claim_id, 'pickup', 'Picked Up')}>
                        Mark as Picked Up
                      </button>
                    )}
                    {item.claim_status === 'Picked Up' && (
                      <button className="btn btn-primary w-full" onClick={() => handleStatusUpdate(item.claim_id, 'complete', 'Completed')}>
                        Confirm Delivery
                      </button>
                    )}
                    {item.claim_status === 'Completed' && (
                      <button className="btn btn-secondary w-full" disabled>
                        Successfully Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
