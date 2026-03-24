import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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
      setPendingDoctors(prev => prev.filter(d => d.id !== id));
      toast.success(approve ? 'Doctor approved! ✅' : 'Doctor rejected');
    } catch { toast.error('Action failed'); }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u.id === id ? data.user : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const chartData = stats ? [
    { name: 'Doctors', count: stats.totalDoctors },
    { name: 'Patients', count: stats.totalPatients },
    { name: 'Appointments', count: stats.totalAppointments },
    { name: 'Pending', count: stats.pendingDoctors },
  ] : [];

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title">🏥 Admin Control Panel</h1>

      {/* Stats */}
      <div className="admin-dashboard-stats-grid">
        {[
          { icon:'👥', label:'Total Users', value: stats?.totalUsers||0, color:'#1565c0' },
          { icon:'👨‍⚕️', label:'Doctors', value: stats?.totalDoctors||0, color:'#10b981' },
          { icon:'🧑‍💼', label:'Patients', value: stats?.totalPatients||0, color:'#8b5cf6' },
          { icon:'📅', label:'Appointments', value: stats?.totalAppointments||0, color:'#f59e0b' },
          { icon:'⏳', label:'Pending Doctors', value: stats?.pendingDoctors||0, color:'#ef4444' },
          { icon:'📅', label:'Today', value: stats?.todayAppointments||0, color:'#06b6d4' },
          { icon:'💰', label:'Total Revenue', value:`₹${(stats?.totalRevenue||0).toLocaleString()}`, color:'#10b981' },
          { icon:'📆', label:'Month Revenue', value:`₹${(stats?.monthRevenue||0).toLocaleString()}`, color:'#1565c0' },
        ].map(st => (
          <div key={st.label} className="admin-dashboard-stat-card" style={{ borderTop:`3px solid ${st.color}` }}>
            <div className="admin-dashboard-stat-icon">{st.icon}</div>
            <div className="admin-dashboard-stat-value">{st.value}</div>
            <div className="admin-dashboard-stat-label">{st.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="admin-dashboard-tabs">
        {[['overview','📊 Overview'],['doctors','👨‍⚕️ Pending Doctors'],['users','👥 All Users']].map(([id,label]) => (
          <button 
            key={id} 
            className={`admin-dashboard-tab ${tab===id?'active':''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab==='overview' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title">System Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize:13 }} />
              <YAxis tick={{ fontSize:13 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1565c0" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab==='doctors' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title">⏳ Pending Doctor Approvals ({pendingDoctors.length})</h3>
          {pendingDoctors.length===0 ? (
            <div className="admin-dashboard-empty">✅ No pending approvals!</div>
          ) : pendingDoctors.map(doc => (
            <div key={doc.id} className="admin-dashboard-doc-row">
              <div className="admin-dashboard-doc-avatar">{doc.user?.name?.[0]||'D'}</div>
              <div className="admin-dashboard-doc-info">
                <div className="admin-dashboard-doc-name">{doc.user?.name}</div>
                <div className="admin-dashboard-doc-meta">{doc.user?.email} · {doc.specialization}</div>
                <div className="admin-dashboard-doc-meta">License: {doc.licenseNumber} · {doc.experience} yrs exp</div>
              </div>
              <div className="admin-dashboard-doc-actions">
                <button className="admin-dashboard-approve-btn" onClick={() => approveDoctor(doc.id, true)}>✅ Approve</button>
                <button className="admin-dashboard-reject-btn" onClick={() => approveDoctor(doc.id, false)}>❌ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='users' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title">👥 All Users ({users.length})</h3>
          <div className="admin-dashboard-overflow-auto">
            <table className="admin-dashboard-table">
              <thead>
                <tr>{['Name','Email','Role','Status','Joined','Action'].map(h=>{
                  <th key={h} className="admin-dashboard-table-header">{h}</th>
                })}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="admin-dashboard-table-row">
                    <td className="admin-dashboard-table-cell"><strong className="admin-dashboard-table-cell-name">{u.name}</strong></td>
                    <td className="admin-dashboard-table-cell"><span className="admin-dashboard-table-cell-email">{u.email}</span></td>
                    <td className="admin-dashboard-table-cell">
                      <span className={`admin-dashboard-role-badge ${u.role}`}>
                        {u.role==='admin'?'🏥':u.role==='doctor'?'👨‍⚕️':'🧑‍💼'} {u.role}
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell">
                      <span className={`admin-dashboard-status ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell"><span className="admin-dashboard-table-cell-date">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span></td>
                    <td className="admin-dashboard-table-cell">
                      <button 
                        className={`admin-dashboard-toggle-btn ${u.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleUser(u.id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
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
