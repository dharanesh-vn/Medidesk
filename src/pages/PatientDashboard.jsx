import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDistanceToNow } from 'date-fns';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/users/doctors'),
      ]);
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/appointments', formData);
      setFormData({ doctorId: '', date: '', reason: '' });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError('Failed to book appointment');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (window.confirm('Cancel this appointment?')) {
      try {
        await api.delete(`/appointments/${appointmentId}`);
        loadData();
      } catch (err) {
        setError('Failed to cancel appointment');
      }
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Appointments</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : 'Book New Appointment'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {showForm && (
          <div className="card mb" style={{ marginBottom: '24px' }}>
            <h3>Book an Appointment</h3>
            <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
              <div className="form-group">
                <label>Select Doctor</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason for Appointment</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Book Appointment
              </button>
            </form>
          </div>
        )}

        <div className="grid">
          {appointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📅</div>
              <h3>No appointments yet</h3>
              <p>Book your first appointment to get started</p>
            </div>
          ) : (
            appointments.map(apt => (
              <div key={apt.id} className="card">
                <div className="card-header">
                  <div>
                    <h4>Dr. {apt.doctor?.name}</h4>
                    <p className="text-muted">{apt.doctor?.email}</p>
                  </div>
                  <span className={`status-badge status-${apt.status?.toLowerCase()}`}>
                    {apt.status}
                  </span>
                </div>
                <div className="card-body">
                  <p><strong>Date:</strong> {new Date(apt.date).toLocaleString()}</p>
                  <p><strong>Reason:</strong> {apt.reason}</p>
                </div>
                <div className="card-footer">
                  {apt.status === 'Scheduled' && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleCancel(apt.id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
