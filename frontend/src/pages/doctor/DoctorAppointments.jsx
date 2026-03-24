import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DoctorAppointments.css';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    advice: '',
    followUpDate: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/appointments');
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetchAppointments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddMedicine = () => {
    setPrescriptionData({
      ...prescriptionData,
      medicines: [...prescriptionData.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][field] = value;
    setPrescriptionData({ ...prescriptionData, medicines: newMedicines });
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/prescriptions', {
        appointmentId: selectedAppointment.id,
        patientId: selectedAppointment.patientId,
        ...prescriptionData
      });
      toast.success('Prescription created successfully');
      setSelectedAppointment(null);
      setPrescriptionData({
        diagnosis: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        advice: '',
        followUpDate: ''
      });
    } catch (err) {
      toast.error('Failed to create prescription');
    }
  };

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter(a => a.status === filter);

  const todayStr = new Date().toDateString();
  const todayAppointments = appointments.filter(a =>
    new Date(a.appointmentDate).toDateString() === todayStr
  );

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="doctor-appointments-page">
        <h1 className="doctor-appointments-title">📅 My Appointments</h1>
        <div className="doctor-appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">
      <div className="doctor-appointments-header">
        <h1 className="doctor-appointments-title">📅 My Appointments</h1>
        <p className="doctor-appointments-subtitle">Manage your patient appointments</p>
      </div>

      {/* Stats */}
      <div className="doctor-appointments-stats-grid">
        <div className="doctor-appointments-stat-card">
          <div className="doctor-appointments-stat-value">{todayAppointments.length}</div>
          <div className="doctor-appointments-stat-label">Today's Appointments</div>
        </div>
        <div className="doctor-appointments-stat-card">
          <div className="doctor-appointments-stat-value">{appointments.filter(a => a.status === 'pending').length}</div>
          <div className="doctor-appointments-stat-label">Pending</div>
        </div>
        <div className="doctor-appointments-stat-card">
          <div className="doctor-appointments-stat-value">{appointments.filter(a => a.status === 'confirmed').length}</div>
          <div className="doctor-appointments-stat-label">Confirmed</div>
        </div>
        <div className="doctor-appointments-stat-card">
          <div className="doctor-appointments-stat-value">{appointments.filter(a => a.status === 'completed').length}</div>
          <div className="doctor-appointments-stat-label">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="doctor-appointments-filter-container">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`doctor-appointments-filter-btn ${status}${filter === status ? ' active' : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      {filteredAppointments.length === 0 ? (
        <div className="doctor-appointments-empty">No appointments found</div>
      ) : (
        <div className="doctor-appointments-table-container">
          <table className="doctor-appointments-table">
            <thead>
              <tr>
                <th className="doctor-appointments-th">Patient</th>
                <th className="doctor-appointments-th">Date & Time</th>
                <th className="doctor-appointments-th">Type</th>
                <th className="doctor-appointments-th">Symptoms</th>
                <th className="doctor-appointments-th">Status</th>
                <th className="doctor-appointments-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id} className="doctor-appointments-tr">
                  <td className="doctor-appointments-td">
                    <div className="doctor-appointments-patient-cell">
                      <div className="doctor-appointments-avatar">{apt.patient?.name?.[0] || 'P'}</div>
                      <div>
                        <div className="doctor-appointments-patient-name">{apt.patient?.name}</div>
                        <div className="doctor-appointments-patient-phone">{apt.patient?.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="doctor-appointments-td">
                    <div className="doctor-appointments-date">{formatDate(apt.appointmentDate)}</div>
                    <div className="doctor-appointments-time">{apt.timeSlot}</div>
                  </td>
                  <td className="doctor-appointments-td">
                    <span className="doctor-appointments-type-badge">
                      {apt.type === 'telemedicine' ? '🎥 Video' : '🏥 Clinic'}
                    </span>
                  </td>
                  <td className="doctor-appointments-td">
                    <div className="doctor-appointments-symptoms">{apt.symptoms || '—'}</div>
                  </td>
                  <td className="doctor-appointments-td">
                    <span className={`doctor-appointments-status-badge doctor-appointments-status-${apt.status}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="doctor-appointments-td">
                    <div className="doctor-appointments-actions">
                      {apt.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'confirmed')}
                            className="doctor-appointments-action-btn doctor-appointments-action-btn-confirm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => updateStatus(apt.id, 'cancelled')}
                            className="doctor-appointments-action-btn doctor-appointments-action-btn-cancel"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {apt.status === 'confirmed' && (
                        <>
                          <button
                            onClick={() => updateStatus(apt.id, 'completed')}
                            className="doctor-appointments-action-btn doctor-appointments-action-btn-complete"
                          >
                            Complete
                          </button>
                          {apt.type === 'telemedicine' && apt.videoCallLink && (
                            <a
                              href={apt.videoCallLink}
                              target="_blank"
                              rel="noreferrer"
                              className="doctor-appointments-action-btn doctor-appointments-action-btn-video"
                            >
                              Join Call
                            </a>
                          )}
                        </>
                      )}
                      {apt.status === 'completed' && !apt.prescription && (
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="doctor-appointments-action-btn doctor-appointments-action-btn-rx"
                        >
                          Write Rx
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Prescription Modal */}
      {selectedAppointment && (
        <div className="doctor-appointments-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedAppointment(null)}>
          <div className="doctor-appointments-modal">
            <h2 className="doctor-appointments-modal-title">Write Prescription</h2>
            <p className="doctor-appointments-modal-subtitle">Patient: {selectedAppointment.patient?.name}</p>

            <form onSubmit={submitPrescription}>
              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Diagnosis</label>
                <textarea
                  value={prescriptionData.diagnosis}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, diagnosis: e.target.value })}
                  className="doctor-appointments-input doctor-appointments-input-textarea"
                  required
                />
              </div>

              <div className="doctor-appointments-medicines-section">
                <label className="doctor-appointments-label">Medicines</label>
                {prescriptionData.medicines.map((med, index) => (
                  <div key={index} className="doctor-appointments-medicine-row">
                    <input
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                      className="doctor-appointments-med-input"
                    />
                    <input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                      className="doctor-appointments-med-input doctor-appointments-med-input-small"
                    />
                    <input
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                      className="doctor-appointments-med-input doctor-appointments-med-input-medium"
                    />
                    <input
                      placeholder="Duration"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                      className="doctor-appointments-med-input doctor-appointments-med-input-small"
                    />
                  </div>
                ))}
                <button type="button" onClick={handleAddMedicine} className="doctor-appointments-add-btn">
                  + Add Medicine
                </button>
              </div>

              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Advice</label>
                <textarea
                  value={prescriptionData.advice}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, advice: e.target.value })}
                  className="doctor-appointments-input doctor-appointments-input-textarea"
                  style={{ height: '60px' }}
                />
              </div>

              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Follow-up Date</label>
                <input
                  type="date"
                  value={prescriptionData.followUpDate}
                  onChange={(e) => setPrescriptionData({ ...prescriptionData, followUpDate: e.target.value })}
                  className="doctor-appointments-input"
                />
              </div>

              <div className="doctor-appointments-modal-actions">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="doctor-appointments-cancel-btn"
                >
                  Cancel
                </button>
                <button type="submit" className="doctor-appointments-submit-btn">
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
