import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CalendarDays, ClipboardList, FileDown, Pill, Printer, Stethoscope, TestTube2, Trash2 } from 'lucide-react';
import './MedicalRecords.css';

export default function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filter, setFilter] = useState('all');
  const printRef = useRef();

  useReactToPrint({
    contentRef: printRef,
    documentTitle: `Medical-Record-${selectedRecord?.id?.slice(0, 8)}`,
    onAfterPrint: () => toast.success('Printed successfully!'),
    onPrintError: (err) => console.error('Print error:', err)
  });

  const handleDelete = async (recordId) => {
    if (!window.confirm('Are you sure you want to delete this medical record?')) return;

    try {
      await axios.delete(`/api/medical-records/${recordId}`);
      toast.success('Medical record deleted successfully!');
      setRecords((prev) => prev.filter((record) => record.id !== recordId));
      setSelectedRecord(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    try {
      toast.loading('Generating PDF...');

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);

      pdf.addImage(imgData, 'PNG', (pdfWidth - canvas.width * ratio) / 2, 10, canvas.width * ratio, canvas.height * ratio);
      pdf.save(`Medical-Record-${selectedRecord?.id?.slice(0, 8)}.pdf`);

      toast.dismiss();
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download PDF');
    }
  };

  const recordTypes = [
    { value: 'all', label: 'All Records', icon: <ClipboardList size={16} />, color: '#1565c0' },
    { value: 'consultation', label: 'Consultations', icon: <Stethoscope size={16} />, color: '#10b981' },
    { value: 'lab_report', label: 'Lab Reports', icon: <TestTube2 size={16} />, color: '#8b5cf6' },
    { value: 'prescription', label: 'Prescriptions', icon: <Pill size={16} />, color: '#f59e0b' },
    { value: 'vaccination', label: 'Vaccinations', icon: <Pill size={16} />, color: '#06b6d4' },
    { value: 'surgery', label: 'Surgeries', icon: <Stethoscope size={16} />, color: '#ef4444' },
    { value: 'other', label: 'Other', icon: <ClipboardList size={16} />, color: '#64748b' }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/medical-records');
      setRecords(data.records || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load medical records');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = filter === 'all' ? records : records.filter((record) => record.recordType === filter);
  const getRecordTypeInfo = (type) => recordTypes.find((item) => item.value === type) || recordTypes[0];
  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="medical-records-page">
        <h1 className="medical-records-title"><ClipboardList size={24} /> Medical Records</h1>
        <div className="medical-records-loading">Loading records...</div>
      </div>
    );
  }

  return (
    <div className="medical-records-page">
      <div className="medical-records-header">
        <h1 className="medical-records-title"><ClipboardList size={24} /> Medical Records</h1>
        <p className="medical-records-subtitle">View your complete medical history and health records</p>
      </div>

      <div className="medical-records-stats-grid">
        <div className="medical-records-stat-card">
          <div className="medical-records-stat-icon"><ClipboardList size={26} /></div>
          <div className="medical-records-stat-value">{records.length}</div>
          <div className="medical-records-stat-label">Total Records</div>
        </div>
        {recordTypes.slice(1).map((type) => {
          const count = records.filter((record) => record.recordType === type.value).length;
          if (count === 0) return null;
          return (
            <div key={type.value} className="medical-records-stat-card" style={{ borderLeft: `4px solid ${type.color}` }}>
              <div className="medical-records-stat-icon">{type.icon}</div>
              <div className="medical-records-stat-value">{count}</div>
              <div className="medical-records-stat-label">{type.label}</div>
            </div>
          );
        })}
      </div>

      <div className="medical-records-filter-container">
        {recordTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => setFilter(type.value)}
            className="medical-records-filter-btn"
            style={{
              background: filter === type.value ? type.color : '#fff',
              color: filter === type.value ? '#fff' : '#64748b',
              borderColor: type.color
            }}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {filteredRecords.length === 0 ? (
        <div className="medical-records-empty">
          <div className="medical-records-empty-icon"><ClipboardList size={42} /></div>
          <h3>No medical records found</h3>
          <p>Your medical records will appear here after your doctor visits.</p>
        </div>
      ) : (
        <div className="medical-records-records-list">
          {filteredRecords.map((record) => {
            const typeInfo = getRecordTypeInfo(record.recordType);
            return (
              <div key={record.id} className="medical-records-record-card">
                <div className="medical-records-record-type-bar" style={{ background: typeInfo.color }}>
                  <span>{typeInfo.icon}</span>
                  <span>{typeInfo.label}</span>
                </div>

                <div className="medical-records-record-content">
                  <h3 className="medical-records-record-title">{record.title}</h3>
                  <p className="medical-records-record-date">{formatDate(record.createdAt)}</p>

                  {record.diagnosis && (
                    <div className="medical-records-info-row">
                      <strong>Diagnosis:</strong> {record.diagnosis}
                    </div>
                  )}

                  {record.doctor && (
                    <div className="medical-records-doctor-info">
                      <div className="medical-records-doctor-avatar">{record.doctor.name?.[0] || 'D'}</div>
                      <div>
                        <div className="medical-records-doctor-name">Dr. {record.doctor.name}</div>
                        <div className="medical-records-doctor-label">Attending Doctor</div>
                      </div>
                    </div>
                  )}

                  {record.followUpRequired && (
                    <div className="medical-records-follow-up-badge">
                      <CalendarDays size={14} /> Follow-up: {formatDate(record.followUpDate)}
                    </div>
                  )}

                  <div className="medical-records-card-actions">
                    <button onClick={() => setSelectedRecord(record)} className="medical-records-view-btn" type="button">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedRecord && (
        <div className="medical-records-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedRecord(null)}>
          <div className="medical-records-modal">
            <div className="medical-records-modal-header">
              <h2>Medical Record Details</h2>
              <div className="medical-records-modal-actions">
                <button onClick={() => window.print()} className="medical-records-print-btn" type="button"><Printer size={15} /> Print</button>
                <button onClick={handleDownloadPDF} className="medical-records-pdf-btn" type="button"><FileDown size={15} /> PDF</button>
                <button onClick={() => handleDelete(selectedRecord.id)} className="medical-records-delete-btn" type="button"><Trash2 size={15} /> Delete</button>
                <button onClick={() => setSelectedRecord(null)} className="medical-records-close-btn" type="button">x</button>
              </div>
            </div>

            <div ref={printRef} className="medical-records-printable-content">
              <div className="medical-records-print-header">
                <h1 className="medical-records-print-title">MediCare Pro</h1>
                <p className="medical-records-print-subtitle">Medical Record</p>
              </div>

              <div className="medical-records-modal-content">
                <div className="medical-records-record-type-badge" style={{ background: getRecordTypeInfo(selectedRecord.recordType).color }}>
                  {getRecordTypeInfo(selectedRecord.recordType).icon} {getRecordTypeInfo(selectedRecord.recordType).label}
                </div>

                <h3 className="medical-records-modal-title">{selectedRecord.title}</h3>
                <p className="medical-records-modal-date">Recorded on {formatDate(selectedRecord.createdAt)}</p>

                {selectedRecord.diagnosis && (
                  <div className="medical-records-modal-section">
                    <h4>Diagnosis</h4>
                    <p>{selectedRecord.diagnosis}</p>
                  </div>
                )}

                {selectedRecord.symptoms && (
                  <div className="medical-records-modal-section">
                    <h4>Symptoms</h4>
                    <p>{selectedRecord.symptoms}</p>
                  </div>
                )}

                {selectedRecord.treatment && (
                  <div className="medical-records-modal-section">
                    <h4>Treatment</h4>
                    <p>{selectedRecord.treatment}</p>
                  </div>
                )}

                {(Array.isArray(selectedRecord.medications) && selectedRecord.medications.length > 0) ? (
                  <div className="medical-records-modal-section">
                    <h4>Medications</h4>
                    <ul className="medical-records-medication-list">
                      {selectedRecord.medications.map((medication, index) => (
                        <li key={index}>{medication.name || medication} - {medication.dosage || ''}</li>
                      ))}
                    </ul>
                  </div>
                ) : selectedRecord.medications && typeof selectedRecord.medications === 'string' ? (
                  <div className="medical-records-modal-section">
                    <h4>Medications</h4>
                    <p>{selectedRecord.medications}</p>
                  </div>
                ) : null}

                {selectedRecord.notes && (
                  <div className="medical-records-modal-section">
                    <h4>Notes</h4>
                    <p>{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.followUpRequired && (
                  <div className="medical-records-follow-up-alert">
                    <strong>Follow-up Required</strong>
                    <p>Date: {formatDate(selectedRecord.followUpDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
