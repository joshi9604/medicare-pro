// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useReactToPrint } from 'react-to-print';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { CalendarDays, FileDown, FileText, FlaskConical, Lightbulb, Pill, Stethoscope } from 'lucide-react';
// import PrintablePrescription from '../../components/PrintablePrescription';
// import './Prescriptions.css';

// export default function Prescriptions() {
//   const [prescriptions, setPrescriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPrescription, setSelectedPrescription] = useState(null);
//   const [printRx, setPrintRx] = useState(null);
//   const printRef = useRef();

//   useEffect(() => {
//     fetchPrescriptions();
//   }, []);

//   const fetchPrescriptions = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get('/api/prescriptions');
//       setPrescriptions(data.prescriptions || []);
//     } catch (err) {
//       toast.error('Failed to load prescriptions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const downloadPDF = async () => {
//     if (!printRef.current) return;

//     try {
//       const canvas = await html2canvas(printRef.current, {
//         scale: 2,
//         useCORS: true,
//         logging: false,
//         backgroundColor: '#ffffff'
//       });

//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const pdfWidth = 210;
//       const pdfHeight = 297;
//       const margin = 10;
//       const maxWidth = pdfWidth - (margin * 2);
//       const maxHeight = pdfHeight - (margin * 2);
//       const pxToMm = 25.4 / 96 / 2;
//       const imgWidthMM = canvas.width * pxToMm;
//       const imgHeightMM = canvas.height * pxToMm;
//       const scale = Math.min(maxWidth / imgWidthMM, maxHeight / imgHeightMM, 1);
//       const finalWidth = imgWidthMM * scale;
//       const finalHeight = imgHeightMM * scale;
//       const imgX = margin + (maxWidth - finalWidth) / 2;
//       const imgY = margin;

//       pdf.addImage(imgData, 'PNG', imgX, imgY, finalWidth, finalHeight);
//       pdf.save(`${printRx?.prescriptionId || 'Prescription'}.pdf`);
//     } catch (err) {
//       toast.error('Failed to generate PDF: ' + err.message);
//     }
//   };

//   useReactToPrint({
//     contentRef: printRef,
//     documentTitle: printRx ? `Prescription-${printRx.prescriptionId}` : 'Prescription',
//   });

//   useEffect(() => {
//     if (printRx) {
//       const timer = setTimeout(() => {
//         downloadPDF();
//       }, 500);
//       return () => clearTimeout(timer);
//     }
//     return undefined;
//   }, [printRx]);

//   const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
//     day: 'numeric',
//     month: 'short',
//     year: 'numeric'
//   });

//   if (loading) {
//     return (
//       <div className="prescriptions-page">
//         <h1 className="prescriptions-title"><Pill size={24} /> My Prescriptions</h1>
//         <div className="prescriptions-loading">Loading prescriptions...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="prescriptions-page">
//       <div className="prescriptions-header">
//         <h1 className="prescriptions-title"><Pill size={24} /> My Prescriptions</h1>
//         <p className="prescriptions-subtitle">View your medical prescriptions and treatment plans</p>
//       </div>

//       {prescriptions.length === 0 ? (
//         <div className="prescriptions-empty">
//           <div className="prescriptions-empty-icon"><Pill size={42} /></div>
//           <h3>No prescriptions found</h3>
//           <p>You don't have any prescriptions yet.</p>
//         </div>
//       ) : (
//         <div className="prescriptions-grid">
//           {prescriptions.map((prescription) => (
//             <div key={prescription.id} className="prescriptions-card">
//               <div className="prescriptions-card-header">
//                 <div>
//                   <div className="prescriptions-rx-id">{prescription.prescriptionId}</div>
//                   <div className="prescriptions-date">{formatDate(prescription.issuedAt)}</div>
//                 </div>
//                 <div className="prescriptions-card-actions">
//                   <button onClick={() => setSelectedPrescription(prescription)} className="prescriptions-view-btn" type="button">
//                     View Details
//                   </button>
//                   <button onClick={() => setPrintRx(prescription)} className="prescriptions-print-btn" type="button">
//                     <FileDown size={15} /> Download PDF
//                   </button>
//                 </div>
//               </div>

//               <div className="prescriptions-doctor-info">
//                 <div className="prescriptions-avatar">{prescription.doctor?.name?.[0] || 'D'}</div>
//                 <div>
//                   <div className="prescriptions-doctor-name">Dr. {prescription.doctor?.name}</div>
//                   <div className="prescriptions-label">Prescribed by</div>
//                 </div>
//               </div>

//               <div className="prescriptions-diagnosis">
//                 <strong>Diagnosis:</strong> {prescription.diagnosis}
//               </div>

//               <div className="prescriptions-medicines">
//                 <div className="prescriptions-section-title"><Pill size={14} /> Medicines ({prescription.medicines?.length || 0})</div>
//                 {prescription.medicines?.slice(0, 2).map((medicine, index) => (
//                   <div key={index} className="prescriptions-medicine-item">
//                     <span className="prescriptions-med-name">{medicine.name}</span>
//                     <span className="prescriptions-med-dosage">{medicine.dosage}</span>
//                   </div>
//                 ))}
//                 {prescription.medicines?.length > 2 && (
//                   <div className="prescriptions-more">+{prescription.medicines.length - 2} more</div>
//                 )}
//               </div>

//               {prescription.followUpDate && (
//                 <div className="prescriptions-follow-up">
//                   <CalendarDays size={14} /> Follow-up: {formatDate(prescription.followUpDate)}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedPrescription && (
//         <div className="prescriptions-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedPrescription(null)}>
//           <div className="prescriptions-modal">
//             <div className="prescriptions-modal-header">
//               <h2>Prescription Details</h2>
//               <button onClick={() => setSelectedPrescription(null)} className="prescriptions-close-btn" type="button">x</button>
//             </div>

//             <div className="prescriptions-modal-content">
//               <div className="prescriptions-modal-rx-id">{selectedPrescription.prescriptionId}</div>
//               <div className="prescriptions-modal-date">Issued on {formatDate(selectedPrescription.issuedAt)}</div>

//               <div className="prescriptions-modal-section">
//                 <h4><Stethoscope size={15} /> Doctor</h4>
//                 <p>Dr. {selectedPrescription.doctor?.name}</p>
//               </div>

//               <div className="prescriptions-modal-section">
//                 <h4><FileText size={15} /> Diagnosis</h4>
//                 <p>{selectedPrescription.diagnosis}</p>
//               </div>

//               <div className="prescriptions-modal-section">
//                 <h4><Pill size={15} /> Medicines</h4>
//                 {selectedPrescription.medicines?.map((medicine, index) => (
//                   <div key={index} className="prescriptions-modal-medicine">
//                     <div className="prescriptions-modal-med-name">{medicine.name}</div>
//                     <div className="prescriptions-modal-med-details">
//                       {medicine.dosage} - {medicine.frequency} - {medicine.duration}
//                     </div>
//                     {medicine.instructions && (
//                       <div className="prescriptions-modal-med-instructions">{medicine.instructions}</div>
//                     )}
//                   </div>
//                 ))}
//               </div>

//               {selectedPrescription.labTests?.length > 0 && (
//                 <div className="prescriptions-modal-section">
//                   <h4><FlaskConical size={15} /> Lab Tests</h4>
//                   {selectedPrescription.labTests.map((test, index) => (
//                     <div key={index} className="prescriptions-lab-test">
//                       <div>{test.testName}</div>
//                       {test.instructions && <div className="prescriptions-lab-instructions">{test.instructions}</div>}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {selectedPrescription.advice && (
//                 <div className="prescriptions-modal-section">
//                   <h4><Lightbulb size={15} /> Doctor's Advice</h4>
//                   <p>{selectedPrescription.advice}</p>
//                 </div>
//               )}

//               {selectedPrescription.followUpDate && (
//                 <div className="prescriptions-follow-up-badge">
//                   <CalendarDays size={15} /> Follow-up Date: {formatDate(selectedPrescription.followUpDate)}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
//         <PrintablePrescription
//           ref={printRef}
//           prescription={printRx || prescriptions[0] || {}}
//           patient={printRx?.patient || prescriptions[0]?.patient || {}}
//           doctor={printRx?.doctor || prescriptions[0]?.doctor || {}}
//         />
//       </div>
//     </div>
//   );
// }
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { loadRazorpayScript } from '../../utils/razorpay';
// import './Payments.css';
// import { CreditCard, IndianRupee, ClipboardList, CheckCircle2, Hourglass, Video, Building2, XCircle } from 'lucide-react';

// export default function Payments() {
//   const [payments, setPayments] = useState([]);
//   const [stats, setStats] = useState({ total: 0, count: 0 });
//   const [loading, setLoading] = useState(true);
//   const [pendingAppointments, setPendingAppointments] = useState([]);

//   useEffect(() => {
//     fetchPayments();
//     fetchPendingAppointments();
//   }, []);

//   const fetchPayments = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get('/api/payments/history');
//       const paymentsData = data.payments || [];
//       const totalAmount = paymentsData
//       .filter(p => p.status === "paid")
//       .reduce((sum, p) => sum + Number(p.amount || 0), 0);
//       setPayments(paymentsData);
//       setStats({
//       total: totalAmount,
//       count: paymentsData.length
//     });
//     } catch (err) {
//       toast.error('Failed to load payment history');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPendingAppointments = async () => {
//     try {
//       const { data } = await axios.get('/api/appointments?status=pending&type=all');
//       setPendingAppointments(data.appointments || []);
//     } catch (err) {
//       console.error('Failed to load pending appointments');
//     }
//   };

//   const handlePayment = async (appointment) => {
//     try {
//       // Load Razorpay script
//       const loaded = await loadRazorpayScript();
//       if (!loaded) {
//         toast.error('Failed to load payment gateway');
//         return;
//       }

//       // Create order
//       const { data: orderData } = await axios.post('/api/payments/create-order', {
//         appointmentId: appointment.id
//       });

//       const options = {
//         key: orderData.order.key,
//         amount: orderData.order.amount,
//         currency: orderData.order.currency,
//         name: 'MediCare Pro',
//         description: `Consultation Fee for Dr. ${appointment.doctor?.name}`,
//         order_id: orderData.order.id,
//         handler: async (response) => {
//           try {
//             // Verify payment
//             const { data: verifyData } = await axios.post('/api/payments/verify', {
//               razorpayOrderId: response.razorpay_order_id,
//               razorpayPaymentId: response.razorpay_payment_id,
//               razorpaySignature: response.razorpay_signature,
//               appointmentId: appointment.id
//             });

//             if (verifyData.success) {
//               toast.success('Payment successful!');
//               fetchPayments();
//               fetchPendingAppointments();
//             } else {
//               toast.error('Payment verification failed');
//             }
//           } catch (err) {
//             console.error('Payment verification error:', err);
//             toast.error(err.response?.data?.message || 'Payment verification failed');
//           }
//         },
//         prefill: {
//           name: appointment.patient?.name || '',
//           email: appointment.patient?.email || '',
//           contact: appointment.patient?.phone || ''
//         },
//         theme: {
//           color: '#1565c0'
//         },
//         method: {
//           upi: true,
//           card: true,
//           netbanking: true,
//           wallet: true,
//           paylater: true,
//           emi: true
//         },
//         _additional: {
//           display: {
//             blocks: {
//               utib: {
//                 name: 'Pay via UPI',
//                 instruments: [
//                   {
//                     method: 'upi',
//                     issuers: ['IBIB', 'HDFB', 'ICIB']
//                   }
//                 ]
//               }
//             }
//           }
//         }
//       };

//       const rzp = new window.Razorpay(options);
      
//       // Show QR code option
//       rzp.on('payment.submit', function(response) {
//         console.log('Payment submitted:', response);
//       });
      
//       rzp.on('payment.failed', (response) => {
//         const error = response.error;
//         toast.error(`Payment failed: ${error.description || 'Please try again'}`);
//       });
//       rzp.open();
//     } catch (err) {
//       console.error('Payment initiation error:', err);
//       toast.error(err.response?.data?.message || 'Failed to initiate payment');
//     }
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString('en-IN', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (dateStr) => {
//     return new Date(dateStr).toLocaleTimeString('en-IN', {
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="payments-page">
//         <h1 className="payments-title"><CreditCard size={22} /> Payment History</h1>
//         <div className="payments-loading">Loading payments...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="payments-page">
//       <div className="payments-header">
//         <h1 className="payments-title"><CreditCard size={22} /> Payment History</h1>
//         <p className="payments-subtitle">View all your payment transactions</p>
//       </div>

//       {/* Stats Cards */}
//       <div className="payments-stats-grid">
//         <div className="payments-stat-card">
//           <div className="payments-stat-icon" aria-hidden><IndianRupee size={18} /></div>
//           <div className="payments-stat-value">₹{stats.total.toLocaleString()}</div>
//           <div className="payments-stat-label">Total Spent</div>
//         </div>
//         <div className="payments-stat-card">
//           <div className="payments-stat-icon" aria-hidden><ClipboardList size={18} /></div>
//           <div className="payments-stat-value">{stats.count}</div>
//           <div className="payments-stat-label">Transactions</div>
//         </div>
//         <div className="payments-stat-card">
//           <div className="payments-stat-icon" aria-hidden><CheckCircle2 size={18} /></div>
//           <div className="payments-stat-value">{payments.filter(p => p.status === 'paid').length}</div>
//           <div className="payments-stat-label">Successful</div>
//         </div>
//       </div>

//       {/* Pending Appointments - Payment Required */}
//       {pendingAppointments.length > 0 && (
//         <div className="payments-pending-section">
//           <h2 className="payments-section-title"><Hourglass size={18} /> Pending Payments</h2>
//           <div className="payments-pending-grid">
//             {pendingAppointments.map((apt) => (
//               <div key={apt.id} className="payment-card">
//                 <div className="payment-card-header">
//                   <div className="payment-doctor-info">
//                     <div className="payment-doc-avatar">{apt.doctor?.name?.[0] || 'D'}</div>
//                     <div>
//                       <div className="payment-doc-name">Dr. {apt.doctor?.name}</div>
//                       <div className="payment-date-time">
//                         {new Date(apt.appointmentDate).toLocaleDateString('en-IN')} at {apt.timeSlot}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="payment-amount">₹{apt.fee}</div>
//                 </div>
//                 <div className="payment-card-footer">
//                   <span className="payment-type-badge">
//                     {apt.type === 'telemedicine' ? <><Video size={14} /> Video</> : <><Building2 size={14} /> Clinic</>}
//                   </span>
//                   <button className="pay-now-btn" onClick={() => handlePayment(apt)}>
//                     <CreditCard size={16} /> Pay Now
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Payments List */}
//       {payments.length === 0 ? (
//         <div className="payments-empty">
//           <div className="payments-empty-icon" aria-hidden><CreditCard size={44} /></div>
//           <h3>No payments found</h3>
//           <p>You haven't made any payments yet.</p>
//         </div>
//       ) : (
//         <div className="payments-table-container">
//           <table className="payments-table">
//             <thead>
//               <tr>
//                 <th className="payments-th">Transaction ID</th>
//                 <th className="payments-th">Doctor</th>
//                 <th className="payments-th">Date & Time</th>
//                 <th className="payments-th">Type</th>
//                 <th className="payments-th">Amount</th>
//                 <th className="payments-th">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {payments.map((payment) => (
//                 <tr key={payment.id} className="payments-tr">
//                   <td className="payments-td">
//                     <div className="payments-tx-id">{payment.razorpayPaymentId || payment.id.slice(0, 8)}</div>
//                   </td>
//                   <td className="payments-td">
//                     <div className="payments-doctor-cell">
//                       <div className="payments-doc-avatar">{payment.doctor?.name?.[0] || 'D'}</div>
//                       <span>Dr. {payment.doctor?.name}</span>
//                     </div>
//                   </td>
//                   <td className="payments-td">
//                     <div>{formatDate(payment.createdAt)}</div>
//                     <div className="payments-time">{formatTime(payment.createdAt)}</div>
//                   </td>
//                   <td className="payments-td">
//                     <span className="payments-type-badge">
//                       {payment.appointment?.type === 'telemedicine' ? <><Video size={14} /> Video</> : <><Building2 size={14} /> Clinic</>}
//                     </span>
//                   </td>
//                   <td className="payments-td">
//                     <span className="payments-amount">₹{payment.amount}</span>
//                   </td>
//                   <td className="payments-td">
//                     <span className="payments-status-badge" style={{
//                       background: payment.status === 'paid' ? '#dcfce7' : '#fee2e2',
//                       color: payment.status === 'paid' ? '#15803d' : '#dc2626'
//                     }}>
//                       {payment.status === 'paid' ? <><CheckCircle2 size={14} /> Paid</> : <><XCircle size={14} /> Failed</>}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Payment Summary */}
//       {payments.length > 0 && (
//         <div className="payments-summary">
//           <div className="payments-summary-row">
//             <span>Total Transactions:</span>
//             <span className="payments-summary-value">{stats.count}</span>
//           </div>
//           <div className="payments-summary-row">
//             <span>Total Amount Paid:</span>
//             <span className="payments-summary-value">₹{stats.total.toLocaleString()}</span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadRazorpayScript } from '../../utils/razorpay';
import './Payments.css';
import { 
  CreditCard, 
  IndianRupee, 
  ClipboardList, 
  CheckCircle2, 
  Hourglass, 
  Video, 
  Building2, 
  XCircle 
} from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchPendingAppointments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments/history');
      
      const paymentsData = data.payments || [];
      const paidPayments = paymentsData.filter(p => p.status === "paid");
      
      const totalAmount = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      setPayments(paymentsData);
      setStats({
        total: totalAmount,
        count: paymentsData.length
      });
    } catch (err) {
      console.error('Failed to load payment history:', err);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      setPendingLoading(true);
      const { data } = await axios.get('/api/appointments', {
        params: { 
          status: 'pending',
          // type: 'all'  // Comment this if backend doesn't support it yet
        }
      });
      
      setPendingAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load pending appointments:', err.response?.data || err.message);
      // Silent fail - don't show toast for non-critical section
      setPendingAppointments([]);
    } finally {
      setPendingLoading(false);
    }
  };

  const handlePayment = async (appointment) => {
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const { data: orderData } = await axios.post('/api/payments/create-order', {
        appointmentId: appointment.id
      });

      const options = {
        key: orderData.order.key || orderData.key, // Adjust based on your backend response
        amount: orderData.order.amount,
        currency: orderData.order.currency || 'INR',
        name: 'MediCare Pro',
        description: `Consultation Fee for Dr. ${appointment.doctor?.name || 'Doctor'}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post('/api/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: appointment.id
            });

            if (verifyData.success) {
              toast.success('Payment successful! 🎉');
              fetchPayments();
              fetchPendingAppointments();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: appointment.patient?.name || '',
          email: appointment.patient?.email || '',
          contact: appointment.patient?.phone || ''
        },
        theme: { color: '#1565c0' },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description || 'Please try again'}`);
      });

      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="payments-page">
        <div className="payments-header">
          <h1 className="payments-title">
            <CreditCard size={22} /> Payment History
          </h1>
        </div>
        <div className="payments-loading">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1 className="payments-title">
          <CreditCard size={22} /> Payment History
        </h1>
        <p className="payments-subtitle">View all your payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="payments-stats-grid">
        <div className="payments-stat-card">
          <IndianRupee size={24} className="payments-stat-icon" />
          <div className="payments-stat-value">₹{stats.total.toLocaleString('en-IN')}</div>
          <div className="payments-stat-label">Total Spent</div>
        </div>
        <div className="payments-stat-card">
          <ClipboardList size={24} className="payments-stat-icon" />
          <div className="payments-stat-value">{stats.count}</div>
          <div className="payments-stat-label">Transactions</div>
        </div>
        <div className="payments-stat-card">
          <CheckCircle2 size={24} className="payments-stat-icon" />
          <div className="payments-stat-value">
            {payments.filter(p => p.status === 'paid').length}
          </div>
          <div className="payments-stat-label">Successful</div>
        </div>
      </div>

      {/* Pending Appointments Section */}
      {pendingAppointments.length > 0 && (
        <div className="payments-pending-section">
          <h2 className="payments-section-title">
            <Hourglass size={20} /> Pending Payments
          </h2>
          <div className="payments-pending-grid">
            {pendingAppointments.map((apt) => (
              <div key={apt.id} className="payment-card">
                <div className="payment-card-header">
                  <div className="payment-doctor-info">
                    <div className="payment-doc-avatar">
                      {apt.doctor?.name?.charAt(0) || 'D'}
                    </div>
                    <div>
                      <div className="payment-doc-name">Dr. {apt.doctor?.name}</div>
                      <div className="payment-date-time">
                        {formatDate(apt.appointmentDate)} at {apt.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div className="payment-amount">₹{apt.fee}</div>
                </div>

                <div className="payment-card-footer">
                  <span className="payment-type-badge">
                    {apt.type === 'telemedicine' ? (
                      <><Video size={14} /> Video Consult</>
                    ) : (
                      <><Building2 size={14} /> Clinic Visit</>
                    )}
                  </span>
                  <button 
                    className="pay-now-btn" 
                    onClick={() => handlePayment(apt)}
                  >
                    <CreditCard size={16} /> Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History Table */}
      {payments.length === 0 ? (
        <div className="payments-empty">
          <CreditCard size={48} className="payments-empty-icon" />
          <h3>No payments found</h3>
          <p>You haven't made any payments yet.</p>
        </div>
      ) : (
        <div className="payments-table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th className="payments-th">Transaction ID</th>
                <th className="payments-th">Doctor</th>
                <th className="payments-th">Date & Time</th>
                <th className="payments-th">Type</th>
                <th className="payments-th">Amount</th>
                <th className="payments-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="payments-tr">
                  <td className="payments-td">
                    <div className="payments-tx-id">
                      {payment.razorpayPaymentId || payment.id?.slice(0, 12)}
                    </div>
                  </td>
                  <td className="payments-td">
                    <div className="payments-doctor-cell">
                      <div className="payments-doc-avatar">
                        {payment.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      <span>Dr. {payment.doctor?.name}</span>
                    </div>
                  </td>
                  <td className="payments-td">
                    <div>{formatDate(payment.createdAt)}</div>
                    <div className="payments-time">{formatTime(payment.createdAt)}</div>
                  </td>
                  <td className="payments-td">
                    <span className="payments-type-badge">
                      {payment.appointment?.type === 'telemedicine' ? (
                        <><Video size={14} /> Video</>
                      ) : (
                        <><Building2 size={14} /> Clinic</>
                      )}
                    </span>
                  </td>
                  <td className="payments-td">
                    <span className="payments-amount">₹{payment.amount}</span>
                  </td>
                  <td className="payments-td">
                    <span 
                      className="payments-status-badge"
                      style={{
                        background: payment.status === 'paid' ? '#dcfce7' : '#fee2e2',
                        color: payment.status === 'paid' ? '#15803d' : '#dc2626'
                      }}
                    >
                      {payment.status === 'paid' ? (
                        <><CheckCircle2 size={14} /> Paid</>
                      ) : (
                        <><XCircle size={14} /> Failed</>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {payments.length > 0 && (
        <div className="payments-summary">
          <div className="payments-summary-row">
            <span>Total Transactions</span>
            <span className="payments-summary-value">{stats.count}</span>
          </div>
          <div className="payments-summary-row">
            <span>Total Amount Paid</span>
            <span className="payments-summary-value">₹{stats.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      )}
    </div>
  );
}