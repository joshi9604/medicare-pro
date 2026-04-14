import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalendarDays, FileDown, FileText, FlaskConical, Lightbulb, Pill, Stethoscope } from 'lucide-react';
import PrintablePrescription from '../../components/PrintablePrescription';
import './Prescriptions.css';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const downloadPDF = async () => {
    if (!printRef.current) return;

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
    } catch (err) {
      toast.error('Failed to generate PDF: ' + err.message);
    }
  };

  useReactToPrint({
    contentRef: printRef,
    documentTitle: printRx ? `Prescription-${printRx.prescriptionId}` : 'Prescription',
  });

  useEffect(() => {
    if (printRx) {
      const timer = setTimeout(() => {
        downloadPDF();
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [printRx]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="prescriptions-page">
        <h1 className="prescriptions-title"><Pill size={24} /> My Prescriptions</h1>
        <div className="prescriptions-loading">Loading prescriptions...</div>
      </div>
    );
  }

  return (
    <div className="prescriptions-page">
      <div className="prescriptions-header">
        <h1 className="prescriptions-title"><Pill size={24} /> My Prescriptions</h1>
        <p className="prescriptions-subtitle">View your medical prescriptions and treatment plans</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="prescriptions-empty">
          <div className="prescriptions-empty-icon"><Pill size={42} /></div>
          <h3>No prescriptions found</h3>
          <p>You don't have any prescriptions yet.</p>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="prescriptions-card">
              <div className="prescriptions-card-header">
                <div>
                  <div className="prescriptions-rx-id">{prescription.prescriptionId}</div>
                  <div className="prescriptions-date">{formatDate(prescription.issuedAt)}</div>
                </div>
                <div className="prescriptions-card-actions">
                  <button onClick={() => setSelectedPrescription(prescription)} className="prescriptions-view-btn" type="button">
                    View Details
                  </button>
                  <button onClick={() => setPrintRx(prescription)} className="prescriptions-print-btn" type="button">
                    <FileDown size={15} /> Download PDF
                  </button>
                </div>
              </div>

              <div className="prescriptions-doctor-info">
                <div className="prescriptions-avatar">{prescription.doctor?.name?.[0] || 'D'}</div>
                <div>
                  <div className="prescriptions-doctor-name">Dr. {prescription.doctor?.name}</div>
                  <div className="prescriptions-label">Prescribed by</div>
                </div>
              </div>

              <div className="prescriptions-diagnosis">
                <strong>Diagnosis:</strong> {prescription.diagnosis}
              </div>

              <div className="prescriptions-medicines">
                <div className="prescriptions-section-title"><Pill size={14} /> Medicines ({prescription.medicines?.length || 0})</div>
                {prescription.medicines?.slice(0, 2).map((medicine, index) => (
                  <div key={index} className="prescriptions-medicine-item">
                    <span className="prescriptions-med-name">{medicine.name}</span>
                    <span className="prescriptions-med-dosage">{medicine.dosage}</span>
                  </div>
                ))}
                {prescription.medicines?.length > 2 && (
                  <div className="prescriptions-more">+{prescription.medicines.length - 2} more</div>
                )}
              </div>

              {prescription.followUpDate && (
                <div className="prescriptions-follow-up">
                  <CalendarDays size={14} /> Follow-up: {formatDate(prescription.followUpDate)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedPrescription && (
        <div className="prescriptions-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedPrescription(null)}>
          <div className="prescriptions-modal">
            <div className="prescriptions-modal-header">
              <h2>Prescription Details</h2>
              <button onClick={() => setSelectedPrescription(null)} className="prescriptions-close-btn" type="button">x</button>
            </div>

            <div className="prescriptions-modal-content">
              <div className="prescriptions-modal-rx-id">{selectedPrescription.prescriptionId}</div>
              <div className="prescriptions-modal-date">Issued on {formatDate(selectedPrescription.issuedAt)}</div>

              <div className="prescriptions-modal-section">
                <h4><Stethoscope size={15} /> Doctor</h4>
                <p>Dr. {selectedPrescription.doctor?.name}</p>
              </div>

              <div className="prescriptions-modal-section">
                <h4><FileText size={15} /> Diagnosis</h4>
                <p>{selectedPrescription.diagnosis}</p>
              </div>

              <div className="prescriptions-modal-section">
                <h4><Pill size={15} /> Medicines</h4>
                {selectedPrescription.medicines?.map((medicine, index) => (
                  <div key={index} className="prescriptions-modal-medicine">
                    <div className="prescriptions-modal-med-name">{medicine.name}</div>
                    <div className="prescriptions-modal-med-details">
                      {medicine.dosage} - {medicine.frequency} - {medicine.duration}
                    </div>
                    {medicine.instructions && (
                      <div className="prescriptions-modal-med-instructions">{medicine.instructions}</div>
                    )}
                  </div>
                ))}
              </div>

              {selectedPrescription.labTests?.length > 0 && (
                <div className="prescriptions-modal-section">
                  <h4><FlaskConical size={15} /> Lab Tests</h4>
                  {selectedPrescription.labTests.map((test, index) => (
                    <div key={index} className="prescriptions-lab-test">
                      <div>{test.testName}</div>
                      {test.instructions && <div className="prescriptions-lab-instructions">{test.instructions}</div>}
                    </div>
                  ))}
                </div>
              )}

              {selectedPrescription.advice && (
                <div className="prescriptions-modal-section">
                  <h4><Lightbulb size={15} /> Doctor's Advice</h4>
                  <p>{selectedPrescription.advice}</p>
                </div>
              )}

              {selectedPrescription.followUpDate && (
                <div className="prescriptions-follow-up-badge">
                  <CalendarDays size={15} /> Follow-up Date: {formatDate(selectedPrescription.followUpDate)}
                </div>
              )}
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
