import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [recordForm, setRecordForm] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
  }, [search]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments', {
        params: search ? { search } : {},
      });
      setAppointments(response.data);
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      loadAppointments();
    } catch (err) {
      setError('Failed to update appointment');
    }
  };

  const handleRecordSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/records', {
        patientId: selectedAppointment.patient_id,
        appointmentId: selectedAppointment.id,
        ...recordForm,
      });
      setRecordForm({ diagnosis: '', prescription: '', notes: '' });
      setSelectedAppointment(null);
      loadAppointments();
    } catch (err) {
      setError('Failed to create medical record');
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
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>
                    <strong>{apt.patient?.name}</strong>
                    <br />
                    <span className="text-muted">{apt.patient?.email}</span>
                  </td>
                  <td>{new Date(apt.date).toLocaleString()}</td>
                  <td>{apt.reason}</td>
                  <td>
                    <span className={`status-badge status-${apt.status?.toLowerCase()}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={apt.status}
                      onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                      style={{ padding: '6px', fontSize: '12px' }}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                    {apt.status === 'Completed' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => setSelectedAppointment(apt)}
                        style={{ marginLeft: '8px' }}
                      >
                        Add Record
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedAppointment && (
          <div className="modal-overlay" onClick={() => setSelectedAppointment(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Create Medical Record</h3>
                <button
                  className="close-btn"
                  onClick={() => setSelectedAppointment(null)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleRecordSubmit}>
                  <div className="form-group">
                    <label>Patient: {selectedAppointment.patient?.name}</label>
                  </div>

                  <div className="form-group">
                    <label>Diagnosis</label>
                    <textarea
                      value={recordForm.diagnosis}
                      onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Prescription</label>
                    <textarea
                      value={recordForm.prescription}
                      onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <textarea
                      value={recordForm.notes}
                      onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })}
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Record
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
