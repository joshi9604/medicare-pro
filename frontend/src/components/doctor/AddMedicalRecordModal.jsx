import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AddMedicalRecordModal({ patient, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    recordType: 'consultation',
    title: '',
    description: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    medications: '',
    notes: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    allergies: '',
    isConfidential: false,
    followUpRequired: false,
    followUpDate: ''
  });
  const [loading, setLoading] = useState(false);

  const recordTypes = [
    { value: 'consultation', label: 'Consultation', icon: '🩺' },
    { value: 'lab_report', label: 'Lab Report', icon: '🧪' },
    { value: 'prescription', label: 'Prescription', icon: '💊' },
    { value: 'vaccination', label: 'Vaccination', icon: '💉' },
    { value: 'surgery', label: 'Surgery', icon: '🏥' },
    { value: 'other', label: 'Other', icon: '📄' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.diagnosis) {
      toast.error('Please fill in required fields');
      return;
    }

    // Debug: Check patient object
    console.log('Patient object:', patient);
    console.log('Patient ID:', patient?.id || patient?._id);

    const patientId = patient?.id || patient?._id;
    if (!patientId) {
      toast.error('Patient ID not found');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare data - remove empty followUpDate if not required
      const dataToSend = {
        ...formData,
        patientId: patientId
      };
      
      if (!dataToSend.followUpRequired) {
        delete dataToSend.followUpDate;
      }
      
      await axios.post('/api/medical-records', dataToSend);
      toast.success('Medical record added successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Add record error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <h2 style={s.title}>📋 Add Medical Record</h2>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Patient Info */}
          <div style={s.patientInfo}>
            <div style={s.patientAvatar}>{patient?.name?.[0] || 'P'}</div>
            <div>
              <div style={s.patientName}>{patient?.name}</div>
              <div style={s.patientEmail}>{patient?.email}</div>
            </div>
          </div>

          {/* Record Type */}
          <div style={s.field}>
            <label style={s.label}>Record Type *</label>
            <div style={s.typeGrid}>
              {recordTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, recordType: type.value }))}
                  style={{
                    ...s.typeBtn,
                    background: formData.recordType === type.value ? '#1565c0' : '#f8fafc',
                    color: formData.recordType === type.value ? '#fff' : '#64748b',
                    borderColor: formData.recordType === type.value ? '#1565c0' : '#e2e8f0'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{type.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: '600' }}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={s.field}>
            <label style={s.label}>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Regular Checkup"
              style={s.input}
              required
            />
          </div>

          {/* Description */}
          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the visit..."
              style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Diagnosis */}
          <div style={s.field}>
            <label style={s.label}>Diagnosis *</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter diagnosis..."
              style={{ ...s.input, minHeight: '80px', resize: 'vertical' }}
              required
            />
          </div>

          {/* Symptoms */}
          <div style={s.field}>
            <label style={s.label}>Symptoms</label>
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder="Enter symptoms..."
              style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Treatment */}
          <div style={s.field}>
            <label style={s.label}>Treatment</label>
            <textarea
              name="treatment"
              value={formData.treatment}
              onChange={handleChange}
              placeholder="Enter treatment plan..."
              style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Medications */}
          <div style={s.field}>
            <label style={s.label}>Medications</label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              placeholder="e.g., Paracetamol 500mg - 1 tablet twice daily"
              style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Vitals Section */}
          <div style={s.field}>
            <label style={s.label}>Vitals</label>
            <div style={s.vitalsGrid}>
              <input
                type="text"
                name="bloodPressure"
                value={formData.bloodPressure}
                onChange={handleChange}
                placeholder="BP (e.g., 120/80)"
                style={s.vitalInput}
              />
              <input
                type="number"
                name="heartRate"
                value={formData.heartRate}
                onChange={handleChange}
                placeholder="Heart Rate (bpm)"
                style={s.vitalInput}
              />
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                placeholder="Temp (°C)"
                style={s.vitalInput}
              />
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg)"
                style={s.vitalInput}
              />
              <input
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="Height (cm)"
                style={s.vitalInput}
              />
            </div>
          </div>

          {/* Allergies */}
          <div style={s.field}>
            <label style={s.label}>Allergies</label>
            <input
              type="text"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              placeholder="e.g., Penicillin, Peanuts"
              style={s.input}
            />
          </div>

          {/* Confidential */}
          <div style={s.field}>
            <label style={s.checkboxLabel}>
              <input
                type="checkbox"
                name="isConfidential"
                checked={formData.isConfidential}
                onChange={handleChange}
                style={s.checkbox}
              />
              <span>🔒 Mark as Confidential</span>
            </label>
          </div>

          {/* Notes */}
          <div style={s.field}>
            <label style={s.label}>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              style={{ ...s.input, minHeight: '60px', resize: 'vertical' }}
            />
          </div>

          {/* Follow Up */}
          <div style={s.field}>
            <label style={s.checkboxLabel}>
              <input
                type="checkbox"
                name="followUpRequired"
                checked={formData.followUpRequired}
                onChange={handleChange}
                style={s.checkbox}
              />
              <span>Follow-up Required</span>
            </label>
            {formData.followUpRequired && (
              <input
                type="date"
                name="followUpDate"
                value={formData.followUpDate}
                onChange={handleChange}
                style={{ ...s.input, marginTop: '10px' }}
                required={formData.followUpRequired}
              />
            )}
          </div>

          {/* Actions */}
          <div style={s.actions}>
            <button type="button" onClick={onClose} style={s.cancelBtn} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f0f4f8' },
  title: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' },
  form: { padding: '20px' },
  patientInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', marginBottom: '20px' },
  patientAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px' },
  patientName: { fontWeight: '700', color: '#1e293b' },
  patientEmail: { fontSize: '13px', color: '#64748b' },
  field: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  typeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '12px', border: '1.5px solid', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f4f8' },
  cancelBtn: { padding: '12px 24px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { padding: '12px 24px', border: 'none', borderRadius: '10px', background: '#1565c0', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  vitalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  vitalInput: { padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none' }
};
