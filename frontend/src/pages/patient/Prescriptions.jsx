import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import PrintablePrescription from '../../components/PrintablePrescription';
import './Prescriptions.css';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

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

  // Print handler
  const [printRx, setPrintRx] = useState(null);
  const printRef = useRef();
  
  // Download as PDF
  const downloadPDF = async () => {
    if (!printRef.current) {
      console.log('Print ref not ready');
      return;
    }
    
    try {
      console.log('Generating PDF...');
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // A4 dimensions in mm
      const pdfWidth = 210;
      const pdfHeight = 297;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit image on page with margins
      const margin = 10;
      const maxWidth = pdfWidth - (margin * 2);
      const maxHeight = pdfHeight - (margin * 2);
      
      // Canvas dimensions in pixels
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      console.log('Canvas size:', { canvasWidth, canvasHeight });
      
      if (canvasWidth === 0 || canvasHeight === 0) {
        throw new Error('Canvas has zero dimensions');
      }
      
      // Convert to mm (assuming 96 DPI: 1 px = 25.4/96 mm)
      const pxToMm = 25.4 / 96 / 2; // divide by 2 because scale is 2
      const imgWidthMM = canvasWidth * pxToMm;
      const imgHeightMM = canvasHeight * pxToMm;
      
      // Calculate scale to fit within page
      const scale = Math.min(maxWidth / imgWidthMM, maxHeight / imgHeightMM, 1);
      
      const finalWidth = imgWidthMM * scale;
      const finalHeight = imgHeightMM * scale;
      
      // Center the image
      const imgX = margin + (maxWidth - finalWidth) / 2;
      const imgY = margin;
      
      console.log('PDF dimensions:', { imgX, imgY, finalWidth, finalHeight });
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
      pdf.save(`${printRx?.prescriptionId || 'Prescription'}.pdf`);
      console.log('PDF saved successfully');
    } catch (err) {
      console.error('PDF generation failed:', err);
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };
  
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: printRx ? `Prescription-${printRx.prescriptionId}` : 'Prescription',
  });
  
  const onPrintClick = (prescription) => {
    setPrintRx(prescription);
  };
  
  // Trigger PDF download when printRx changes
  useEffect(() => {
    if (printRx) {
      // Wait for DOM to update and component to render
      const timer = setTimeout(() => {
        downloadPDF();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [printRx]);
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="prescriptions-page">
        <h1 className="prescriptions-title">💊 My Prescriptions</h1>
        <div className="prescriptions-loading">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <h1 className="prescriptions-title">💊 My Prescriptions</h1>
        <p className="prescriptions-subtitle">View your medical prescriptions and treatment plans</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="prescriptions-empty">
          <div className="prescriptions-empty-icon">💊</div>
          <h3>No prescriptions found</h3>
          <p>You don't have any prescriptions yet.</p>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="prescriptions-card">
              <div className="prescriptions-card-header">
                <div>
                  <div className="prescriptions-rx-id">{rx.prescriptionId}</div>
                  <div className="prescriptions-date">{formatDate(rx.issuedAt)}</div>
                </div>
                <div className="prescriptions-card-actions">
                  <button onClick={() => setSelectedPrescription(rx)} className="prescriptions-view-btn">
                    View Details
                  </button>
                  <button onClick={() => onPrintClick(rx)} className="prescriptions-print-btn">
                    📄 Download PDF
                  </button>
                </div>
              </div>

              <div className="prescriptions-doctor-info">
                <div className="prescriptions-avatar">{rx.doctor?.name?.[0] || 'D'}</div>
                <div>
                  <div className="prescriptions-doctor-name">Dr. {rx.doctor?.name}</div>
                  <div className="prescriptions-label">Prescribed by</div>
                </div>
              </div>

              <div className="prescriptions-diagnosis">
                <strong>Diagnosis:</strong> {rx.diagnosis}
              </div>

              <div className="prescriptions-medicines">
                <div className="prescriptions-section-title">💊 Medicines ({rx.medicines?.length || 0})</div>
                {rx.medicines?.slice(0, 2).map((med, idx) => (
                  <div key={idx} className="prescriptions-medicine-item">
                    <span className="prescriptions-med-name">{med.name}</span>
                    <span className="prescriptions-med-dosage">{med.dosage}</span>
                  </div>
                ))}
                {rx.medicines?.length > 2 && (
                  <div className="prescriptions-more">+{rx.medicines.length - 2} more</div>
                )}
              </div>

              {rx.followUpDate && (
                <div className="prescriptions-follow-up">
                  📅 Follow-up: {formatDate(rx.followUpDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Prescription Detail Modal */}
      {selectedPrescription && (
        <div className="prescriptions-overlay" onClick={(e) => e.target === e.currentTarget && setSelectedPrescription(null)}>
          <div className="prescriptions-modal">
            <div className="prescriptions-modal-header">
              <h2>Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className="prescriptions-close-btn">✕</button>
            </div>

            <div className="prescriptions-modal-content">
              <div className="prescriptions-modal-rx-id">{selectedPrescription.prescriptionId}</div>
              <div className="prescriptions-modal-date">Issued on {formatDate(selectedPrescription.issuedAt)}</div>

              <div className="prescriptions-modal-section">
                <h4>👨‍⚕️ Doctor</h4>
                <p>Dr. {selectedPrescription.doctor?.name}</p>
              </div>

              <div className="prescriptions-modal-section">
                <h4>🩺 Diagnosis</h4>
                <p>{selectedPrescription.diagnosis}</p>
              </div>

              <div className="prescriptions-modal-section">
                <h4>💊 Medicines</h4>
                {selectedPrescription.medicines?.map((med, idx) => (
                  <div key={idx} className="prescriptions-modal-medicine">
                    <div className="prescriptions-modal-med-name">{med.name}</div>
                    <div className="prescriptions-modal-med-details">
                      {med.dosage} • {med.frequency} • {med.duration}
                    </div>
                    {med.instructions && (
                      <div className="prescriptions-modal-med-instructions">📋 {med.instructions}</div>
                    )}
                  </div>
                ))}
              </div>

              {selectedPrescription.labTests?.length > 0 && (
                <div className="prescriptions-modal-section">
                  <h4>🧪 Lab Tests</h4>
                  {selectedPrescription.labTests.map((test, idx) => (
                    <div key={idx} className="prescriptions-lab-test">
                      <div>{test.testName}</div>
                      {test.instructions && <div className="prescriptions-lab-instructions">{test.instructions}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selectedPrescription.advice && (
                <div className="prescriptions-modal-section">
                  <h4>💡 Doctor's Advice</h4>
                  <p>{selectedPrescription.advice}</p>
                </div>
              )}

              {selectedPrescription.followUpDate && (
                <div className="prescriptions-follow-up-badge">
                  📅 Follow-up Date: {formatDate(selectedPrescription.followUpDate)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden Printable Component - Always rendered with first prescription or empty */}
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
