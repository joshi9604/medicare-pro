import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, CalendarDays, FileText, FlaskConical, HeartPulse, Lock, Pill, Save, Stethoscope, Syringe, User, X } from 'lucide-react';

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
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    const onResize = () => setIsCompact(window.innerWidth <= 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const recordTypes = [
    { value: 'consultation', label: 'Consultation', icon: Stethoscope },
    { value: 'lab_report', label: 'Lab Report', icon: FlaskConical },
    { value: 'prescription', label: 'Prescription', icon: Pill },
    { value: 'vaccination', label: 'Vaccination', icon: Syringe },
    { value: 'surgery', label: 'Surgery', icon: Activity },
    { value: 'other', label: 'Other', icon: FileText }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.diagnosis) {
      toast.error('Please fill in required fields');
      return;
    }

    const patientId = patient?.id || patient?._id;
    if (!patientId) {
      toast.error('Patient ID not found');
      return;
    }

    try {
      setLoading(true);
      const dataToSend = { ...formData, patientId };

      if (!dataToSend.followUpRequired) {
        delete dataToSend.followUpDate;
      }

      await axios.post('/api/medical-records', dataToSend);
      toast.success('Medical record added successfully');
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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, ...(isCompact ? s.modalCompact : {}) }}>
        <div style={{ ...s.header, ...(isCompact ? s.headerCompact : {}) }}>
          <h2 style={s.title}><FileText size={20} /> Add Medical Record</h2>
          <button onClick={onClose} style={s.closeBtn} type="button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={{ ...s.patientInfo, ...(isCompact ? s.patientInfoCompact : {}) }}>
            <div style={s.patientAvatar}>{patient?.name?.[0] || 'P'}</div>
            <div>
              <div style={s.patientName}><User size={15} /> {patient?.name}</div>
              <div style={s.patientEmail}>{patient?.email}</div>
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Record Type *</label>
            <div style={{ ...s.typeGrid, ...(isCompact ? s.typeGridCompact : {}) }}>
              {recordTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, recordType: type.value }))}
                    style={{
                      ...s.typeBtn,
                      ...(isCompact ? s.typeBtnCompact : {}),
                      background: formData.recordType === type.value ? '#1565c0' : '#f8fafc',
                      color: formData.recordType === type.value ? '#fff' : '#64748b',
                      borderColor: formData.recordType === type.value ? '#1565c0' : '#e2e8f0'
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Regular Checkup" style={s.input} required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the visit..." style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Diagnosis *</label>
            <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Enter diagnosis..." style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} required />
          </div>

          <div style={s.field}>
            <label style={s.label}>Symptoms</label>
            <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} placeholder="Enter symptoms..." style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Treatment</label>
            <textarea name="treatment" value={formData.treatment} onChange={handleChange} placeholder="Enter treatment plan..." style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={s.field}>
            <label style={s.label}>Medications</label>
            <textarea name="medications" value={formData.medications} onChange={handleChange} placeholder="e.g., Paracetamol 500mg - 1 tablet twice daily" style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={s.field}>
            <label style={s.label}><HeartPulse size={14} /> Vitals</label>
            <div style={{ ...s.vitalsGrid, ...(isCompact ? s.vitalsGridCompact : {}) }}>
              <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="BP (e.g., 120/80)" style={s.vitalInput} />
              <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} placeholder="Heart Rate (bpm)" style={s.vitalInput} />
              <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Temp (C)" style={s.vitalInput} />
              <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" style={s.vitalInput} />
              <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" style={s.vitalInput} />
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>Allergies</label>
            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Penicillin, Peanuts" style={s.input} />
          </div>

          <div style={s.field}>
            <label style={s.checkboxLabel}>
              <input type="checkbox" name="isConfidential" checked={formData.isConfidential} onChange={handleChange} style={s.checkbox} />
              <span style={s.checkboxText}><Lock size={15} /> Mark as Confidential</span>
            </label>
          </div>

          <div style={s.field}>
            <label style={s.label}>Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." style={{ ...s.input, minHeight: '60px', resize: 'vertical' }} />
          </div>

          <div style={s.field}>
            <label style={s.checkboxLabel}>
              <input type="checkbox" name="followUpRequired" checked={formData.followUpRequired} onChange={handleChange} style={s.checkbox} />
              <span style={s.checkboxText}><CalendarDays size={15} /> Follow-up Required</span>
            </label>
            {formData.followUpRequired && (
              <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} style={{ ...s.input, marginTop: '10px' }} required={formData.followUpRequired} />
            )}
          </div>

          <div style={{ ...s.actions, ...(isCompact ? s.actionsCompact : {}) }}>
            <button type="button" onClick={onClose} style={{ ...s.cancelBtn, ...(isCompact ? s.buttonCompact : {}) }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" style={{ ...s.submitBtn, ...(isCompact ? s.buttonCompact : {}) }} disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> <span>Save Record</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const s = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
  modal: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(15,23,42,0.25)' },
  modalCompact: { maxHeight: '95vh', borderRadius: '16px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f0f4f8', gap: '12px' },
  headerCompact: { padding: '16px' },
  title: { margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  closeBtn: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', width: '36px', height: '36px', cursor: 'pointer', color: '#64748b', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  form: { padding: '20px' },
  patientInfo: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: '#f0fdf4', borderRadius: '12px', marginBottom: '20px' },
  patientInfoCompact: { alignItems: 'flex-start' },
  patientAvatar: { width: '48px', height: '48px', borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '20px', flexShrink: 0 },
  patientName: { fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' },
  patientEmail: { fontSize: '13px', color: '#64748b' },
  field: { marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', flexWrap: 'wrap' },
  input: { width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  typeGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' },
  typeGridCompact: { gridTemplateColumns: 'repeat(2, 1fr)' },
  typeBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', border: '1.5px solid', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', minHeight: '88px' },
  typeBtnCompact: { minHeight: '76px', padding: '10px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', color: '#374151', flexWrap: 'wrap' },
  checkboxText: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer' },
  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #f0f4f8' },
  actionsCompact: { flexDirection: 'column' },
  cancelBtn: { padding: '12px 24px', border: '1.5px solid #e2e8f0', borderRadius: '10px', background: '#fff', color: '#64748b', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  submitBtn: { padding: '12px 24px', border: 'none', borderRadius: '10px', background: '#1565c0', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  buttonCompact: { width: '100%' },
  vitalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' },
  vitalsGridCompact: { gridTemplateColumns: '1fr' },
  vitalInput: { padding: '10px 12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' }
};
