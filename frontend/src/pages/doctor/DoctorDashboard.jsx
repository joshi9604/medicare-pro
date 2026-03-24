import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import AddMedicalRecordModal from '../../components/doctor/AddMedicalRecordModal';
import './DoctorDashboard.css';

const statusColors = { pending:'#f59e0b', confirmed:'#1565c0', 'in-progress':'#8b5cf6', completed:'#10b981', cancelled:'#ef4444', 'no-show':'#94a3b8' };

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or null
  const [doctorProfile, setDoctorProfile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aptsRes, statsRes] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/appointments/stats/dashboard')
        ]);
        
        setAppointments(aptsRes.data.appointments);
        setStats(statsRes.data.stats);
        
        // Try to fetch doctor profile, create if doesn't exist
        try {
          const profileRes = await axios.get('/api/doctors/profile/me');
          setDoctorProfile(profileRes.data.doctor);
        } catch (err) {
          if (err.response?.status === 404) {
            // Profile doesn't exist, create it
            try {
              const { data } = await axios.put('/api/doctors/profile/me', {
                specialization: 'General Physician',
                consultationFee: 500,
                telemedicineFee: 300,
                isAvailableOnline: true
              });
              setDoctorProfile(data.doctor);
              toast.success('Profile created! Please complete your details.');
            } catch (createErr) {
              console.error('Failed to create profile:', createErr);
            }
          }
        }
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
      setAppointments(prev => prev.map(a => a._id === id ? data.appointment : a));
      toast.success(`Appointment ${status}! ✅`);
    } catch { toast.error('Update failed'); }
  };

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);
  const todayStr = new Date().toDateString();
  const todayApts = appointments.filter(a => new Date(a.appointmentDate).toDateString() === todayStr);

  return (
    <div className="doctor-dashboard-page">
      {/* Tab Navigation */}
      <div className="doctor-tabs">
        <button 
          className={`doctor-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <>
          <div className="doctor-dashboard-header">
            <div>
              <h1 className="doctor-dashboard-title">Good Day, Dr. {user?.name?.split(' ')[0]}! 👨‍⚕️</h1>
              <p className="doctor-dashboard-sub">You have {todayApts.length} appointments today</p>
            </div>
          </div>

          {/* Stats */}
          <div className="doctor-dashboard-stats-grid">
            {[
              { icon:'📋', label:'Total', value: stats?.total||0, color:'#1565c0' },
              { icon:'⏳', label:'Pending', value: stats?.pending||0, color:'#f59e0b' },
              { icon:'✅', label:'Completed', value: stats?.completed||0, color:'#10b981' },
              { icon:'📅', label:'Today', value: stats?.today||0, color:'#8b5cf6' },
              { icon:'🎥', label:'Video Calls', value: stats?.telemedicine||0, color:'#06b6d4' },
            ].map(st => (
              <div key={st.label} className="doctor-dashboard-stat-card" style={{ borderTop:`3px solid ${st.color}` }}>
                <div style={{ fontSize:'24px' }}>{st.icon}</div>
                <div style={{ fontSize:'26px', fontWeight:'800', color:'#1e293b' }}>{st.value}</div>
                <div style={{ fontSize:'12px', color:'#64748b' }}>{st.label}</div>
              </div>
            ))}
          </div>

          {/* Today's Appointments */}
          {todayApts.length > 0 && (
            <div className="doctor-dashboard-section">
              <h3 className="doctor-dashboard-section-title">🌟 Today's Appointments</h3>
              <div className="doctor-dashboard-apts-grid">
                {todayApts.map(apt => (
                  <div key={apt.id} className="doctor-dashboard-apt-card">
                    <div className="doctor-dashboard-apt-top">
                      <div className="doctor-dashboard-pat-avatar">{apt.patient?.name?.[0]||'P'}</div>
                      <div className="doctor-dashboard-apt-info">
                        <div className="doctor-dashboard-pat-name">{apt.patient?.name}</div>
                        <div className="doctor-dashboard-apt-time">{apt.timeSlot}</div>
                        <span className="doctor-dashboard-type-badge" style={{ background: apt.type==='telemedicine'?'#e0f2fe':'#f0fdf4', color: apt.type==='telemedicine'?'#0277bd':'#15803d' }}>
                          {apt.type==='telemedicine'?'🎥 Video':'🏥 In-Person'}
                        </span>
                      </div>
                      <span className="doctor-dashboard-status-badge" style={{ background: statusColors[apt.status]+'22', color: statusColors[apt.status] }}>
                        {apt.status}
                      </span>
                    </div>
                    {apt.symptoms && <p className="doctor-dashboard-symptoms">💬 {apt.symptoms}</p>}
                    <div className="doctor-dashboard-actions">
                      {apt.status==='pending' && (
                        <>
                          <button className="doctor-dashboard-confirm-btn" onClick={() => updateStatus(apt.id,'confirmed')}>✅ Confirm</button>
                          <button className="doctor-dashboard-cancel-btn" onClick={() => updateStatus(apt.id,'cancelled')}>❌ Cancel</button>
                        </>
                      )}
                      {apt.status==='confirmed' && (
                        <>
                          <button className="doctor-dashboard-confirm-btn" onClick={() => updateStatus(apt.id,'completed')}>🏁 Complete</button>
                          <button className="doctor-dashboard-record-btn" onClick={() => { setSelectedPatient(apt.patient); setShowAddRecord(true); }}>📋 Add Record</button>
                        </>
                      )}
                      {apt.status==='completed' && (
                        <button className="doctor-dashboard-record-btn" onClick={() => { setSelectedPatient(apt.patient); setShowAddRecord(true); }}>📋 Add Record</button>
                      )}
                      {apt.type==='telemedicine' && apt.videoCallLink && (
                        <a href={apt.videoCallLink} target="_blank" rel="noreferrer" className="doctor-dashboard-video-btn">🎥 Join Call</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Appointments */}
          <div className="doctor-dashboard-section">
            <div className="doctor-dashboard-table-header">
              <h3 className="doctor-dashboard-section-title">📋 All Appointments</h3>
              <div className="doctor-dashboard-filter-row">
                {['all','pending','confirmed','completed','cancelled'].map(f => (
                  <button 
                    key={f} 
                    className={`doctor-dashboard-filter-btn ${filter===f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table className="doctor-dashboard-table">
                <thead>
                  <tr>{['Patient','Date & Time','Type','Symptoms','Fee','Status','Actions'].map(h => (
                    <th key={h} className="doctor-dashboard-th">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {filtered.length===0 ? (
                    <tr><td colSpan={7} className="doctor-dashboard-empty-row">No appointments found</td></tr>
                  ) : filtered.map(apt => (
                    <tr key={apt.id} className="doctor-dashboard-tr">
                      <td className="doctor-dashboard-td">
                        <div className="doctor-dashboard-pat-cell">
                          <div className="doctor-dashboard-mini-avatar">{apt.patient?.name?.[0]}</div>
                          <div>
                            <div style={{ fontWeight:'600', fontSize:'13px' }}>{apt.patient?.name}</div>
                            <div style={{ color:'#94a3b8', fontSize:'11px' }}>{apt.patient?.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="doctor-dashboard-td">
                        <div style={{ fontSize:'13px', fontWeight:'600' }}>{new Date(apt.appointmentDate).toLocaleDateString('en-IN')}</div>
                        <div style={{ fontSize:'12px', color:'#64748b' }}>{apt.timeSlot}</div>
                      </td>
                      <td className="doctor-dashboard-td">
                        <span style={{ fontSize:'12px' }}>{apt.type==='telemedicine'?'🎥 Video':'🏥 Clinic'}</span>
                      </td>
                      <td className="doctor-dashboard-td"><span style={{ fontSize:'12px', color:'#64748b' }}>{apt.symptoms?.substring(0,40)||'—'}</span></td>
                      <td className="doctor-dashboard-td"><strong style={{ color:'#1565c0' }}>₹{apt.fee}</strong></td>
                      <td className="doctor-dashboard-td"><span className="doctor-dashboard-status-badge" style={{ background:statusColors[apt.status]+'22', color:statusColors[apt.status] }}>{apt.status}</span></td>
                      <td className="doctor-dashboard-td">
                        <div style={{ display:'flex', gap:'6px' }}>
                          {apt.status==='pending' && (
                            <button className="doctor-dashboard-sm-confirm" onClick={() => updateStatus(apt.id,'confirmed')}>Confirm</button>
                          )}
                          {apt.status==='confirmed' && (
                            <button className="doctor-dashboard-sm-confirm" onClick={() => updateStatus(apt.id,'completed')}>Done</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Medical Record Modal */}
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
