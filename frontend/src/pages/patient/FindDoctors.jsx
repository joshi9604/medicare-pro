import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './FindDoctors.css';
import { loadRazorpayScript } from '../../utils/razorpay';

const SPECIALIZATIONS = ['Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','General Physician','Gynecologist','ENT Specialist','Ophthalmologist'];

export default function FindDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({ appointmentDate: '', timeSlot: '', type: 'in-person', symptoms: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null); // Store pending appointment

  const TIME_SLOTS = ['09:00 - 09:30','09:30 - 10:00','10:00 - 10:30','10:30 - 11:00','11:00 - 11:30','14:00 - 14:30','14:30 - 15:00','15:00 - 15:30','16:00 - 16:30','16:30 - 17:00'];

  useEffect(() => { fetchDoctors(); }, [search, specialization]);

  const fetchDoctors = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (specialization) params.append('specialization', specialization);
      const { data } = await axios.get(`/api/doctors?${params}`);
      console.log('Doctors fetched:', data);
      setDoctors(data.doctors || []);
    } catch (err) { 
      console.error('Fetch error:', err);
      toast.error('Failed to load doctors'); 
    }
    finally { setLoading(false); }
  };

  // Step 1: Create pending appointment
  const handleBook = async () => {
    if (!bookingForm.appointmentDate || !bookingForm.timeSlot) {
      return toast.error('Please fill all fields');
    }
    setBookingLoading(true);
    try {
      const { data } = await axios.post('/api/appointments', {
        doctorId: selectedDoctor.userId || selectedDoctor.user?.id,
        doctorProfileId: selectedDoctor.id,
        ...bookingForm
      });
      
      // Appointment created successfully, now initiate payment
      setPendingAppointment(data.appointment);
      initiatePayment(data.appointment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { 
      setBookingLoading(false); 
    }
  };

  // Step 2: Initiate Razorpay payment
  const initiatePayment = async (appointment) => {
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setPendingAppointment(null);
        return;
      }

      // Create Razorpay order
      const { data: orderData } = await axios.post('/api/payments/create-order', {
        appointmentId: appointment.id
      });

      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MediCare Pro',
        description: `Consultation Fee for Dr. ${selectedDoctor.user?.name}`,
        order_id: orderData.order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const { data: verifyData } = await axios.post('/api/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: appointment.id
            });

            if (verifyData.success) {
              toast.success('Payment successful! Appointment confirmed ✅');
              setSelectedDoctor(null);
              setPendingAppointment(null);
              setBookingForm({ appointmentDate: '', timeSlot: '', type: 'in-person', symptoms: '' });
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: '', // Patient name can be added if available in context
          email: '',
          contact: ''
        },
        theme: {
          color: '#1565c0'
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
          emi: true
        },
        _additional: {
          display: {
            blocks: {
              utib: {
                name: 'Pay via UPI',
                instruments: [
                  {
                    method: 'upi',
                    issuers: ['IBIB', 'HDFB', 'ICIB']
                  }
                ]
              }
            }
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      // Show QR code option
      rzp.on('payment.submit', function(response) {
        console.log('Payment submitted:', response);
      });
      
      rzp.on('payment.failed', (response) => {
        const error = response.error;
        toast.error(`Payment failed: ${error.description || 'Please try again'}`);
        setPendingAppointment(null);
      });
      rzp.open();
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setPendingAppointment(null);
    }
  };

  const renderStars = (rating) => '★'.repeat(Math.round(rating || 0)) + '☆'.repeat(5 - Math.round(rating || 0));

  return (
    <div className="find-doctors-page">
      <div className="find-doctors-header">
        <h1 className="find-doctors-title">🔍 Find a Doctor</h1>
        <p className="find-doctors-sub">{doctors.length} doctors available</p>
      </div>
  
      {/* Search & Filters */}
      <div className="find-doctors-filters">
        <input className="find-doctors-search" placeholder="Search by name or specialization..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="find-doctors-select" value={specialization} onChange={e => setSpecialization(e.target.value)}>
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
  
      {/* Specialty chips */}
      <div className="find-doctors-chips">
        {SPECIALIZATIONS.slice(0,6).map(sp => (
          <button key={sp} className={`find-doctors-chip${specialization === sp ? ' active' : ''}`}
            onClick={() => setSpecialization(specialization === sp ? '' : sp)}>{sp}</button>
        ))}
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="find-doctors-loading">Loading doctors... 🏥</div>
      ) : doctors.length === 0 ? (
        <div className="find-doctors-empty">No doctors found. Try different filters.</div>
      ) : (
        <div className="find-doctors-grid">
          {doctors.map(doc => (
            <div key={doc.id} className="find-doctors-card">
              <div className="find-doctors-card-top">
                <div className="find-doctors-avatar">{doc.user?.name?.[0] || 'D'}</div>
                <div className="find-doctors-doc-info">
                  <h3 className="find-doctors-doc-name">Dr. {doc.user?.name || 'Unknown'}</h3>
                  <p className="find-doctors-doc-spec">{doc.specialization}</p>
                  <p className="find-doctors-doc-exp">{doc.experience} yrs experience</p>
                  <div className="find-doctors-stars">{renderStars(doc.rating)} <span className="find-doctors-reviews">({doc.totalReviews || 0})</span></div>
                </div>
              </div>
              {doc.about && <p className="find-doctors-about">{doc.about.substring(0,100)}...</p>}
              <div className="find-doctors-fees">
                <span className="find-doctors-fee">🏥 ₹{doc.consultationFee}</span>
                {doc.isAvailableOnline && <span className="find-doctors-fee">🎥 ₹{doc.telemedicineFee}</span>}
              </div>
              <div className="find-doctors-langs">
                {doc.languages?.map(l => <span key={l} className="find-doctors-lang">{l}</span>)}
              </div>
              <button className="find-doctors-book-btn" onClick={() => { console.log('Selected doctor:', doc); setSelectedDoctor(doc); }}>
                📅 Book Appointment
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div className="find-doctors-debug">
        Selected Doctor: {selectedDoctor ? 'YES' : 'NO'} | 
        Doctors Count: {doctors.length}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="find-doctors-overlay" onClick={e => e.target === e.currentTarget && setSelectedDoctor(null)}>
          <div className="find-doctors-modal">
            <h2 className="find-doctors-modal-title">📅 Book Appointment</h2>
            <div className="find-doctors-modal-doc">
              <div className="find-doctors-modal-avatar">{selectedDoctor.user?.name?.[0]}</div>
              <div>
                <div className="find-doctors-modal-doc-name">Dr. {selectedDoctor.user?.name}</div>
                <div className="find-doctors-modal-doc-spec">{selectedDoctor.specialization}</div>
              </div>
            </div>

            <div className="find-doctors-m-form">
              <label className="find-doctors-label">Appointment Type</label>
              <div className="find-doctors-type-row">
                {[['in-person','🏥 In-Person','₹'+selectedDoctor.consultationFee],['telemedicine','🎥 Video Call','₹'+selectedDoctor.telemedicineFee]].map(([v,l,f]) => (
                  <div key={v} className={`find-doctors-type-card${bookingForm.type === v ? ' active' : ''}`}
                    onClick={() => setBookingForm({...bookingForm, type: v})}>
                    <div style={{ fontSize: '20px' }}>{l.split(' ')[0]}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{l.split(' ')[1]}</div>
                    <div style={{ fontSize: '11px', color: '#1565c0' }}>{f}</div>
                  </div>
                ))}
              </div>

              <label className="find-doctors-label">Date</label>
              <input className="find-doctors-input" type="date" min={new Date().toISOString().split('T')[0]}
                value={bookingForm.appointmentDate}
                onChange={e => setBookingForm({...bookingForm, appointmentDate: e.target.value})} />

              <label className="find-doctors-label">Time Slot</label>
              <div className="find-doctors-slot-grid">
                {TIME_SLOTS.map(slot => (
                  <div key={slot} className={`find-doctors-slot${bookingForm.timeSlot === slot ? ' active' : ''}`}
                    onClick={() => setBookingForm({...bookingForm, timeSlot: slot})}>{slot}</div>
                ))}
              </div>

              <label className="find-doctors-label">Symptoms / Reason</label>
              <textarea className="find-doctors-input" style={{ height: '70px' }} placeholder="Describe your symptoms..."
                value={bookingForm.symptoms}
                onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})} />

              <div className="find-doctors-fee-row">
                <span>Consultation Fee:</span>
                <strong style={{ color: '#1565c0', fontSize: '18px' }}>
                  ₹{bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee}
                </strong>
              </div>

              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '12px', 
                marginTop: '16px',
                marginBottom: '16px'
              }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                  ⚠️ <strong>Payment Required:</strong> You will need to pay ₹{bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee} via Razorpay to confirm this appointment.
                </p>
              </div>

              <div className="find-doctors-modal-btns">
                <button className="find-doctors-cancel-btn" onClick={() => setSelectedDoctor(null)}>Cancel</button>
                <button className="find-doctors-confirm-btn" onClick={handleBook} disabled={bookingLoading}>
                  {bookingLoading ? '⏳ Processing...' : `💳 Pay & Book (₹${bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
