import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import AccountInformation from '../../components/doctor/AccountInformation';
import './DoctorProfile.css';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('profile'); // 'profile' or 'account'
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    telemedicineFee: '',
    about: '',
    hospital: '',
    department: '',
    languages: '',
    isAvailableOnline: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get('/api/doctors/profile/me');
      setProfile(data.doctor);
      if (data.doctor) {
        setFormData({
          specialization: data.doctor.specialization || '',
          experience: data.doctor.experience || '',
          licenseNumber: data.doctor.licenseNumber || '',
          consultationFee: data.doctor.consultationFee || '',
          telemedicineFee: data.doctor.telemedicineFee || '',
          about: data.doctor.about || '',
          hospital: data.doctor.hospital || '',
          department: data.doctor.department || '',
          languages: data.doctor.languages?.join(', ') || '',
          isAvailableOnline: data.doctor.isAvailableOnline ?? true
        });
      }
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        experience: parseInt(formData.experience) || 0,
        consultationFee: parseInt(formData.consultationFee) || 500,
        telemedicineFee: parseInt(formData.telemedicineFee) || 300,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean)
      };
      
      await axios.put('/api/doctors/profile/me', submitData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <h1 className="doctor-profile-title">👨‍⚕️ Doctor Profile</h1>
        <div className="doctor-profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">
      {/* Profile Header */}
      <div className="doctor-profile-header">
        <h1 className="doctor-profile-title">👨‍⚕️ Doctor Profile</h1>
        <p className="doctor-profile-subtitle">Manage your professional information and account details</p>
      </div>

      {/* Section Tabs */}
      <div className="doctor-profile-tabs">
        <button
          className={`doctor-profile-tab-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          📋 Professional Profile
        </button>
        <button
          className={`doctor-profile-tab-btn ${activeSection === 'account' ? 'active' : ''}`}
          onClick={() => setActiveSection('account')}
        >
          💳 Account Information
        </button>
      </div>

      {activeSection === 'profile' && !isEditing && (
        <div className="doctor-profile-content">
          {/* Profile Card */}
          <div className="doctor-profile-card">
            <div className="doctor-profile-avatar-section">
              <div className="doctor-profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <h2 className="doctor-profile-name">Dr. {user?.name}</h2>
                <div className="doctor-profile-specialization">{profile?.specialization || 'Not specified'}</div>
                <span className="doctor-profile-role-badge">👨‍⚕️ Doctor</span>
                {profile?.isApproved ? (
                  <span className="doctor-profile-approved-badge">✅ Verified</span>
                ) : (
                  <span className="doctor-profile-pending-badge">⏳ Pending Approval</span>
                )}
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="doctor-profile-edit-btn">
              ✏️ Edit Profile
            </button>
          </div>

          {/* Info Grid */}
          <div className="doctor-profile-info-grid">
            <div className="doctor-profile-info-card">
              <h3 className="doctor-profile-card-title">📋 Professional Information</h3>
              <InfoRow label="Specialization" value={profile?.specialization} icon="🩺" />
              <InfoRow label="Experience" value={profile?.experience ? `${profile.experience} years` : null} icon="📅" />
              <InfoRow label="License Number" value={profile?.licenseNumber} icon="📜" />
              <InfoRow label="Hospital/Clinic" value={profile?.hospital} icon="🏥" />
              <InfoRow label="Department" value={profile?.department} icon="🏬" />
            </div>

            <div className="doctor-profile-info-card">
              <h3 className="doctor-profile-card-title">💰 Consultation Fees</h3>
              <InfoRow label="In-Person Consultation" value={`₹${profile?.consultationFee || 500}`} icon="🏥" />
              <InfoRow label="Video Consultation" value={`₹${profile?.telemedicineFee || 300}`} icon="🎥" />
              <InfoRow label="Video Consultations" value={profile?.isAvailableOnline ? 'Available' : 'Not Available'} icon="📹" />
              <InfoRow label="Languages" value={profile?.languages?.join(', ')} icon="🌐" />
              <InfoRow label="Rating" value={profile?.rating ? `${profile.rating}/5 (${profile.totalReviews} reviews)` : 'No reviews yet'} icon="⭐" />
            </div>
          </div>

          {/* About Section */}
          <div className="doctor-profile-about-card">
            <h3 className="doctor-profile-card-title">📝 About</h3>
            <p className="doctor-profile-about-text">{profile?.about || 'No description provided.'}</p>
          </div>

          {/* Edit Button */}
          <div className="doctor-profile-actions">
            <button onClick={() => setIsEditing(true)} className="doctor-profile-edit-btn">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      )}

      {activeSection === 'profile' && isEditing && (
        <form onSubmit={handleSubmit} className="doctor-profile-form">
          <div className="doctor-profile-form-grid">
            <div className="doctor-profile-form-section">
              <h3 className="doctor-profile-card-title">📋 Professional Information</h3>
              
              <div className="doctor-profile-form-group">
                <label className="doctor-profile-label">Specialization *</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="doctor-profile-input"
                  required
                />
              </div>

              <div className="doctor-profile-form-row">
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">License Number *</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="doctor-profile-input"
                    required
                  />
                </div>
              </div>

              <div className="doctor-profile-form-row">
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">Hospital/Clinic</label>
                  <input
                    type="text"
                    value={formData.hospital}
                    onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
              </div>
            </div>

            <div className="doctor-profile-form-section">
              <h3 className="doctor-profile-card-title">💰 Fees & Availability</h3>
              
              <div className="doctor-profile-form-row">
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">In-Person Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">Video Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.telemedicineFee}
                    onChange={(e) => setFormData({ ...formData, telemedicineFee: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
              </div>

              <div className="doctor-profile-form-group">
                <label className="doctor-profile-label">Languages (comma separated)</label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                  className="doctor-profile-input"
                  placeholder="English, Hindi, Marathi"
                />
              </div>

              <div className="doctor-profile-checkbox-group">
                <input
                  type="checkbox"
                  id="isAvailableOnline"
                  checked={formData.isAvailableOnline}
                  onChange={(e) => setFormData({ ...formData, isAvailableOnline: e.target.checked })}
                  className="doctor-profile-checkbox"
                />
                <label htmlFor="isAvailableOnline" className="doctor-profile-checkbox-label">
                  Available for video consultations
                </label>
              </div>
            </div>
          </div>

          <div className="doctor-profile-form-section">
            <h3 className="doctor-profile-card-title">📝 About</h3>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="doctor-profile-input doctor-profile-input-textarea"
              placeholder="Describe your experience, expertise, and approach to patient care..."
            />
          </div>

          <div className="doctor-profile-form-actions">
            <button type="button" onClick={() => setIsEditing(false)} className="doctor-profile-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="doctor-profile-save-btn">
              💾 Save Changes
            </button>
          </div>
        </form>
      )}

      {activeSection === 'account' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>💳 Account Information</h2>
            <button 
              onClick={() => window.open('/doctor/payments', '_blank')}
              style={{
                padding: '10px 20px',
                background: '#f1f5f9',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#e2e8f0';
                e.target.style.borderColor = '#cbd5e1';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#f1f5f9';
                e.target.style.borderColor = '#e2e8f0';
              }}
            >
              📊 View Payment History
            </button>
          </div>
          <AccountInformation doctor={profile} />
        </>
      )}
    </div>
  );
}

const InfoRow = ({ label, value, icon }) => (
  <div className="doctor-profile-info-row">
    <span className="doctor-profile-info-icon">{icon}</span>
    <div>
      <div className="doctor-profile-info-label">{label}</div>
      <div className="doctor-profile-info-value">{value || 'Not provided'}</div>
    </div>
  </div>
);

