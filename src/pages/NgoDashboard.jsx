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
  
  const socket = useContext(SocketContext);

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

      socket.on('listing_claimed', (id) => {
        setAvailableFood(prev => prev.filter(f => f.id !== parseInt(id)));
      });

      // No need to listen to pickup/complete for NgoDashboard available list 
      // as they are already removed when claimed.
    }

    return () => {
      if (socket) {
        socket.off('new_listing');
        socket.off('listing_claimed');
      }
    };
  }, [socket, user]);

  const handleClaim = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/listings/${id}/claim`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ngo_id: user.id })
      });
      // Move to myClaims locally
      const item = availableFood.find(f => f.id === id);
      if (item) {
        setMyClaims(prev => [{ ...item, status: 'Claimed' }, ...prev]);
        setAvailableFood(prev => prev.filter(f => f.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusUpdate = async (id, statusEndpoint, newStatus) => {
    try {
      await fetch(`http://localhost:5000/api/listings/${id}/${statusEndpoint}`, { method: 'PUT' });
      // Update locally
      setMyClaims(prev => prev.map(f => f.id === id ? { ...f, status: newStatus } : f));
    } catch (e) {
      console.error(e);
    }
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
                      <span>{item.qty}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} className="detail-icon" />
                      <span className="expiry-text">Exp: {item.expiry}</span>
                    </div>
                  </div>

                  <div className="food-card-action">
                    <button className="btn btn-primary" onClick={() => handleClaim(item.id)}>
                      Claim Food
                    </button>
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
              <div key={item.id} className={`food-card status-${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                <div className="food-card-header">
                  <h3>{item.title}</h3>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
                
                <div className="food-card-provider">
                  <MapPin size={16} className="detail-icon" />
                  <span>Donated by <strong>{item.donor_name}</strong></span>
                </div>
                
                <div className="food-card-details">
                  <div className="detail-item">
                    <Tag size={16} className="detail-icon" />
                    <span>{item.qty}</span>
                  </div>
                </div>

                <div className="food-card-action claim-actions">
                  {item.status === 'Claimed' && (
                    <button className="btn btn-secondary w-full" onClick={() => handleStatusUpdate(item.id, 'pickup', 'Picked Up')}>
                      Mark as Picked Up
                    </button>
                  )}
                  {item.status === 'Picked Up' && (
                    <button className="btn btn-primary w-full" onClick={() => handleStatusUpdate(item.id, 'complete', 'Completed')}>
                      Confirm Delivery
                    </button>
                  )}
                  {item.status === 'Completed' && (
                    <button className="btn btn-secondary w-full" disabled>
                      Successfully Delivered
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
