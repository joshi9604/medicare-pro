import React, { forwardRef } from 'react';
import { Activity, Building2, CalendarDays, FileText, HeartPulse, Mail, MapPin, Phone, Pill, Stethoscope } from 'lucide-react';
import './ui/PrintablePrescription.css';

const PrintablePrescription = forwardRef(({ prescription, patient, doctor }, ref) => {
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    return Math.floor((new Date() - new Date(dateOfBirth)) / 31557600000);
  };

  return (
    <div ref={ref} className="printable-prescription">
      <div className="pp-header">
        <div className="pp-logo">
          <Building2 size={34} />
        </div>
        <div className="pp-hospital-info">
          <h1 className="pp-hospital-name">MediCare Pro Hospital</h1>
          <p className="pp-hospital-address">
            <MapPin size={14} />
            <span>123 Healthcare Avenue, Mumbai, Maharashtra - 400001</span>
          </p>
          <p className="pp-hospital-contact">
            <Phone size={14} />
            <span>+91 98765 43210</span>
            <Mail size={14} />
            <span>contact@medicarepro.com</span>
          </p>
        </div>
      </div>

      <div className="pp-title-bar">
        <h2 className="pp-title"><FileText size={18} /> Prescription</h2>
        <span className="pp-prescription-id">#{prescription?.prescriptionId || 'N/A'}</span>
      </div>

      <div className="pp-info-grid">
        <div className="pp-info-box">
          <h3 className="pp-info-label"><HeartPulse size={16} /> Patient Information</h3>
          <p className="pp-info-text"><strong>Name:</strong> {patient?.name || 'N/A'}</p>
          <p className="pp-info-text"><strong>Age:</strong> {calculateAge(patient?.dateOfBirth)} years</p>
          <p className="pp-info-text"><strong>Gender:</strong> {patient?.gender || 'N/A'}</p>
          <p className="pp-info-text"><strong>Blood Group:</strong> {patient?.bloodGroup || 'N/A'}</p>
        </div>

        <div className="pp-info-box">
          <h3 className="pp-info-label"><Stethoscope size={16} /> Doctor Information</h3>
          <p className="pp-info-text"><strong>Name:</strong> Dr. {doctor?.name || 'N/A'}</p>
          <p className="pp-info-text"><strong>Specialization:</strong> {doctor?.specialization || 'N/A'}</p>
          <p className="pp-info-text"><strong>License:</strong> {doctor?.licenseNumber || 'N/A'}</p>
          <p className="pp-info-text"><strong>Date:</strong> {formatDate(prescription?.createdAt)}</p>
        </div>
      </div>

      <div className="pp-section">
        <h3 className="pp-section-title"><Activity size={16} /> Diagnosis</h3>
        <p className="pp-diagnosis">{prescription?.diagnosis || 'No diagnosis provided'}</p>
      </div>

      <div className="pp-section">
        <h3 className="pp-section-title"><Pill size={16} /> Prescribed Medicines</h3>
        {prescription?.medicines?.length > 0 ? (
          <div className="pp-table-wrap">
            <table className="pp-table">
              <thead>
                <tr className="pp-table-header">
                  <th className="pp-th">#</th>
                  <th className="pp-th">Medicine</th>
                  <th className="pp-th">Dosage</th>
                  <th className="pp-th">Frequency</th>
                  <th className="pp-th">Duration</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((med, idx) => (
                  <tr key={idx} className="pp-table-row">
                    <td className="pp-td">{idx + 1}</td>
                    <td className="pp-td"><strong>{med.name}</strong></td>
                    <td className="pp-td">{med.dosage}</td>
                    <td className="pp-td">{med.frequency}</td>
                    <td className="pp-td">{med.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pp-no-data">No medicines prescribed</p>
        )}
      </div>

      {prescription?.advice && (
        <div className="pp-section">
          <h3 className="pp-section-title"><FileText size={16} /> Doctor&apos;s Advice</h3>
          <p className="pp-advice">{prescription.advice}</p>
        </div>
      )}

      {prescription?.followUpDate && (
        <div className="pp-follow-up">
          <CalendarDays size={16} />
          <strong>Follow-up Date:</strong>
          <span>{formatDate(prescription.followUpDate)}</span>
        </div>
      )}

      <div className="pp-footer">
        <div className="pp-signature">
          <div className="pp-signature-line"></div>
          <p className="pp-signature-text">Doctor&apos;s Signature</p>
        </div>
        <div className="pp-footer-note">
          <p><Activity size={14} /> This prescription is valid for 30 days from the date of issue</p>
          <p><Building2 size={14} /> MediCare Pro - Your Health, Our Priority</p>
        </div>
      </div>
    </div>
  );
});

export default PrintablePrescription;
