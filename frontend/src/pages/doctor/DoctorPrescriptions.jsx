import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CalendarDays, ClipboardList, Pill, Printer, Search, User } from 'lucide-react';
import PrintablePrescription from '../../components/PrintablePrescription';
import './DoctorPrescriptions.css';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [printRx, setPrintRx] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/prescriptions');
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const matchesSearch = prescription.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());

    const now = new Date();
    const prescriptionDate = new Date(prescription.createdAt);
    const daysDiff = (now - prescriptionDate) / (1000 * 60 * 60 * 24);

    let matchesTime = true;
    if (filter === 'recent') matchesTime = daysDiff <= 30;
    if (filter === 'old') matchesTime = daysDiff > 30;

    return matchesSearch && matchesTime;
  });

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const downloadPDF = async () => {
    if (!printRef.current || !printRx) return;

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      const pxToMm = 25.4 / 96 / 2;
      const imgWidthMM = canvas.width * pxToMm;
      const imgHeightMM = canvas.height * pxToMm;
      const scale = Math.min(maxWidth / imgWidthMM, maxHeight / imgHeightMM, 1);
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;
      const imgX = margin + (maxWidth - finalWidth) / 2;
      const imgY = margin;

      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      pdf.save(`${printRx?.prescriptionId || 'Prescription'}.pdf`);
      toast.success('Prescription downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    } finally {
      setPrintRx(null);
    }
  };

  useEffect(() => {
    if (!printRx) return undefined;

    const timer = setTimeout(() => {
      downloadPDF();
    }, 500);

    return () => clearTimeout(timer);
  }, [printRx]);

  if (loading) {
    return (
      <div className="doctor-prescriptions-page">
        <h1 className="doctor-prescriptions-title"><ClipboardList size={24} /> My Prescriptions</h1>
        <div className="doctor-prescriptions-loading">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="doctor-prescriptions-page">
      <div className="doctor-prescriptions-header">
        <div>
          <h1 className="doctor-prescriptions-title"><ClipboardList size={24} /> My Prescriptions</h1>
          <p className="doctor-prescriptions-subtitle">View all prescriptions you have written for patients</p>
        </div>
      </div>

      <div className="doctor-prescriptions-stats-grid">
        <div className="doctor-prescriptions-stat-card">
          <div className="doctor-prescriptions-stat-value">{prescriptions.length}</div>
          <div className="doctor-prescriptions-stat-label">Total Prescriptions</div>
        </div>
        <div className="doctor-prescriptions-stat-card">
          <div className="doctor-prescriptions-stat-value">
            {prescriptions.filter((prescription) => ((new Date() - new Date(prescription.createdAt)) / (1000 * 60 * 60 * 24)) <= 30).length}
          </div>
          <div className="doctor-prescriptions-stat-label">Last 30 Days</div>
        </div>
        <div className="doctor-prescriptions-stat-card">
          <div className="doctor-prescriptions-stat-value">
            {[...new Set(prescriptions.map((prescription) => prescription.patientId))].length}
          </div>
          <div className="doctor-prescriptions-stat-label">Unique Patients</div>
        </div>
      </div>

      <div className="doctor-prescriptions-controls">
        <div className="doctor-prescriptions-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="doctor-prescriptions-search-input"
          />
        </div>
        <div className="doctor-prescriptions-filter-group">
          {['all', 'recent', 'old'].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`doctor-prescriptions-filter-btn${filter === value ? ' active' : ''}`}
              type="button"
            >
              {value === 'all' ? 'All' : value === 'recent' ? 'Last 30 Days' : 'Older'}
            </button>
          ))}
        </div>
      </div>

      {filteredPrescriptions.length === 0 ? (
        <div className="doctor-prescriptions-empty">
          <div className="doctor-prescriptions-empty-icon"><Pill size={44} /></div>
          <h3>No prescriptions found</h3>
          <p>{searchTerm || filter !== 'all' ? 'Try changing your search or filter' : "You haven't written any prescriptions yet."}</p>
        </div>
      ) : (
        <div className="doctor-prescriptions-table-container">
          <table className="doctor-prescriptions-table">
            <thead>
              <tr>
                <th className="doctor-prescriptions-th">Patient</th>
                <th className="doctor-prescriptions-th">Diagnosis</th>
                <th className="doctor-prescriptions-th">Date Created</th>
                <th className="doctor-prescriptions-th">Medicines</th>
                <th className="doctor-prescriptions-th">Follow-up</th>
                <th className="doctor-prescriptions-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrescriptions.map((prescription) => {
                const medicineCount = prescription.medications?.length || 0;
                const hasFollowUp = prescription.followUpDate;

                return (
                  <tr key={prescription.id} className="doctor-prescriptions-tr">
                    <td className="doctor-prescriptions-td" data-label="Patient">
                      <div className="doctor-prescriptions-patient-cell">
                        <div className="doctor-prescriptions-avatar">{prescription.patient?.name?.[0] || 'P'}</div>
                        <div>
                          <div className="doctor-prescriptions-patient-name">{prescription.patient?.name || 'N/A'}</div>
                          <div className="doctor-prescriptions-patient-info">{prescription.patient?.age || 'N/A'} yrs - {prescription.patient?.gender || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="doctor-prescriptions-td" data-label="Diagnosis">
                      <span className="doctor-prescriptions-diagnosis">{prescription.diagnosis || '-'}</span>
                    </td>
                    <td className="doctor-prescriptions-td" data-label="Date Created">
                      <div className="doctor-prescriptions-datetime">{formatDate(prescription.createdAt)}</div>
                    </td>
                    <td className="doctor-prescriptions-td" data-label="Medicines">
                      <span className="doctor-prescriptions-medicine-count"><Pill size={14} /> {medicineCount} medicine{medicineCount !== 1 ? 's' : ''}</span>
                    </td>
                    <td className="doctor-prescriptions-td" data-label="Follow-up">
                      {hasFollowUp ? (
                        <span className="doctor-prescriptions-followup"><CalendarDays size={14} /> {formatDate(prescription.followUpDate)}</span>
                      ) : (
                        <span className="doctor-prescriptions-no-followup">-</span>
                      )}
                    </td>
                    <td className="doctor-prescriptions-td" data-label="Actions">
                      <div className="doctor-prescriptions-row-actions">
                        <button onClick={() => setSelectedPrescription(prescription)} className="doctor-prescriptions-view-btn" type="button">View</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedPrescription && (
        <div className="doctor-prescriptions-modal-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedPrescription(null)}>
          <div className="doctor-prescriptions-modal">
            <div className="doctor-prescriptions-modal-header">
              <h2 className="doctor-prescriptions-modal-title"><ClipboardList size={18} /> Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className="doctor-prescriptions-close-btn" type="button">x</button>
            </div>

            <div className="doctor-prescriptions-modal-content">
              <div className="doctor-prescriptions-section">
                <h3 className="doctor-prescriptions-section-title"><User size={16} /> Patient Information</h3>
                <div className="doctor-prescriptions-info-grid">
                  <div><strong>Name:</strong> {selectedPrescription.patient?.name}</div>
                  <div><strong>Age/Gender:</strong> {selectedPrescription.patient?.age || 'N/A'} / {selectedPrescription.patient?.gender || 'N/A'}</div>
                  <div><strong>Blood Group:</strong> {selectedPrescription.patient?.bloodGroup || 'N/A'}</div>
                  <div><strong>Phone:</strong> {selectedPrescription.patient?.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="doctor-prescriptions-section">
                <h3 className="doctor-prescriptions-section-title"><ClipboardList size={16} /> Medical Information</h3>
                <div className="doctor-prescriptions-medical-info">
                  <div className="doctor-prescriptions-info-item">
                    <strong>Diagnosis:</strong>
                    <p>{selectedPrescription.diagnosis}</p>
                  </div>
                  <div className="doctor-prescriptions-info-item">
                    <strong>Advice:</strong>
                    <p>{selectedPrescription.advice || '-'}</p>
                  </div>
                  {selectedPrescription.followUpDate && (
                    <div className="doctor-prescriptions-info-item">
                      <strong>Follow-up Date:</strong>
                      <p className="doctor-prescriptions-highlight">{formatDate(selectedPrescription.followUpDate)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="doctor-prescriptions-section">
                <h3 className="doctor-prescriptions-section-title"><Pill size={16} /> Medications</h3>
                {selectedPrescription.medications && selectedPrescription.medications.length > 0 ? (
                  <div className="doctor-prescriptions-medicines-list">
                    {selectedPrescription.medications.map((medication, index) => (
                      <div key={index} className="doctor-prescriptions-medicine-item">
                        <div className="doctor-prescriptions-medicine-header">
                          <span className="doctor-prescriptions-medicine-name">{medication.name}</span>
                          <span className="doctor-prescriptions-medicine-dosage">{medication.dosage}</span>
                        </div>
                        <div className="doctor-prescriptions-medicine-details">
                          {medication.frequency && <span>{medication.frequency}</span>}
                          {medication.duration && <span>{medication.duration}</span>}
                          {medication.instructions && <span>{medication.instructions}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="doctor-prescriptions-no-meds">No medications prescribed</p>
                )}
              </div>

              <div className="doctor-prescriptions-modal-footer">
                <div className="doctor-prescriptions-footer-item"><strong>Created:</strong> {formatDate(selectedPrescription.createdAt)}</div>
                <div className="doctor-prescriptions-footer-item"><strong>Appointment ID:</strong> {selectedPrescription.appointmentId?.slice(0, 8) || 'N/A'}</div>
              </div>
            </div>

              <div className="doctor-prescriptions-modal-actions">
              <button onClick={() => setSelectedPrescription(null)} className="doctor-prescriptions-cancel-btn" type="button">Close</button>
              <button
                onClick={() => setPrintRx(selectedPrescription)}
                className="doctor-prescriptions-print-btn"
                type="button"
              >
                <Printer size={15} /> Print Prescription
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <PrintablePrescription
          ref={printRef}
          prescription={printRx || prescriptions[0] || {}}
          patient={printRx?.patient || prescriptions[0]?.patient || {}}
          doctor={printRx?.doctor || prescriptions[0]?.doctor || {}}
        />
      </div>
    </div>
  );
}
