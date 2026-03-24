import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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
      setDoctors(prev => prev.map(d => d.id === id ? { ...d, isApproved } : d));
      toast.success(isApproved ? 'Doctor approved!' : 'Doctor rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const filteredDoctors = filter === 'all' 
    ? doctors 
    : filter === 'approved' 
      ? doctors.filter(d => d.isApproved)
      : doctors.filter(d => !d.isApproved);

  const stats = {
    total: doctors.length,
    approved: doctors.filter(d => d.isApproved).length,
    pending: doctors.filter(d => !d.isApproved).length
  };

  if (loading) {
    return (
      <div className="admin-doctors-page">
        <h1 className="admin-doctors-title">👨‍⚕️ All Doctors</h1>
        <div className="admin-doctors-loading">Loading doctors...</div>
      </div>
    );
  }

  return (
    <div className="admin-doctors-page">
      <div className="admin-doctors-header">
        <h1 className="admin-doctors-title">👨‍⚕️ All Doctors</h1>
        <p className="admin-doctors-subtitle">Manage all doctors in the system</p>
      </div>

      {/* Stats */}
      <div className="admin-doctors-stats">
        <div className="admin-doctors-stat-card">
          <div className="admin-doctors-stat-value">{stats.total}</div>
          <div className="admin-doctors-stat-label">Total Doctors</div>
        </div>
        <div className="admin-doctors-stat-card" style={{borderLeftColor: '#10b981'}}>
          <div className="admin-doctors-stat-value">{stats.approved}</div>
          <div className="admin-doctors-stat-label">Approved</div>
        </div>
        <div className="admin-doctors-stat-card pending">
          <div className="admin-doctors-stat-value">{stats.pending}</div>
          <div className="admin-doctors-stat-label">Pending</div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-doctors-filters">
        {[
          { value: 'all', label: 'All Doctors', icon: '👨‍⚕️' },
          { value: 'approved', label: 'Approved', icon: '✅' },
          { value: 'pending', label: 'Pending', icon: '⏳' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`admin-doctors-filter-btn ${filter === f.value ? 'active' : ''}`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Doctors Grid */}
      <div className="admin-doctors-grid">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="admin-doctors-card">
            <div className="admin-doctors-card-header">
              <div className="admin-doctors-avatar">{doctor.user?.name?.[0] || 'D'}</div>
              <div className="admin-doctors-header-info">
                <h3 className="admin-doctors-name">Dr. {doctor.user?.name}</h3>
                <span className={`admin-doctors-status ${doctor.isApproved ? 'approved' : 'pending'}`}>
                  {doctor.isApproved ? '✅ Approved' : '⏳ Pending'}
                </span>
              </div>
            </div>
            
            <div className="admin-doctors-info">
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Specialization:</span>
                <span className="admin-doctors-info-value">{doctor.specialization}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Experience:</span>
                <span className="admin-doctors-info-value">{doctor.experience} years</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">License:</span>
                <span className="admin-doctors-info-value">{doctor.licenseNumber}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Fee:</span>
                <span className="admin-doctors-info-value">₹{doctor.consultationFee}</span>
              </div>
              <div className="admin-doctors-info-row">
                <span className="admin-doctors-info-label">Rating:</span>
                <span className="admin-doctors-info-value">⭐ {doctor.rating || 0} ({doctor.totalReviews || 0} reviews)</span>
              </div>
            </div>

            {!doctor.isApproved && (
              <div className="admin-doctors-actions">
                <button 
                  onClick={() => approveDoctor(doctor.id, true)}
                  className="admin-doctors-action-btn approve"
                >
                  ✅ Approve
                </button>
                <button 
                  onClick={() => approveDoctor(doctor.id, false)}
                  className="admin-doctors-action-btn reject"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
