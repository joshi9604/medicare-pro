import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, CalendarDays, CheckCircle2, Clock3, IndianRupee, ShieldCheck, Stethoscope, UserCheck, Users, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/users'),
      axios.get('/api/admin/doctors/pending')
    ]).then(([sRes, uRes, dRes]) => {
      setStats(sRes.data.stats);
      setUsers(uRes.data.users);
      setPendingDoctors(dRes.data.doctors);
    });
  }, []);

  const approveDoctor = async (id, approve) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/approve`, { isApproved: approve });
      setPendingDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
      toast.success(approve ? 'Doctor approved' : 'Doctor rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers((prev) => prev.map((user) => user.id === id ? data.user : user));
      toast.success('User status updated');
    } catch {
      toast.error('Failed');
    }
  };

  const chartData = stats ? [
    { name: 'Doctors', count: stats.totalDoctors },
    { name: 'Patients', count: stats.totalPatients },
    { name: 'Appointments', count: stats.totalAppointments },
    { name: 'Pending', count: stats.pendingDoctors },
  ] : [];

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: '#1565c0' },
    { icon: Stethoscope, label: 'Doctors', value: stats?.totalDoctors || 0, color: '#10b981' },
    { icon: UserCheck, label: 'Patients', value: stats?.totalPatients || 0, color: '#8b5cf6' },
    { icon: CalendarDays, label: 'Appointments', value: stats?.totalAppointments || 0, color: '#f59e0b' },
    { icon: Clock3, label: 'Pending Doctors', value: stats?.pendingDoctors || 0, color: '#ef4444' },
    { icon: Activity, label: 'Today', value: stats?.todayAppointments || 0, color: '#06b6d4' },
    { icon: IndianRupee, label: 'Total Revenue', value: `${(stats?.totalRevenue || 0).toLocaleString()}`, color: '#10b981' },
    { icon: IndianRupee, label: 'Month Revenue', value: `${(stats?.monthRevenue || 0).toLocaleString()}`, color: '#1565c0' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'doctors', label: 'Pending Doctors', icon: Stethoscope },
    { id: 'users', label: 'All Users', icon: Users }
  ];

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title"><ShieldCheck size={24} /> Admin Control Panel</h1>

      <div className="admin-dashboard-stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-dashboard-stat-card" style={{ borderTop: `3px solid ${stat.color}` }}>
              <div className="admin-dashboard-stat-icon"><Icon size={20} /></div>
              <div className="admin-dashboard-stat-value">{stat.value}</div>
              <div className="admin-dashboard-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-tabs">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-dashboard-tab ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Activity size={18} /> System Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1565c0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Clock3 size={18} /> Pending Doctor Approvals ({pendingDoctors.length})</h3>
          {pendingDoctors.length === 0 ? (
            <div className="admin-dashboard-empty">No pending approvals.</div>
          ) : pendingDoctors.map((doctor) => (
            <div key={doctor.id} className="admin-dashboard-doc-row">
              <div className="admin-dashboard-doc-avatar">{doctor.user?.name?.[0] || 'D'}</div>
              <div className="admin-dashboard-doc-info">
                <div className="admin-dashboard-doc-name">{doctor.user?.name}</div>
                <div className="admin-dashboard-doc-meta">{doctor.user?.email} • {doctor.specialization}</div>
                <div className="admin-dashboard-doc-meta">License: {doctor.licenseNumber} • {doctor.experience} yrs exp</div>
              </div>
              <div className="admin-dashboard-doc-actions">
                <button className="admin-dashboard-approve-btn" onClick={() => approveDoctor(doctor.id, true)} type="button">
                  <CheckCircle2 size={15} />
                  <span>Approve</span>
                </button>
                <button className="admin-dashboard-reject-btn" onClick={() => approveDoctor(doctor.id, false)} type="button">
                  <XCircle size={15} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Users size={18} /> All Users ({users.length})</h3>
          <div className="admin-dashboard-overflow-auto">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map((header) => (
                    <th key={header} className="admin-dashboard-table-header">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="admin-dashboard-table-row">
                    <td className="admin-dashboard-table-cell" data-label="Name"><strong className="admin-dashboard-table-cell-name">{user.name}</strong></td>
                    <td className="admin-dashboard-table-cell" data-label="Email"><span className="admin-dashboard-table-cell-email">{user.email}</span></td>
                    <td className="admin-dashboard-table-cell" data-label="Role">
                      <span className={`admin-dashboard-role-badge ${user.role}`}>
                        {user.role === 'admin' && <ShieldCheck size={14} />}
                        {user.role === 'doctor' && <Stethoscope size={14} />}
                        {user.role === 'patient' && <UserCheck size={14} />}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell" data-label="Status">
                      <span className={`admin-dashboard-status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell" data-label="Joined"><span className="admin-dashboard-table-cell-date">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span></td>
                    <td className="admin-dashboard-table-cell" data-label="Action">
                      <button
                        className={`admin-dashboard-toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleUser(user.id)}
                        type="button"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
