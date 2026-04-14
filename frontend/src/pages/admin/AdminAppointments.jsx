import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, CalendarDays, CheckCircle2, CircleDot, Clock3, IndianRupee, ListFilter, MonitorPlay } from 'lucide-react';
import './AdminAppointments.css';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
    : appointments.filter((appointment) => appointment.status === filter);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((appointment) => appointment.status === 'pending').length,
    confirmed: appointments.filter((appointment) => appointment.status === 'confirmed').length,
    completed: appointments.filter((appointment) => appointment.status === 'completed').length,
    cancelled: appointments.filter((appointment) => appointment.status === 'cancelled').length
  };

  const filters = [
    { value: 'all', label: 'All', icon: ListFilter },
    { value: 'pending', label: 'Pending', icon: Clock3 },
    { value: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { value: 'completed', label: 'Completed', icon: CircleDot },
    { value: 'cancelled', label: 'Cancelled', icon: CircleDot }
  ];

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="admin-appointments-page">
        <h1 className="admin-appointments-title"><CalendarDays size={24} /> All Appointments</h1>
        <div className="admin-appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="admin-appointments-page">
      <div className="admin-appointments-header">
        <h1 className="admin-appointments-title"><CalendarDays size={24} /> All Appointments</h1>
        <p className="admin-appointments-subtitle">View and manage all appointments in the system.</p>
      </div>

      <div className="admin-appointments-stats">
        <div className="admin-appointments-stat-card">
          <div className="admin-appointments-stat-icon"><CalendarDays size={18} /></div>
          <div className="admin-appointments-stat-value">{stats.total}</div>
          <div className="admin-appointments-stat-label">Total</div>
        </div>
        <div className="admin-appointments-stat-card pending">
          <div className="admin-appointments-stat-icon"><Clock3 size={18} /></div>
          <div className="admin-appointments-stat-value">{stats.pending}</div>
          <div className="admin-appointments-stat-label">Pending</div>
        </div>
        <div className="admin-appointments-stat-card confirmed">
          <div className="admin-appointments-stat-icon"><CheckCircle2 size={18} /></div>
          <div className="admin-appointments-stat-value">{stats.confirmed}</div>
          <div className="admin-appointments-stat-label">Confirmed</div>
        </div>
        <div className="admin-appointments-stat-card completed">
          <div className="admin-appointments-stat-icon"><CircleDot size={18} /></div>
          <div className="admin-appointments-stat-value">{stats.completed}</div>
          <div className="admin-appointments-stat-label">Completed</div>
        </div>
        <div className="admin-appointments-stat-card cancelled">
          <div className="admin-appointments-stat-icon"><CircleDot size={18} /></div>
          <div className="admin-appointments-stat-value">{stats.cancelled}</div>
          <div className="admin-appointments-stat-label">Cancelled</div>
        </div>
      </div>

      <div className="admin-appointments-filters">
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`admin-appointments-filter-btn ${filter === item.value ? 'active' : ''}`}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

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
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td data-label="ID">
                  <span className="admin-appointments-id">{appointment.appointmentId}</span>
                </td>
                <td data-label="Patient">
                  <div className="admin-appointments-user">
                    <div className="admin-appointments-avatar">{appointment.patient?.name?.[0] || 'P'}</div>
                    <span className="admin-appointments-user-name">{appointment.patient?.name}</span>
                  </div>
                </td>
                <td data-label="Doctor">
                  <div className="admin-appointments-user">
                    <div className="admin-appointments-avatar doctor">{appointment.doctor?.name?.[0] || 'D'}</div>
                    <span className="admin-appointments-user-name">Dr. {appointment.doctor?.name}</span>
                  </div>
                </td>
                <td data-label="Date & Time">
                  <div>
                    <div className="admin-appointments-date">{formatDate(appointment.appointmentDate)}</div>
                    <div className="admin-appointments-time">{appointment.timeSlot}</div>
                  </div>
                </td>
                <td data-label="Type">
                  <span className={`admin-appointments-type ${appointment.type === 'telemedicine' ? 'video' : 'in-person'}`}>
                    {appointment.type === 'telemedicine' ? <MonitorPlay size={14} /> : <Building2 size={14} />}
                    <span>{appointment.type === 'telemedicine' ? 'Video' : 'In-Person'}</span>
                  </span>
                </td>
                <td data-label="Status">
                  <span className={`admin-appointments-status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
                <td data-label="Fee">
                  <span className="admin-appointments-fee"><IndianRupee size={14} /> {appointment.fee}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
