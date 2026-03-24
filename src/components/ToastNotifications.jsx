import { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import { Bell, X } from 'lucide-react';
import './ToastNotifications.css';

export default function ToastNotifications() {
  const socket = useContext(SocketContext);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const addToast = (message, type = 'info') => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000); // Auto remove after 5s
    };

    socket.on('listing_claimed', () => addToast('A food listing was just claimed!', 'success'));
    socket.on('listing_pickedup', () => addToast('A food listing has been picked up!', 'info'));
    socket.on('listing_completed', () => addToast('A food delivery was successfully completed!', 'success'));
    socket.on('new_listing', (listing) => addToast(`New donation available: ${listing.title}`, 'new'));

    return () => {
      socket.off('listing_claimed');
      socket.off('listing_pickedup');
      socket.off('listing_completed');
      socket.off('new_listing');
    };
  }, [socket]);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-card toast-${toast.type} animate-slide-in`}>
          <div className="toast-icon-wrapper">
            <Bell size={18} />
          </div>
          <div className="toast-content">
            <p>{toast.message}</p>
          </div>
          <button className="toast-close" onClick={() => removeToast(toast.id)}>
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
