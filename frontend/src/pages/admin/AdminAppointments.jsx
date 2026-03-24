import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminAppointments.css';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const statusColors = {
    pending: '#f59e0b',
    confirmed: '#1565c0',
    'in-progress': '#8b5cf6',
    completed: '#10b981',
    cancelled: '#ef4444',
    'no-show': '#94a3b8'
  };

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

  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-appointments-page">
        <h1 className="admin-appointments-title">📅 All Appointments</h1>
        <div className="admin-appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="admin-appointments-page">
      <div className="admin-appointments-header">
        <h1 className="admin-appointments-title">📅 All Appointments</h1>
        <p className="admin-appointments-subtitle">View and manage all appointments in the system</p>
      </div>

      {/* Stats */}
      <div className="admin-appointments-stats">
        <div className="admin-appointments-stat-card">
          <div className="admin-appointments-stat-value">{stats.total}</div>
          <div className="admin-appointments-stat-label">Total</div>
        </div>
        <div className="admin-appointments-stat-card pending">
          <div className="admin-appointments-stat-value">{stats.pending}</div>
          <div className="admin-appointments-stat-label">Pending</div>
        </div>
        <div className="admin-appointments-stat-card confirmed">
          <div className="admin-appointments-stat-value">{stats.confirmed}</div>
          <div className="admin-appointments-stat-label">Confirmed</div>
        </div>
        <div className="admin-appointments-stat-card completed">
          <div className="admin-appointments-stat-value">{stats.completed}</div>
          <div className="admin-appointments-stat-label">Completed</div>
        </div>
        <div className="admin-appointments-stat-card cancelled">
          <div className="admin-appointments-stat-value">{stats.cancelled}</div>
          <div className="admin-appointments-stat-label">Cancelled</div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-appointments-filters">
        {[
          { value: 'all', label: 'All', icon: '📋' },
          { value: 'pending', label: 'Pending', icon: '⏳' },
          { value: 'confirmed', label: 'Confirmed', icon: '✅' },
          { value: 'completed', label: 'Completed', icon: '✓' },
          { value: 'cancelled', label: 'Cancelled', icon: '❌' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`admin-appointments-filter-btn ${filter === f.value ? 'active' : ''}`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="admin-appointments-table-container">
        <table className="admin-appointments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date & Time</th>
              <th>Type</th>
              <th>Status</th>
              <th>Fee</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(apt => (
              <tr key={apt.id}>
                <td>
                  <span className="admin-appointments-id">{apt.appointmentId}</span>
                </td>
                <td>
                  <div className="admin-appointments-user">
                    <div className="admin-appointments-avatar">{apt.patient?.name?.[0] || 'P'}</div>
                    <span className="admin-appointments-user-name">{apt.patient?.name}</span>
                  </div>
                </td>
                <td>
                  <div className="admin-appointments-user">
                    <div className="admin-appointments-avatar doctor">{apt.doctor?.name?.[0] || 'D'}</div>
                    <span className="admin-appointments-user-name">Dr. {apt.doctor?.name}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <div className="admin-appointments-date">{formatDate(apt.appointmentDate)}</div>
                    <div className="admin-appointments-time">{apt.timeSlot}</div>
                  </div>
                </td>
                <td>
                  <span className={`admin-appointments-type ${apt.type === 'telemedicine' ? 'video' : 'in-person'}`}>
                    {apt.type === 'telemedicine' ? '🎥 Video' : '🏥 In-Person'}
                  </span>
                </td>
                <td>
                  <span className={`admin-appointments-status ${apt.status}`}>
                    {apt.status}
                  </span>
                </td>
                <td>
                  <span className="admin-appointments-fee">₹{apt.fee}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
