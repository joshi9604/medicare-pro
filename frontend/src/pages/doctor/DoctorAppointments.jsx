import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Stethoscope,
  Video,
  XCircle,
  Users,
  Eraser,
} from 'lucide-react';
import './DoctorAppointments.css';

export default function DoctorAppointments() {
  const location = useLocation();
  const navigate = useNavigate();
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
    const searchParams = new URLSearchParams(location.search);
    const urlFilter = searchParams.get('filter');
    const stateFilter = location.state?.filter;
    const stateFilterType = location.state?.filterType;
    setFilter(urlFilter || stateFilter || stateFilterType || 'all');
  }, [location]);

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
      await axios.put(`/api/appointments/${id}/status`, { status });
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

  const submitPrescription = async (event) => {
    event.preventDefault();
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

  const isMyPatients = filter === 'completed';

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((appointment) => {
      if (filter === 'today') {
        return new Date(appointment.appointmentDate).toDateString() === new Date().toDateString();
      }
      if (filter === 'telemedicine') {
        return appointment.type === 'telemedicine';
      }
      return appointment.status === filter;
    });

  const todayString = new Date().toDateString();
  const todayAppointments = appointments.filter((appointment) => new Date(appointment.appointmentDate).toDateString() === todayString);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const clearFilter = () => {
    setFilter('all');
    navigate('/doctor/appointments', { replace: true });
  };

  if (loading) {
    return (
      <div className="doctor-appointments-page">
        <h1 className="doctor-appointments-title"><CalendarDays size={24} /> My Appointments</h1>
        <div className="doctor-appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="doctor-appointments-page">
      <div className="doctor-appointments-header">
        <h1 className="doctor-appointments-title">
          {isMyPatients ? <><Users size={24} /> My Patients</> : <><CalendarDays size={24} /> My Appointments</>}
        </h1>
        <p className="doctor-appointments-subtitle">
          {isMyPatients ? `${filteredAppointments.length} completed patients` : 'All your appointments'}
          {filter !== 'all' && (
            <button
              onClick={clearFilter}
              className="doctor-appointments-clear-filter-btn"
              type="button"
            >
              <Eraser size={15} />
            </button>
          )}
        </p>
      </div>

      {!isMyPatients && (
        <>
          <div className="doctor-appointments-stats-grid">
            <div className="doctor-appointments-stat-card doctor-appointments-stat-card-clickable" onClick={() => { setFilter('today'); navigate('/doctor/appointments?filter=today'); }}>
              <div className="doctor-appointments-stat-value">{todayAppointments.length}</div>
              <div className="doctor-appointments-stat-label">Today's Appointments</div>
            </div>
            <div className="doctor-appointments-stat-card doctor-appointments-stat-card-clickable" onClick={() => { setFilter('pending'); navigate('/doctor/appointments?filter=pending'); }}>
              <div className="doctor-appointments-stat-value">{appointments.filter((appointment) => appointment.status === 'pending').length}</div>
              <div className="doctor-appointments-stat-label">Pending</div>
            </div>
            <div className="doctor-appointments-stat-card doctor-appointments-stat-card-clickable" onClick={() => { setFilter('confirmed'); navigate('/doctor/appointments?filter=confirmed'); }}>
              <div className="doctor-appointments-stat-value">{appointments.filter((appointment) => appointment.status === 'confirmed').length}</div>
              <div className="doctor-appointments-stat-label">Confirmed</div>
            </div>
            <div className="doctor-appointments-stat-card doctor-appointments-stat-card-clickable" onClick={() => { setFilter('completed'); navigate('/doctor/appointments?filter=completed'); }}>
              <div className="doctor-appointments-stat-value">{appointments.filter((appointment) => appointment.status === 'completed').length}</div>
              <div className="doctor-appointments-stat-label">Completed</div>
            </div>
          </div>

          <div className="doctor-appointments-filter-container">
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => { setFilter(status); navigate(`/doctor/appointments?filter=${status}`); }}
                className={`doctor-appointments-filter-btn ${status}${filter === status ? ' active' : ''}`}
                type="button"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      {isMyPatients ? (
        filteredAppointments.length === 0 ? (
          <div className="doctor-appointments-empty">No completed patients found</div>
        ) : (
          <div className="doctor-appointments-patients-grid">
            {Array.from(new Map(filteredAppointments.map((appointment) => [appointment.patientId, appointment])).values()).map((appointment) => (
              <div key={appointment.patientId} className="doctor-appointments-patient-card">
                <div className="doctor-appointments-patient-card-avatar">{appointment.patient?.name?.[0] || 'P'}</div>
                <div className="doctor-appointments-patient-card-info">
                  <div className="doctor-appointments-patient-card-name">{appointment.patient?.name}</div>
                  <div className="doctor-appointments-patient-card-phone">{appointment.patient?.phone || '-'}</div>
                  <div className="doctor-appointments-patient-card-visits">{filteredAppointments.filter((item) => item.patientId === appointment.patientId).length} visit(s)</div>
                  <div className="doctor-appointments-patient-card-last">Last: {formatDate(appointment.appointmentDate)}</div>
                </div>
                <div className="doctor-appointments-patient-card-actions">
                  <span className="doctor-appointments-patient-card-badge">Completed</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        filteredAppointments.length === 0 ? (
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
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="doctor-appointments-tr">
                    <td className="doctor-appointments-td" data-label="Patient">
                      <div className="doctor-appointments-patient-cell">
                        <div className="doctor-appointments-avatar">{appointment.patient?.name?.[0] || 'P'}</div>
                        <div>
                          <div className="doctor-appointments-patient-name">{appointment.patient?.name}</div>
                          <div className="doctor-appointments-patient-phone">{appointment.patient?.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="doctor-appointments-td" data-label="Date & Time">
                      <div className="doctor-appointments-date">{formatDate(appointment.appointmentDate)}</div>
                      <div className="doctor-appointments-time">{appointment.timeSlot}</div>
                    </td>
                    <td className="doctor-appointments-td" data-label="Type">
                      <span className="doctor-appointments-type-badge">
                        {appointment.type === 'telemedicine' ? <><Video size={14} /> Video</> : <><Stethoscope size={14} /> Clinic</>}
                      </span>
                    </td>
                    <td className="doctor-appointments-td" data-label="Symptoms">
                      <div className="doctor-appointments-symptoms">{appointment.symptoms || '-'}</div>
                    </td>
                    <td className="doctor-appointments-td" data-label="Status">
                      <span className={`doctor-appointments-status-badge doctor-appointments-status-${appointment.status}`}>{appointment.status}</span>
                    </td>
                    <td className="doctor-appointments-td" data-label="Actions">
                      <div className="doctor-appointments-actions">
                        {appointment.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(appointment.id, 'confirmed')} className="doctor-appointments-action-btn doctor-appointments-action-btn-confirm" type="button"><CheckCircle2 size={14} /> Confirm</button>
                            <button onClick={() => updateStatus(appointment.id, 'cancelled')} className="doctor-appointments-action-btn doctor-appointments-action-btn-cancel" type="button"><XCircle size={14} /> Cancel</button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <>
                            <button onClick={() => updateStatus(appointment.id, 'completed')} className="doctor-appointments-action-btn doctor-appointments-action-btn-complete" type="button"><CheckCircle2 size={14} /> Complete</button>
                            {appointment.type === 'telemedicine' && appointment.videoCallLink && (
                              <a href={appointment.videoCallLink} target="_blank" rel="noreferrer" className="doctor-appointments-action-btn doctor-appointments-action-btn-video">
                                <Video size={14} /> Join Call
                              </a>
                            )}
                          </>
                        )}
                        {appointment.status === 'completed' && !appointment.prescription && (
                          <button onClick={() => setSelectedAppointment(appointment)} className="doctor-appointments-action-btn doctor-appointments-action-btn-rx" type="button"><ClipboardList size={14} /> Write Rx</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {selectedAppointment && (
        <div className="doctor-appointments-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedAppointment(null)}>
          <div className="doctor-appointments-modal">
            <h2 className="doctor-appointments-modal-title">Write Prescription</h2>
            <p className="doctor-appointments-modal-subtitle">Patient: {selectedAppointment.patient?.name}</p>
            <form onSubmit={submitPrescription}>
              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Diagnosis</label>
                <textarea value={prescriptionData.diagnosis} onChange={(event) => setPrescriptionData({ ...prescriptionData, diagnosis: event.target.value })} className="doctor-appointments-input doctor-appointments-input-textarea" required />
              </div>
              <div className="doctor-appointments-medicines-section">
                <label className="doctor-appointments-label">Medicines</label>
                {prescriptionData.medicines.map((medicine, index) => (
                  <div key={index} className="doctor-appointments-medicine-row">
                    <input placeholder="Medicine name" value={medicine.name} onChange={(event) => handleMedicineChange(index, 'name', event.target.value)} className="doctor-appointments-med-input" />
                    <input placeholder="Dosage" value={medicine.dosage} onChange={(event) => handleMedicineChange(index, 'dosage', event.target.value)} className="doctor-appointments-med-input doctor-appointments-med-input-small" />
                    <input placeholder="Frequency" value={medicine.frequency} onChange={(event) => handleMedicineChange(index, 'frequency', event.target.value)} className="doctor-appointments-med-input doctor-appointments-med-input-medium" />
                    <input placeholder="Duration" value={medicine.duration} onChange={(event) => handleMedicineChange(index, 'duration', event.target.value)} className="doctor-appointments-med-input doctor-appointments-med-input-small" />
                  </div>
                ))}
                <button type="button" onClick={handleAddMedicine} className="doctor-appointments-add-btn">+ Add Medicine</button>
              </div>
              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Advice</label>
                <textarea value={prescriptionData.advice} onChange={(event) => setPrescriptionData({ ...prescriptionData, advice: event.target.value })} className="doctor-appointments-input doctor-appointments-input-textarea" style={{ height: '60px' }} />
              </div>
              <div className="doctor-appointments-form-group">
                <label className="doctor-appointments-label">Follow-up Date</label>
                <input type="date" value={prescriptionData.followUpDate} onChange={(event) => setPrescriptionData({ ...prescriptionData, followUpDate: event.target.value })} className="doctor-appointments-input" />
              </div>
              <div className="doctor-appointments-modal-actions">
                <button type="button" onClick={() => setSelectedAppointment(null)} className="doctor-appointments-cancel-btn">Cancel</button>
                <button type="submit" className="doctor-appointments-submit-btn">Save Prescription</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
