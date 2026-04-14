import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BadgeCheck, CheckCircle2, Clock3, IndianRupee, Star, Stethoscope, XCircle } from 'lucide-react';
import './AdminDoctors.css';

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/doctors/all');
      setDoctors(data.doctors || []);
    } catch (err) {
      try {
        const { data } = await axios.get('/api/doctors?limit=100');
        setDoctors(data.doctors || []);
      } catch {
        toast.error('Failed to load doctors');
      }
    } finally {
      setLoading(false);
    }
  };

  const approveDoctor = async (id, isApproved) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/approve`, { isApproved });
      setDoctors((prev) => prev.map((doctor) => doctor.id === id ? { ...doctor, isApproved } : doctor));
      toast.success(isApproved ? 'Doctor approved' : 'Doctor rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const filteredDoctors = filter === 'all'
    ? doctors
    : filter === 'approved'
      ? doctors.filter((doctor) => doctor.isApproved)
      : doctors.filter((doctor) => !doctor.isApproved);

  const stats = {
    total: doctors.length,
    approved: doctors.filter((doctor) => doctor.isApproved).length,
    pending: doctors.filter((doctor) => !doctor.isApproved).length
  };

  const filters = [
    { value: 'all', label: 'All Doctors', icon: Stethoscope },
    { value: 'approved', label: 'Approved', icon: CheckCircle2 },
    { value: 'pending', label: 'Pending', icon: Clock3 }
  ];

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <h1 className="admin-doctors-title"><Stethoscope size={24} /> All Doctors</h1>
        <div className="admin-doctors-loading">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <div className="admin-doctors-header">
        <h1 className="admin-doctors-title"><Stethoscope size={24} /> All Doctors</h1>
        <p className="admin-doctors-subtitle">Manage approvals, verification status, and doctor details.</p>
      </div>

      <div className="admin-doctors-stats">
        <div className="admin-doctors-stat-card">
          <div className="admin-doctors-stat-icon"><Stethoscope size={18} /></div>
          <div className="admin-doctors-stat-value">{stats.total}</div>
          <div className="admin-doctors-stat-label">Total Doctors</div>
        </div>
        <div className="admin-doctors-stat-card approved">
          <div className="admin-doctors-stat-icon"><BadgeCheck size={18} /></div>
          <div className="admin-doctors-stat-value">{stats.approved}</div>
          <div className="admin-doctors-stat-label">Approved</div>
        </div>
        <div className="admin-doctors-stat-card pending">
          <div className="admin-doctors-stat-icon"><Clock3 size={18} /></div>
          <div className="admin-doctors-stat-value">{stats.pending}</div>
          <div className="admin-doctors-stat-label">Pending</div>
        </div>
      </div>

      <div className="admin-doctors-filters">
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`admin-doctors-filter-btn ${filter === item.value ? 'active' : ''}`}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="admin-doctors-grid">
        {filteredDoctors.map((doctor) => (
          <div key={doctor.id} className="admin-doctors-card">
            <div className="admin-doctors-card-header">
              <div className="admin-doctors-avatar">{doctor.user?.name?.[0] || 'D'}</div>
              <div className="admin-doctors-header-info">
                <h3 className="admin-doctors-name">Dr. {doctor.user?.name}</h3>
                <span className={`admin-doctors-status ${doctor.isApproved ? 'approved' : 'pending'}`}>
                  {doctor.isApproved ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}
                  <span>{doctor.isApproved ? 'Approved' : 'Pending'}</span>
                </span>
              </div>
            </div>

            <div className="admin-doctors-info">
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Specialization</span>
                <span className="admin-doctors-info-value">{doctor.specialization || 'Not provided'}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Experience</span>
                <span className="admin-doctors-info-value">{doctor.experience ? `${doctor.experience} years` : 'Not provided'}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">License</span>
                <span className="admin-doctors-info-value">{doctor.licenseNumber || 'Not provided'}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Fee</span>
                <span className="admin-doctors-info-value admin-doctors-info-value-highlight">
                  <IndianRupee size={14} />
                  <span>{doctor.consultationFee || 0}</span>
                </span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Rating</span>
                <span className="admin-doctors-info-value admin-doctors-info-value-highlight">
                  <Star size={14} />
                  <span>{doctor.rating || 0} ({doctor.totalReviews || 0} reviews)</span>
                </span>
              </div>
            </div>

            {!doctor.isApproved && (
              <div className="admin-doctors-actions">
                <button
                  onClick={() => approveDoctor(doctor.id, true)}
                  className="admin-doctors-action-btn approve"
                  type="button"
                >
                  <CheckCircle2 size={16} />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => approveDoctor(doctor.id, false)}
                  className="admin-doctors-action-btn reject"
                  type="button"
                >
                  <XCircle size={16} />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
