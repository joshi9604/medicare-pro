import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Clock3,
  CreditCard,
  Dumbbell,
  GlassWater,
  MoonStar,
  PieChart,
  Search,
  Stethoscope,
  Video,
  FileText,
  Salad,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Tooltip } from 'recharts';
import { StatCard, Skeleton } from '../../components/ui/Card';
import './PatientDashboard.css';

const QUICK_ACTIONS = [
  { icon: Search, label: 'Find Doctor', color: '#1565c0', to: '/patient/find-doctors' },
  { icon: CalendarDays, label: 'My Appointments', color: '#10b981', to: '/patient/appointments' },
  { icon: FileText, label: 'Prescriptions', color: '#f59e0b', to: '/patient/prescriptions' },
  { icon: CreditCard, label: 'Payments', color: '#7c3aed', to: '/patient/payments' },
];

const HEALTH_TIPS = [
  { icon: GlassWater, tip: 'Drink 8 glasses of water daily', color: '#06b6d4' },
  { icon: Dumbbell, tip: 'Exercise 30 mins every day', color: '#10b981' },
  { icon: MoonStar, tip: 'Get 7-8 hours of sleep', color: '#7c3aed' },
  { icon: Salad, tip: 'Eat balanced nutritious meals', color: '#f59e0b' },
];

function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button onClick={onClick} className="patient-dashboard-quick-action" type="button">
      <div
        className="patient-dashboard-icon-container"
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          borderColor: `${color}30`,
          color,
        }}
      >
        <Icon size={24} />
      </div>
      <span className="patient-dashboard-label">{label}</span>
    </button>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/appointments/stats/dashboard'),
      axios.get('/api/appointments?status=confirmed')
    ])
      .then(([statsRes, appointmentsRes]) => {
        setStats(statsRes.data.stats);
        setAppointments(appointmentsRes.data.appointments.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const pieData = stats ? [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'Upcoming', value: stats.confirmed, color: '#1565c0' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
  ].filter((item) => item.value > 0) : [];

  const statusColor = {
    pending: '#f59e0b',
    confirmed: '#1565c0',
    completed: '#10b981',
    cancelled: '#ef4444',
    'in-progress': '#8b5cf6'
  };

  const statCards = [
    { icon: <CalendarDays size={22} />, label: 'Total Appointments', value: stats?.total || 0, color: '#1565c0', trend: 12 },
    { icon: <CheckCircle2 size={22} />, label: 'Completed', value: stats?.completed || 0, color: '#10b981', trend: 8 },
    { icon: <Clock3 size={22} />, label: 'Upcoming', value: stats?.confirmed || 0, color: '#f59e0b' },
    { icon: <Video size={22} />, label: 'Telemedicine', value: stats?.telemedicine || 0, color: '#8b5cf6' },
  ];

  return (
    <div className="patient-dashboard-page">
      <div className="patient-dashboard-header">
        <div className="patient-dashboard-intro">
          <span className="patient-dashboard-kicker">Your care overview</span>
          <h1 className="patient-dashboard-greeting">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="patient-dashboard-sub">Track appointments, connect with doctors, and stay ahead of your routine.</p>
        </div>
        <div className="patient-dashboard-date-box">
          <CalendarDays size={16} />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <section className="patient-dashboard-section patient-dashboard-section-compact">
        <div className="patient-dashboard-section-heading">
          <h3 className="patient-dashboard-section-title">Quick Actions</h3>
        </div>
        <div className="patient-dashboard-quick-grid">
          {QUICK_ACTIONS.map((action) => (
            <QuickAction
              key={action.label}
              icon={action.icon}
              label={action.label}
              color={action.color}
              onClick={() => navigate(action.to)}
            />
          ))}
        </div>
      </section>

      <div className="patient-dashboard-stats-grid">
        {loading ? (
          <>
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
            <Skeleton height="120px" />
          </>
        ) : (
          statCards.map((card) => <StatCard key={card.label} {...card} />)
        )}
      </div>

      <div className="patient-dashboard-charts-row">
        <section className="patient-dashboard-section">
          <div className="patient-dashboard-section-heading">
            <h3 className="patient-dashboard-section-title">Upcoming Appointments</h3>
            <Stethoscope size={17} className="patient-dashboard-title-icon" />
          </div>
          {appointments.length === 0 ? (
            <div className="patient-dashboard-empty">
              No upcoming appointments.
              <span>Book a consultation to see it here.</span>
            </div>
          ) : appointments.map((appointment) => (
            <div key={appointment.id} className="patient-dashboard-apt-card">
              <div className="patient-dashboard-apt-avatar">{appointment.doctor?.name?.[0] || 'D'}</div>
              <div className="patient-dashboard-apt-info">
                <div className="patient-dashboard-apt-doctor">Dr. {appointment.doctor?.name}</div>
                <div className="patient-dashboard-apt-meta">
                  <CalendarDays size={13} />
                  <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-IN')}</span>
                  <span className="patient-dashboard-meta-dot" />
                  <Clock3 size={13} />
                  <span>{appointment.timeSlot}</span>
                </div>
                <div className="patient-dashboard-apt-type">
                  {appointment.type === 'telemedicine' ? <Video size={13} /> : <Stethoscope size={13} />}
                  <span>{appointment.type === 'telemedicine' ? 'Video consultation' : 'In-person visit'}</span>
                </div>
              </div>
              <div className="patient-dashboard-apt-actions">
                <span className="patient-dashboard-badge" style={{ background: `${statusColor[appointment.status]}22`, color: statusColor[appointment.status] }}>
                  {appointment.status}
                </span>
                {appointment.type === 'telemedicine' && appointment.videoCallLink && (
                  <a href={appointment.videoCallLink} target="_blank" rel="noreferrer" className="patient-dashboard-join-btn">
                    Join Call
                  </a>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="patient-dashboard-section">
          <div className="patient-dashboard-section-heading">
            <h3 className="patient-dashboard-section-title">Appointment Breakdown</h3>
            <PieChart size={17} className="patient-dashboard-title-icon" />
          </div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
                <RechartsPieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={3} dataKey="value">
                    {pieData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="patient-dashboard-legend">
                {pieData.map((item) => (
                  <span key={item.name} style={{ color: item.color }}>
                    <span className="patient-dashboard-legend-dot" style={{ background: item.color }} />
                    {item.name}: {item.value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="patient-dashboard-empty">
              No appointment data yet.
              <span>Your first booking will unlock the chart.</span>
            </div>
          )}
        </section>
      </div>

      <section className="patient-dashboard-section">
        <div className="patient-dashboard-section-heading">
          <h3 className="patient-dashboard-section-title">Health Tips</h3>
        </div>
        <div className="patient-dashboard-tips-grid">
          {HEALTH_TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <div key={tip.tip} className="patient-dashboard-tip-card" style={{ borderTop: `3px solid ${tip.color}` }}>
                <div className="patient-dashboard-tip-icon" style={{ color: tip.color }}>
                  <Icon size={22} />
                </div>
                <span>{tip.tip}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
