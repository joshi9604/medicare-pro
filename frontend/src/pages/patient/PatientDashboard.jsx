import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, Button, Badge, Skeleton } from '../../components/ui/Card';
import './PatientDashboard.css';

const QuickAction = ({ icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="patient-dashboard-quick-action"
  >
    <div 
      className="patient-dashboard-icon-container"
      style={{
        background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
        borderColor: `${color}30`
      }}
    >
      {icon}
    </div>
    <span className="patient-dashboard-label">{label}</span>
  </button>
);

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/appointments/stats/dashboard'),
      axios.get('/api/appointments?status=confirmed')
    ]).then(([statsRes, aptsRes]) => {
      setStats(statsRes.data.stats);
      setAppointments(aptsRes.data.appointments.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Upcoming', value: stats.confirmed, color: '#1565c0' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  const statusColor = { pending: '#f59e0b', confirmed: '#1565c0', completed: '#10b981', cancelled: '#ef4444', 'in-progress': '#8b5cf6' };

  return (
    <div className="patient-dashboard-page">
      <div className="patient-dashboard-header">
        <div>
          <h1 className="patient-dashboard-greeting">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="patient-dashboard-sub">Here's your health summary</p>
        </div>
        <div className="patient-dashboard-date-box">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '28px' }}>
        <h3 className="patient-dashboard-section-title">⚡ Quick Actions</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <QuickAction icon="🔍" label="Find Doctor" color="#1565c0" onClick={() => window.location.href='/patient/find-doctors'} />
          <QuickAction icon="📅" label="My Appointments" color="#10b981" onClick={() => window.location.href='/patient/appointments'} />
          <QuickAction icon="💊" label="Prescriptions" color="#f59e0b" onClick={() => window.location.href='/patient/prescriptions'} />
          <QuickAction icon="💳" label="Payments" color="#8b5cf6" onClick={() => window.location.href='/patient/payments'} />
        </div>
      </div>

      {/* Stats */}
      <div className="patient-dashboard-stats-grid">
        {loading ? (
          <>
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </>
        ) : (
          <>
            <StatCard icon="📅" label="Total Appointments" value={stats?.total || 0} color="#1565c0" trend={12} />
            <StatCard icon="✅" label="Completed" value={stats?.completed || 0} color="#10b981" trend={8} />
            <StatCard icon="⏰" label="Upcoming" value={stats?.confirmed || 0} color="#f59e0b" />
            <StatCard icon="🎥" label="Telemedicine" value={stats?.telemedicine || 0} color="#8b5cf6" />
          </>
        )}
      </div>

      <div className="patient-dashboard-charts-row">
        {/* Upcoming Appointments */}
        <div className="patient-dashboard-section">
          <h3 className="patient-dashboard-section-title">📅 Upcoming Appointments</h3>
          {appointments.length === 0 ? (
            <div className="patient-dashboard-empty">No upcoming appointments.<br/><span style={{ color: '#1565c0' }}>Book a consultation!</span></div>
          ) : appointments.map(apt => (
            <div key={apt.id} className="patient-dashboard-apt-card">
              <div className="patient-dashboard-apt-avatar">{apt.doctor?.name?.[0] || 'D'}</div>
              <div className="patient-dashboard-apt-info">
                <div className="patient-dashboard-apt-doctor">Dr. {apt.doctor?.name}</div>
                <div className="patient-dashboard-apt-meta">
                  {new Date(apt.appointmentDate).toLocaleDateString('en-IN')} · {apt.timeSlot}
                </div>
                <div className="patient-dashboard-apt-type">{apt.type === 'telemedicine' ? '🎥 Video Call' : '🏥 In-Person'}</div>
              </div>
              <div>
                <span className="patient-dashboard-badge" style={{ background: statusColor[apt.status] + '22', color: statusColor[apt.status] }}>
                  {apt.status}
                </span>
                {apt.type === 'telemedicine' && apt.videoCallLink && (
                  <a href={apt.videoCallLink} target="_blank" rel="noreferrer" className="patient-dashboard-join-btn">Join Call</a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pie chart */}
        <div className="patient-dashboard-section">
          <h3 className="patient-dashboard-section-title">📊 Appointment Breakdown</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                {pieData.map(d => (
                  <span key={d.name} style={{ fontSize: '12px', color: d.color }}>● {d.name}: {d.value}</span>
                ))}
              </div>
            </>
          ) : <div className="patient-dashboard-empty">No data yet. Book your first appointment!</div>}
        </div>
      </div>

      {/* Health Tips */}
      <div className="patient-dashboard-section">
        <h3 className="patient-dashboard-section-title">💡 Health Tips</h3>
        <div className="patient-dashboard-tips-grid">
          {[
            { icon: '💧', tip: 'Drink 8 glasses of water daily', color: '#06b6d4' },
            { icon: '🏃', tip: 'Exercise 30 mins every day', color: '#10b981' },
            { icon: '😴', tip: 'Get 7-8 hours of sleep', color: '#8b5cf6' },
            { icon: '🥗', tip: 'Eat balanced nutritious meals', color: '#f59e0b' },
          ].map(t => (
            <div key={t.tip} className="patient-dashboard-tip-card" style={{ borderTop: `3px solid ${t.color}` }}>
              <span style={{ fontSize: '24px' }}>{t.icon}</span>
              <span style={{ fontSize: '12px', color: '#475569', marginTop: '6px', textAlign: 'center' }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
