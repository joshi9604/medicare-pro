import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    gender: user?.gender || '',
    bloodGroup: user?.bloodGroup || '',
    addressStreet: user?.addressStreet || '',
    addressCity: user?.addressCity || '',
    addressState: user?.addressState || '',
    addressPincode: user?.addressPincode || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('File size should be less than 5MB');
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await axios.post('/api/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Avatar uploaded successfully!');
      setUser({ ...user, avatar: data.avatar });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/profile', {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        address: {
          street: formData.addressStreet,
          city: formData.addressCity,
          state: formData.addressState,
          pincode: formData.addressPincode
        }
      });
      
      if (data.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        // Update local user data
        setUser({ ...user, ...formData });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not provided';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const InfoRow = ({ label, value, icon }) => (
    <div className="profile-info-row">
      <span className="profile-info-icon">{icon}</span>
      <div>
        <div className="profile-info-label">{label}</div>
        <div className="profile-info-value">{value || 'Not provided'}</div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1 className="profile-title">👤 My Profile</h1>
        <p className="profile-subtitle">Manage your personal information</p>
      </div>

      {!isEditing ? (
        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="profile-avatar-image" />
                ) : (
                  <div className="profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                )}
                <div className="profile-avatar-overlay">
                  <span className="profile-camera-icon">📷</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              <div>
                <h2 className="profile-name">{user?.name}</h2>
                <span className="profile-role-badge">🧑‍💼 Patient</span>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="profile-edit-btn">
              ✏️ Edit Profile
            </button>
          </div>

          {/* Info Grid */}
          <div className="profile-info-grid">
            <div className="profile-info-card">
              <h3 className="profile-card-title">📋 Basic Information</h3>
              <InfoRow label="Full Name" value={user?.name} icon="👤" />
              <InfoRow label="Email" value={user?.email} icon="📧" />
              <InfoRow label="Phone" value={user?.phone} icon="📱" />
              <InfoRow label="Date of Birth" value={formatDate(user?.dateOfBirth)} icon="🎂" />
              <InfoRow label="Gender" value={user?.gender?.charAt(0).toUpperCase() + user?.gender?.slice(1)} icon="⚧" />
              <InfoRow label="Blood Group" value={user?.bloodGroup} icon="🩸" />
            </div>

            <div className="profile-info-card">
              <h3 className="profile-card-title">🏠 Address</h3>
              {user?.addressStreet || user?.addressCity ? (
                <>
                  <InfoRow label="Street" value={user?.addressStreet} icon="📍" />
                  <InfoRow label="City" value={user?.addressCity} icon="🏙️" />
                  <InfoRow label="State" value={user?.addressState} icon="🗺️" />
                  <InfoRow label="Pincode" value={user?.addressPincode} icon="📮" />
                </>
              ) : (
                <div className="profile-empty-field">No address provided</div>
              )}
            </div>
          </div>

          {/* Account Info */}
          <div className="profile-account-info">
            <h3 className="profile-card-title">🔒 Account Information</h3>
            <div className="profile-account-grid">
              <div>
                <div className="profile-info-label">Member Since</div>
                <div className="profile-info-value">{formatDate(user?.createdAt)}</div>
              </div>
              <div>
                <div className="profile-info-label">Account Status</div>
                <div className="profile-info-value" style={{ color: '#10b981' }}>✅ Active</div>
              </div>
              <div>
                <div className="profile-info-label">Email Verified</div>
                <div className="profile-info-value" style={{ color: user?.isVerified ? '#10b981' : '#f59e0b' }}>
                  {user?.isVerified ? '✅ Verified' : '⏳ Pending'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-form-grid">
            <div className="profile-form-section">
              <h3 className="profile-card-title">📋 Basic Information</h3>
              
              <div className="profile-form-group">
                <label className="profile-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="profile-input"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="profile-input"
                  style={{ background: '#f0f4f8', cursor: 'not-allowed' }}
                />
                <small className="profile-hint">Email cannot be changed</small>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group" style={{ flex: 1 }}>
                  <label className="profile-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="profile-input"
                  />
                </div>

                <div className="profile-form-group" style={{ flex: 1 }}>
                  <label className="profile-label">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="profile-input"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="profile-input"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="profile-form-section">
              <h3 className="profile-card-title">🏠 Address</h3>
              
              <div className="profile-form-group">
                <label className="profile-label">Street Address</label>
                <input
                  type="text"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="profile-form-row">
                <div className="profile-form-group" style={{ flex: 1 }}>
                  <label className="profile-label">City</label>
                  <input
                    type="text"
                    name="addressCity"
                    value={formData.addressCity}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="Mumbai"
                  />
                </div>

                <div className="profile-form-group" style={{ flex: 1 }}>
                  <label className="profile-label">State</label>
                  <input
                    type="text"
                    name="addressState"
                    value={formData.addressState}
                    onChange={handleChange}
                    className="profile-input"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div className="profile-form-group">
                <label className="profile-label">Pincode</label>
                <input
                  type="text"
                  name="addressPincode"
                  value={formData.addressPincode}
                  onChange={handleChange}
                  className="profile-input"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>

          <div className="profile-form-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="profile-cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="profile-save-btn"
            >
              {saving ? '💾 Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
