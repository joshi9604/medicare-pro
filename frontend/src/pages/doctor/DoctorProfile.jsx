import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, CalendarRange, CreditCard, FileText, IndianRupee, Languages, LayoutPanelTop, Map, MapPin, Navigation, PencilLine, Save, ShieldCheck, Star, Stethoscope, Tv } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AccountInformation from '../../components/doctor/AccountInformation';
import './DoctorProfile.css';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    licenseNumber: '',
    consultationFee: '',
    telemedicineFee: '',
    about: '',
    hospital: '',
    addressStreet: '',
    addressCity: '',
    addressState: '',
    addressLandmark: '',
    addressPincode: '',
    department: '',
    languages: '',
    isAvailableOnline: true
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
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
          addressStreet: data.doctor.addressStreet || '',
          addressCity: data.doctor.addressCity || '',
          addressState: data.doctor.addressState || '',
          addressLandmark: data.doctor.addressLandmark || '',
          addressPincode: data.doctor.addressPincode || '',
          department: data.doctor.department || '',
          languages: data.doctor.languages?.join(', ') || '',
          isAvailableOnline: data.doctor.isAvailableOnline ?? true
        });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        console.info('No doctor profile found yet. This is normal for new doctors.');
      } else {
        console.error('Error fetching profile:', err.message);
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        experience: parseInt(formData.experience, 10) || 0,
        consultationFee: parseInt(formData.consultationFee, 10) || 500,
        telemedicineFee: parseInt(formData.telemedicineFee, 10) || 300,
        languages: formData.languages.split(',').map((language) => language.trim()).filter(Boolean)
      };

      await axios.put('/api/doctors/profile/me', submitData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="doctor-profile-page">
        <h1 className="doctor-profile-title"><Stethoscope size={24} /> Doctor Profile</h1>
        <div className="doctor-profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="doctor-profile-page">
      <div className="doctor-profile-header">
        <h1 className="doctor-profile-title"><Stethoscope size={24} /> Doctor Profile</h1>
        <p className="doctor-profile-subtitle">Manage your professional information and account details.</p>
      </div>

      <div className="doctor-profile-tabs">
        <button
          className={`doctor-profile-tab-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
          type="button"
        >
          <LayoutPanelTop size={16} />
          <span>Professional Profile</span>
        </button>
        <button
          className={`doctor-profile-tab-btn ${activeSection === 'account' ? 'active' : ''}`}
          onClick={() => setActiveSection('account')}
          type="button"
        >
          <CreditCard size={16} />
          <span>Account Information</span>
        </button>
        
      </div>

      {activeSection === 'profile' && !isEditing && (
        <div className="doctor-profile-content">
          <div className="doctor-profile-card">
            <div className="doctor-profile-avatar-section">
              <div className="doctor-profile-avatar">{user?.name?.[0]?.toUpperCase()}</div>
              <div>
                <h2 className="doctor-profile-name">Dr. {user?.name}</h2>
                <div className="doctor-profile-specialization">{profile?.specialization || 'Not specified'}</div>
                <span className="doctor-profile-role-badge"><Stethoscope size={14} /> Doctor</span>
                {profile?.isApproved ? (
                  <span className="doctor-profile-approved-badge"><ShieldCheck size={14} /> Verified</span>
                ) : (
                  <span className="doctor-profile-pending-badge"><CalendarRange size={14} /> Pending Approval</span>
                )}
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} className="doctor-profile-edit-btn" type="button">
              <PencilLine size={16} />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="doctor-profile-info-grid">
            <div className="doctor-profile-info-card">
              <h3 className="doctor-profile-card-title"><FileText size={18} /> Professional Information</h3>
              <InfoRow label="Specialization" value={profile?.specialization} icon={Stethoscope} />
              <InfoRow label="Experience" value={profile?.experience ? `${profile.experience} years` : null} icon={CalendarRange} />
              <InfoRow label="License Number" value={profile?.licenseNumber} icon={ShieldCheck} />
              <InfoRow label="Hospital/Clinic" value={profile?.hospital} icon={Building2} />
              <InfoRow label="Department" value={profile?.department} icon={Building2} />
            </div>

            <div className="doctor-profile-info-card">
              <h3 className="doctor-profile-card-title"><IndianRupee size={18} /> Consultation Fees</h3>
              <InfoRow label="In-Person Consultation" value={`Rs ${profile?.consultationFee || 500}`} icon={IndianRupee} />
              <InfoRow label="Video Consultation" value={`Rs ${profile?.telemedicineFee || 300}`} icon={Tv} />
              <InfoRow label="Video Consultations" value={profile?.isAvailableOnline ? 'Available' : 'Not Available'} icon={Tv} />
              <InfoRow label="Languages" value={profile?.languages?.join(', ')} icon={Languages} />
              <InfoRow label="Rating" value={profile?.rating ? `${profile.rating}/5 (${profile.totalReviews} reviews)` : 'No reviews yet'} icon={Star} />
            </div>

            <div className="doctor-profile-info-card">
              <h3 className="doctor-profile-card-title"><MapPin size={18} /> Address</h3>
              <InfoRow label="Street" value={profile?.addressStreet} icon={MapPin} />
              <InfoRow label="City" value={profile?.addressCity} icon={Navigation} />
              <InfoRow label="State" value={profile?.addressState} icon={Map} />
              <InfoRow label="Landmark" value={profile?.addressLandmark} icon={Building2} />
              <InfoRow label="Pincode" value={profile?.addressPincode} icon={MapPin} />
            </div>
          </div>

          <div className="doctor-profile-about-card">
            <h3 className="doctor-profile-card-title"><FileText size={18} /> About</h3>
            <p className="doctor-profile-about-text">{profile?.about || 'No description provided.'}</p>
          </div>

          <div className="doctor-profile-actions">
            <button onClick={() => setIsEditing(true)} className="doctor-profile-edit-btn" type="button">
              <PencilLine size={16} />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      )}

      {activeSection === 'profile' && isEditing && (
        <form onSubmit={handleSubmit} className="doctor-profile-form">
          <div className="doctor-profile-form-grid">
            <div className="doctor-profile-form-section">
              <h3 className="doctor-profile-card-title"><FileText size={18} /> Professional Information</h3>

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

              <div className="doctor-profile-form-group">
                <label className="doctor-profile-label">Street Address</label>
                <input
                  type="text"
                  value={formData.addressStreet}
                  onChange={(e) => setFormData({ ...formData, addressStreet: e.target.value })}
                  className="doctor-profile-input"
                  placeholder="123 Main Street"
                />
              </div>

              <div className="doctor-profile-form-group">
                <label className="doctor-profile-label">Landmark</label>
                <input
                  type="text"
                  value={formData.addressLandmark}
                  onChange={(e) => setFormData({ ...formData, addressLandmark: e.target.value })}
                  className="doctor-profile-input"
                  placeholder="Near City Hospital"
                />
              </div>

              <div className="doctor-profile-form-row">
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">City</label>
                  <input
                    type="text"
                    value={formData.addressCity}
                    onChange={(e) => setFormData({ ...formData, addressCity: e.target.value })}
                    className="doctor-profile-input"
                    placeholder="Mumbai"
                  />
                </div>

                <div className="doctor-profile-form-group">
                <label className="doctor-profile-label">Pincode</label>
                <input
                  type="text"
                  value={formData.addressPincode}
                  onChange={(e) => setFormData({ ...formData, addressPincode: e.target.value })}
                  className="doctor-profile-input"
                  placeholder="400001"
                />
              </div>

                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">State</label>
                  <input
                    type="text"
                    value={formData.addressState}
                    onChange={(e) => setFormData({ ...formData, addressState: e.target.value })}
                    className="doctor-profile-input"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>
              
            </div>

            <div className="doctor-profile-form-section">
              <h3 className="doctor-profile-card-title"><IndianRupee size={18} /> Fees & Availability</h3>

              <div className="doctor-profile-form-row">
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">In-Person Fee (Rs)</label>
                  <input
                    type="number"
                    value={formData.consultationFee}
                    onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                    className="doctor-profile-input"
                  />
                </div>
                <div className="doctor-profile-form-group" style={{ flex: 1 }}>
                  <label className="doctor-profile-label">Video Fee (Rs)</label>
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
            <h3 className="doctor-profile-card-title"><FileText size={18} /> About</h3>
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
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {activeSection === 'account' && (
        <AccountInformation doctor={profile} />
      )}
    </div>
  );
}

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="doctor-profile-info-row">
    <span className="doctor-profile-info-icon"><Icon size={18} /></span>
    <div>
      <div className="doctor-profile-info-label">{label}</div>
      <div className="doctor-profile-info-value">{value || 'Not provided'}</div>
    </div>
  </div>
);
