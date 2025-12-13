import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [doctorActivity, setDoctorActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes, usersRes] = await Promise.all([
        api.get('/reports/stats'),
        api.get('/reports/doctor-activity'),
        api.get('/users'),
      ]);
      setStats(statsRes.data);
      setDoctorActivity(activityRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Delete this user permanently?')) {
      try {
        await api.delete(`/users/${userId}`);
        loadData();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Admin Dashboard</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="grid grid-4" style={{ marginBottom: '40px' }}>
          <div className="stat-card">
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{stats?.totalPatients || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Doctors</div>
            <div className="stat-value">{stats?.totalDoctors || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">This Month</div>
            <div className="stat-value">{stats?.appointmentsThisMonth || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-value">{stats?.completionRate}%</div>
          </div>
        </div>

        <h3 style={{ marginBottom: '16px' }}>Top Doctors by Appointments</h3>
        <div className="card" style={{ marginBottom: '40px' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Appointments</th>
              </tr>
            </thead>
            <tbody>
              {doctorActivity.map(doc => (
                <tr key={doc.doctorName}>
                  <td>{doc.doctorName}</td>
                  <td><strong>{doc.appointmentCount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{ marginBottom: '16px' }}>User Management</h3>
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="status-badge" style={{
                      backgroundColor: u.role === 'admin' ? '#e6f0ff' : u.role === 'doctor' ? '#d4edda' : '#f0f4f8',
                      color: u.role === 'admin' ? '#0066cc' : u.role === 'doctor' ? '#28a745' : '#666'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteUser(u.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
