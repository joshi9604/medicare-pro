import React, { forwardRef } from 'react';

const PrintablePrescription = forwardRef(({ prescription, patient, doctor }, ref) => {
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
  
  return (
    <div ref={ref} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>🏥</div>
        <div style={styles.hospitalInfo}>
          <h1 style={styles.hospitalName}>MediCare Pro Hospital</h1>
          <p style={styles.hospitalAddress}>123 Healthcare Avenue, Mumbai, Maharashtra - 400001</p>
          <p style={styles.hospitalContact}>📞 +91 98765 43210 | ✉️ contact@medicarepro.com</p>
        </div>
      </div>

      {/* Prescription Title */}
      <div style={styles.titleBar}>
        <h2 style={styles.title}>PRESCRIPTION</h2>
        <span style={styles.prescriptionId}>#{prescription?.prescriptionId || 'N/A'}</span>
      </div>

      {/* Patient & Doctor Info */}
      <div style={styles.infoGrid}>
        <div style={styles.infoBox}>
          <h3 style={styles.infoLabel}>Patient Information</h3>
          <p style={styles.infoText}><strong>Name:</strong> {patient?.name || 'N/A'}</p>
          <p style={styles.infoText}><strong>Age:</strong> {patient?.dateOfBirth ? Math.floor((new Date() - new Date(patient.dateOfBirth)) / 31557600000) : 'N/A'} years</p>
          <p style={styles.infoText}><strong>Gender:</strong> {patient?.gender || 'N/A'}</p>
          <p style={styles.infoText}><strong>Blood Group:</strong> {patient?.bloodGroup || 'N/A'}</p>
        </div>
        <div style={styles.infoBox}>
          <h3 style={styles.infoLabel}>Doctor Information</h3>
          <p style={styles.infoText}><strong>Name:</strong> Dr. {doctor?.name || 'N/A'}</p>
          <p style={styles.infoText}><strong>Specialization:</strong> {doctor?.specialization || 'N/A'}</p>
          <p style={styles.infoText}><strong>License:</strong> {doctor?.licenseNumber || 'N/A'}</p>
          <p style={styles.infoText}><strong>Date:</strong> {formatDate(prescription?.createdAt)}</p>
        </div>
      </div>

      {/* Diagnosis */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🩺 Diagnosis</h3>
        <p style={styles.diagnosis}>{prescription?.diagnosis || 'No diagnosis provided'}</p>
      </div>

      {/* Medicines */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>💊 Prescribed Medicines</h3>
        {prescription?.medicines?.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>#</th>
                <th style={styles.th}>Medicine</th>
                <th style={styles.th}>Dosage</th>
                <th style={styles.th}>Frequency</th>
                <th style={styles.th}>Duration</th>
              </tr>
            </thead>
            <tbody>
              {prescription.medicines.map((med, idx) => (
                <tr key={idx} style={styles.tableRow}>
                  <td style={styles.td}>{idx + 1}</td>
                  <td style={styles.td}><strong>{med.name}</strong></td>
                  <td style={styles.td}>{med.dosage}</td>
                  <td style={styles.td}>{med.frequency}</td>
                  <td style={styles.td}>{med.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={styles.noData}>No medicines prescribed</p>
        )}
      </div>

      {/* Advice */}
      {prescription?.advice && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📋 Doctor's Advice</h3>
          <p style={styles.advice}>{prescription.advice}</p>
        </div>
      )}

      {/* Follow Up */}
      {prescription?.followUpDate && (
        <div style={styles.followUp}>
          <strong>📅 Follow-up Date:</strong> {formatDate(prescription.followUpDate)}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.signature}>
          <div style={styles.signatureLine}></div>
          <p style={styles.signatureText}>Doctor's Signature</p>
        </div>
        <div style={styles.footerNote}>
          <p>🩺 This prescription is valid for 30 days from the date of issue</p>
          <p>🏥 MediCare Pro - Your Health, Our Priority</p>
        </div>
      </div>
    </div>
  );
});

const styles = {
  container: {
    padding: '40px',
    fontFamily: 'Arial, sans-serif',
    background: '#fff',
    color: '#333',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    paddingBottom: '20px',
    borderBottom: '3px solid #1565c0',
    marginBottom: '20px',
  },
  logo: {
    fontSize: '60px',
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    color: '#1565c0',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  hospitalAddress: {
    color: '#666',
    fontSize: '14px',
    margin: '2px 0',
  },
  hospitalContact: {
    color: '#666',
    fontSize: '13px',
    margin: '2px 0',
  },
  titleBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#1565c0',
    color: '#fff',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  prescriptionId: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  infoBox: {
    background: '#f8fafc',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  infoLabel: {
    color: '#1565c0',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    borderBottom: '2px solid #1565c0',
    paddingBottom: '5px',
  },
  infoText: {
    margin: '5px 0',
    fontSize: '13px',
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    color: '#1565c0',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
    paddingBottom: '5px',
    borderBottom: '2px solid #e2e8f0',
  },
  diagnosis: {
    background: '#fef3c7',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #f59e0b',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  tableHeader: {
    background: '#1565c0',
    color: '#fff',
  },
  th: {
    padding: '10px',
    textAlign: 'left',
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '10px',
  },
  noData: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: '20px',
  },
  advice: {
    background: '#e0f2fe',
    padding: '15px',
    borderRadius: '8px',
    borderLeft: '4px solid #0284c7',
    fontSize: '14px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
  },
  followUp: {
    background: '#dcfce7',
    padding: '12px 15px',
    borderRadius: '8px',
    borderLeft: '4px solid #16a34a',
    fontSize: '14px',
    marginBottom: '20px',
  },
  footer: {
    marginTop: '40px',
    paddingTop: '20px',
    borderTop: '2px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  signature: {
    textAlign: 'center',
  },
  signatureLine: {
    width: '200px',
    height: '1px',
    background: '#333',
    marginBottom: '10px',
  },
  signatureText: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  footerNote: {
    textAlign: 'right',
    fontSize: '11px',
    color: '#666',
  },
};

export default PrintablePrescription;
