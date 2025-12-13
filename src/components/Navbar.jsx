import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      const unread = response.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          MediDesk
        </Link>
        <ul className="navbar-nav">
          {user.role === 'patient' && (
            <>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/records">Medical Records</Link></li>
            </>
          )}
          {user.role === 'doctor' && (
            <>
              <li><Link to="/dashboard">My Appointments</Link></li>
              <li><Link to="/records">Records</Link></li>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <li><Link to="/dashboard">Admin Panel</Link></li>
              <li><Link to="/records">Records</Link></li>
            </>
          )}
        </ul>
        <div className="navbar-user">
          <div className="notification-bell">
            🔔
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          <span>{user.name}</span>
          <Link to="/profile" className="btn btn-sm btn-secondary">Profile</Link>
          <button className="btn btn-sm btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
