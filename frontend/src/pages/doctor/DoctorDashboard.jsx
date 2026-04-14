import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  Stethoscope,
  Video,
  XCircle,
  Clock3,
} from 'lucide-react';
import AddMedicalRecordModal from '../../components/doctor/AddMedicalRecordModal';
import './DoctorDashboard.css';

const statusColors = { pending: '#f59e0b', confirmed: '#1565c0', 'in-progress': '#8b5cf6', completed: '#10b981', cancelled: '#ef4444', 'no-show': '#94a3b8' };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [statFilter, setStatFilter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsResponse, statsResponse] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/appointments/stats/dashboard')
        ]);

        setAppointments(appointmentsResponse.data.appointments);
        setStats(statsResponse.data.stats);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await axios.put(`/api/appointments/${id}/status`, { status });
      setAppointments((prev) => prev.map((appointment) => appointment._id === id ? data.appointment : appointment));
      toast.success(`Appointment ${status}!`);
    } catch {
      toast.error('Update failed');
    }
  };

  const todayString = new Date().toDateString();
  const todayAppointments = appointments.filter((appointment) => new Date(appointment.appointmentDate).toDateString() === todayString);

  const handleStatClick = (label) => {
    const statusMap = {
      Total: 'all',
      Pending: 'pending',
      Completed: 'completed',
      Today: 'today',
      'Video Calls': 'telemedicine'
    };

    const status = statusMap[label];
    navigate(`/doctor/appointments?filter=${status}`, { state: { filterType: status } });
  };

  const getDisplayedAppointments = () => {
    if (statFilter && statFilter !== 'all') {
      if (statFilter === 'today') return todayAppointments;
      if (statFilter === 'telemedicine') return appointments.filter((appointment) => appointment.type === 'telemedicine');
      return appointments.filter((appointment) => appointment.status === statFilter);
    }

    if (filter === 'all') return appointments;
    return appointments.filter((appointment) => appointment.status === filter);
  };

  const displayedAppointments = getDisplayedAppointments();

  const statCards = [
    { icon: <LayoutDashboard size={20} />, label: 'Total', value: stats?.total || 0, color: '#1565c0' },
    { icon: <Clock3 size={20} />, label: 'Pending', value: stats?.pending || 0, color: '#f59e0b' },
    { icon: <CheckCircle2 size={20} />, label: 'Completed', value: stats?.completed || 0, color: '#10b981' },
    { icon: <CalendarDays size={20} />, label: 'Today', value: stats?.today || 0, color: '#8b5cf6' },
    { icon: <Video size={20} />, label: 'Video Calls', value: stats?.telemedicine || 0, color: '#06b6d4' },
  ];

  return (
    <div className="doctor-dashboard-page">
      <div className="doctor-tabs">
        <button className={`doctor-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} type="button">
          <LayoutDashboard size={16} /> Dashboard
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="doctor-dashboard-header">
            <div>
              <h1 className="doctor-dashboard-title">Good Day, Dr. {user?.name?.split(' ')[0]}!</h1>
              <p className="doctor-dashboard-sub">You have {todayAppointments.length} appointments today</p>
            </div>
          </div>

          <div className="doctor-dashboard-stats-grid">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="doctor-dashboard-stat-card doctor-dashboard-stat-card-clickable"
                style={{ borderTop: `3px solid ${card.color}` }}
                onClick={() => handleStatClick(card.label)}
              >
                <div className="doctor-dashboard-stat-icon">{card.icon}</div>
                <div style={{ fontSize: '26px', fontWeight: '800', color: '#1e293b' }}>{card.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{card.label}</div>
              </div>
            ))}
          </div>

          {todayAppointments.length > 0 && (
            <div className="doctor-dashboard-section">
              <h3 className="doctor-dashboard-section-title">Today's Appointments</h3>
              <div className="doctor-dashboard-apts-grid">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="doctor-dashboard-apt-card">
                    <div className="doctor-dashboard-apt-top">
                      <div className="doctor-dashboard-pat-avatar">{appointment.patient?.name?.[0] || 'P'}</div>
                      <div className="doctor-dashboard-apt-info">
                        <div className="doctor-dashboard-pat-name">{appointment.patient?.name}</div>
                        <div className="doctor-dashboard-apt-time">{appointment.timeSlot}</div>
                        <span className="doctor-dashboard-type-badge" style={{ background: appointment.type === 'telemedicine' ? '#e0f2fe' : '#f0fdf4', color: appointment.type === 'telemedicine' ? '#0277bd' : '#15803d' }}>
                          {appointment.type === 'telemedicine' ? <><Video size={14} /> Video</> : <><Stethoscope size={14} /> In-Person</>}
                        </span>
                      </div>
                      <span className="doctor-dashboard-status-badge" style={{ background: statusColors[appointment.status] + '22', color: statusColors[appointment.status] }}>
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.symptoms && <p className="doctor-dashboard-symptoms">{appointment.symptoms}</p>}
                    <div className="doctor-dashboard-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button className="doctor-dashboard-confirm-btn" onClick={() => updateStatus(appointment.id, 'confirmed')} type="button"><CheckCircle2 size={15} /> Confirm</button>
                          <button className="doctor-dashboard-cancel-btn" onClick={() => updateStatus(appointment.id, 'cancelled')} type="button"><XCircle size={15} /> Cancel</button>
                        </>
                      )}
                      {appointment.status === 'confirmed' && (
                        <>
                          <button className="doctor-dashboard-confirm-btn" onClick={() => updateStatus(appointment.id, 'completed')} type="button"><CheckCircle2 size={15} /> Complete</button>
                          <button className="doctor-dashboard-record-btn" onClick={() => { setSelectedPatient(appointment.patient); setShowAddRecord(true); }} type="button"><ClipboardList size={15} /> Add Record</button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <button className="doctor-dashboard-record-btn" onClick={() => { setSelectedPatient(appointment.patient); setShowAddRecord(true); }} type="button"><ClipboardList size={15} /> Add Record</button>
                      )}
                      {appointment.type === 'telemedicine' && appointment.videoCallLink && (
                        <a href={appointment.videoCallLink} target="_blank" rel="noreferrer" className="doctor-dashboard-video-btn">
                          <Video size={15} /> Join Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="doctor-dashboard-section">
            <div className="doctor-dashboard-table-header">
              <h3 className="doctor-dashboard-section-title">
                All Appointments
                {statFilter && (
                  <button className="doctor-dashboard-clear-filter-btn" onClick={() => { setStatFilter(null); setFilter('all'); }} type="button">
                    Clear
                  </button>
                )}
              </h3>
              <div className="doctor-dashboard-filter-row">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((value) => (
                  <button
                    key={value}
                    className={`doctor-dashboard-filter-btn ${filter === value && !statFilter ? 'active' : ''}`}
                    onClick={() => { setFilter(value); setStatFilter(null); }}
                    type="button"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="doctor-dashboard-table">
                <thead>
                  <tr>{['Patient', 'Date & Time', 'Type', 'Symptoms', 'Fee', 'Status', 'Actions'].map((header) => (
                    <th key={header} className="doctor-dashboard-th">{header}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {displayedAppointments.length === 0 ? (
                    <tr><td colSpan={7} className="doctor-dashboard-empty-row">No appointments found</td></tr>
                  ) : displayedAppointments.map((appointment) => (
                    <tr key={appointment.id} className="doctor-dashboard-tr">
                      <td className="doctor-dashboard-td" data-label="Patient">
                        <div className="doctor-dashboard-pat-cell">
                          <div className="doctor-dashboard-mini-avatar">{appointment.patient?.name?.[0]}</div>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '13px' }}>{appointment.patient?.name}</div>
                            <div style={{ color: '#94a3b8', fontSize: '11px' }}>{appointment.patient?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="doctor-dashboard-td" data-label="Date & Time">
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{appointment.timeSlot}</div>
                      </td>
                      <td className="doctor-dashboard-td" data-label="Type">
                        <span style={{ fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {appointment.type === 'telemedicine' ? <Video size={14} /> : <Stethoscope size={14} />}
                          {appointment.type === 'telemedicine' ? 'Video' : 'Clinic'}
                        </span>
                      </td>
                      <td className="doctor-dashboard-td" data-label="Symptoms"><span style={{ fontSize: '12px', color: '#64748b' }}>{appointment.symptoms?.substring(0, 40) || '-'}</span></td>
                      <td className="doctor-dashboard-td" data-label="Fee"><strong style={{ color: '#1565c0' }}>Rs{appointment.fee}</strong></td>
                      <td className="doctor-dashboard-td" data-label="Status"><span className="doctor-dashboard-status-badge" style={{ background: statusColors[appointment.status] + '22', color: statusColors[appointment.status] }}>{appointment.status}</span></td>
                      <td className="doctor-dashboard-td" data-label="Actions">
                        <div className="doctor-dashboard-table-actions">
                          {appointment.status === 'pending' && (
                            <button className="doctor-dashboard-sm-confirm" onClick={() => updateStatus(appointment.id, 'confirmed')} type="button">Confirm</button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <button className="doctor-dashboard-sm-confirm" onClick={() => updateStatus(appointment.id, 'completed')} type="button">Done</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {showAddRecord && selectedPatient && (
            <AddMedicalRecordModal
              patient={selectedPatient}
              onClose={() => { setShowAddRecord(false); setSelectedPatient(null); }}
              onSuccess={() => toast.success('Record added!')}
            />
          )}
        </>
      )}
    </div>
  );
}
