import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecords();
    if (user?.role === 'doctor') {
      loadPatients();
    }
  }, [user, selectedPatient]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/records');
      setRecords(response.data);
    } catch (err) {
      setError('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await api.get('/users/doctors');
      const appointmentsRes = await api.get('/appointments');
      const uniquePatients = [...new Set(appointmentsRes.data.map(a => JSON.stringify(a.patient)))].map(p => JSON.parse(p));
      setPatients(uniquePatients);
    } catch (err) {
      console.error('Failed to load patients');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Medical Records</h1>

        {error && <div className="alert alert-danger">{error}</div>}

        {user?.role === 'doctor' && (
          <div className="card" style={{ marginBottom: '24px' }}>
            <label>Select Patient</label>
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
            >
              <option value="">All Patients</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid">
          {records.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No medical records</h3>
            </div>
          ) : (
            records.map(record => (
              <div key={record.id} className="card">
                <div className="card-header">
                  <div>
                    <h4>{user?.role === 'patient' ? `Dr. ${record.doctor?.name}` : record.patient?.name}</h4>
                    <p className="text-muted">
                      {new Date(record.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="card-body">
                  <div>
                    <strong>Diagnosis:</strong>
                    <p>{record.diagnosis}</p>
                  </div>
                  {record.prescription && (
                    <div>
                      <strong>Prescription:</strong>
                      <p>{record.prescription}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <strong>Notes:</strong>
                      <p>{record.notes}</p>
                    </div>
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
