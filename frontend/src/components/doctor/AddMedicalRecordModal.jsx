import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Activity, CalendarDays, FileText, FlaskConical, HeartPulse, Lock, Pill, Save, Stethoscope, Syringe, User, X } from 'lucide-react';
import './AddMedicalRecordModal.css';

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
    <div className="add-medical-record-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="add-medical-record-modal">
        <div className="add-medical-record-header">
          <h2 className="add-medical-record-title"><FileText size={20} /> Add Medical Record</h2>
          <button onClick={onClose} className="add-medical-record-close-btn" type="button" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-medical-record-form">
          <div className="add-medical-record-patient-info">
            <div className="add-medical-record-patient-avatar">{patient?.name?.[0] || 'P'}</div>
            <div>
              <div className="add-medical-record-patient-name"><User size={15} /> {patient?.name}</div>
              <div className="add-medical-record-patient-email">{patient?.email}</div>
            </div>
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Record Type *</label>
            <div className="add-medical-record-type-grid">
              {recordTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, recordType: type.value }))}
                    className={`add-medical-record-type-btn ${formData.recordType === type.value ? 'active' : ''}`}
                  >
                    <Icon size={18} />
                    <span className="add-medical-record-type-label">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Regular Checkup" className="add-medical-record-input" required />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of the visit..." className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-sm" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Diagnosis *</label>
            <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="Enter diagnosis..." className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-md" required />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Symptoms</label>
            <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} placeholder="Enter symptoms..." className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-sm" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Treatment</label>
            <textarea name="treatment" value={formData.treatment} onChange={handleChange} placeholder="Enter treatment plan..." className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-sm" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Medications</label>
            <textarea name="medications" value={formData.medications} onChange={handleChange} placeholder="e.g., Paracetamol 500mg - 1 tablet twice daily" className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-sm" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label"><HeartPulse size={14} /> Vitals</label>
            <div className="add-medical-record-vitals-grid">
              <input type="text" name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} placeholder="BP (e.g., 120/80)" className="add-medical-record-vital-input" />
              <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} placeholder="Heart Rate (bpm)" className="add-medical-record-vital-input" />
              <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="Temp (C)" className="add-medical-record-vital-input" />
              <input type="number" step="0.1" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight (kg)" className="add-medical-record-vital-input" />
              <input type="number" step="0.1" name="height" value={formData.height} onChange={handleChange} placeholder="Height (cm)" className="add-medical-record-vital-input" />
            </div>
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Allergies</label>
            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Penicillin, Peanuts" className="add-medical-record-input" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-checkbox-label">
              <input type="checkbox" name="isConfidential" checked={formData.isConfidential} onChange={handleChange} className="add-medical-record-checkbox" />
              <span className="add-medical-record-checkbox-text"><Lock size={15} /> Mark as Confidential</span>
            </label>
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-label">Additional Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes..." className="add-medical-record-input add-medical-record-textarea add-medical-record-textarea-sm" />
          </div>

          <div className="add-medical-record-field">
            <label className="add-medical-record-checkbox-label">
              <input type="checkbox" name="followUpRequired" checked={formData.followUpRequired} onChange={handleChange} className="add-medical-record-checkbox" />
              <span className="add-medical-record-checkbox-text"><CalendarDays size={15} /> Follow-up Required</span>
            </label>
            {formData.followUpRequired && (
              <input type="date" name="followUpDate" value={formData.followUpDate} onChange={handleChange} className="add-medical-record-input add-medical-record-followup-input" required={formData.followUpRequired} />
            )}
          </div>

          <div className="add-medical-record-actions">
            <button type="button" onClick={onClose} className="add-medical-record-cancel-btn" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="add-medical-record-submit-btn" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> <span>Save Record</span></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
