// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { CalendarDays, MapPin, Search, Stethoscope, Video } from 'lucide-react';
// import './FindDoctors.css';
// import { loadRazorpayScript } from '../../utils/razorpay';

// const SPECIALIZATIONS = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician', 'Gynecologist', 'ENT Specialist', 'Ophthalmologist'];

// export default function FindDoctors() {
//   const [doctors, setDoctors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [specialization, setSpecialization] = useState('');
//   const [selectedDoctor, setSelectedDoctor] = useState(null);
//   const [bookingForm, setBookingForm] = useState({ appointmentDate: '', timeSlot: '', type: 'in-person', symptoms: '' });
//   const [bookingLoading, setBookingLoading] = useState(false);
//   const [pendingAppointment, setPendingAppointment] = useState(null);

//   const TIME_SLOTS = ['09:00 - 09:30', '09:30 - 10:00', '10:00 - 10:30', '10:30 - 11:00', '11:00 - 11:30', '14:00 - 14:30', '14:30 - 15:00', '15:00 - 15:30', '16:00 - 16:30', '16:30 - 17:00'];

//   useEffect(() => {
//     fetchDoctors();
//   }, [search, specialization]);

//   const fetchDoctors = async () => {
//     try {
//       const params = new URLSearchParams();
//       if (search) params.append('search', search);
//       if (specialization) params.append('specialization', specialization);
//       const { data } = await axios.get(`/api/doctors?${params}`);
//       setDoctors(data.doctors || []);
//     } catch (err) {
//       toast.error('Failed to load doctors');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBook = async () => {
//     if (!bookingForm.appointmentDate || !bookingForm.timeSlot) {
//       return toast.error('Please fill all fields');
//     }
//     setBookingLoading(true);
//     try {
//       const { data } = await axios.post('/api/appointments', {
//         doctorId: selectedDoctor.userId || selectedDoctor.user?.id,
//         doctorProfileId: selectedDoctor.id,
//         ...bookingForm
//       });

//       setPendingAppointment(data.appointment);
//       initiatePayment(data.appointment);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Booking failed');
//     } finally {
//       setBookingLoading(false);
//     }
//   };

//   const initiatePayment = async (appointment) => {
//     try {
//       const loaded = await loadRazorpayScript();
//       if (!loaded) {
//         toast.error('Failed to load payment gateway');
//         setPendingAppointment(null);
//         return;
//       }

//       const { data: orderData } = await axios.post('/api/payments/create-order', {
//         appointmentId: appointment.id
//       });

//       const options = {
//         key: orderData.order.key,
//         amount: orderData.order.amount,
//         currency: orderData.order.currency,
//         name: 'MediCare Pro',
//         description: `Consultation Fee for Dr. ${selectedDoctor.user?.name}`,
//         order_id: orderData.order.id,
//         handler: async (response) => {
//           try {
//             const { data: verifyData } = await axios.post('/api/payments/verify', {
//               razorpayOrderId: response.razorpay_order_id,
//               razorpayPaymentId: response.razorpay_payment_id,
//               razorpaySignature: response.razorpay_signature,
//               appointmentId: appointment.id
//             });

//             if (verifyData.success) {
//               toast.success('Payment successful! Appointment confirmed');
//               setSelectedDoctor(null);
//               setPendingAppointment(null);
//               setBookingForm({ appointmentDate: '', timeSlot: '', type: 'in-person', symptoms: '' });
//             } else {
//               toast.error('Payment verification failed');
//             }
//           } catch (err) {
//             toast.error(err.response?.data?.message || 'Payment verification failed');
//           }
//         },
//         prefill: { name: '', email: '', contact: '' },
//         theme: { color: '#1565c0' },
//         method: { upi: true, card: true, netbanking: true, wallet: true, paylater: true, emi: true }
//       };

//       const razorpay = new window.Razorpay(options);
//       razorpay.on('payment.failed', (response) => {
//         toast.error(`Payment failed: ${response.error?.description || 'Please try again'}`);
//         setPendingAppointment(null);
//       });
//       razorpay.open();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to initiate payment');
//       setPendingAppointment(null);
//     }
//   };

//   const renderStars = (rating) => '*'.repeat(Math.round(rating || 0)) + 'o'.repeat(5 - Math.round(rating || 0));
//   const getDoctorLocation = (doctor) => [doctor?.addressCity, doctor?.addressState].filter(Boolean).join(', ');

//   return (
//     <div className="find-doctors-page">
//       <div className="find-doctors-header">
//         <h1 className="find-doctors-title"><Search size={24} /> Find a Doctor</h1>
//         <p className="find-doctors-sub">{doctors.length} doctors available</p>
//       </div>

//       <div className="find-doctors-filters">
//         <input className="find-doctors-search" placeholder="Search by name or specialization..." value={search} onChange={(event) => setSearch(event.target.value)} />
//         <select className="find-doctors-select" value={specialization} onChange={(event) => setSpecialization(event.target.value)}>
//           <option value="">All Specializations</option>
//           {SPECIALIZATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
//         </select>
//       </div>

//       <div className="find-doctors-chips">
//         {SPECIALIZATIONS.slice(0, 6).map((item) => (
//           <button
//             key={item}
//             className={`find-doctors-chip${specialization === item ? ' active' : ''}`}
//             onClick={() => setSpecialization(specialization === item ? '' : item)}
//             type="button"
//           >
//             {item}
//           </button>
//         ))}
//       </div>

//       {loading ? (
//         <div className="find-doctors-loading">Loading doctors...</div>
//       ) : doctors.length === 0 ? (
//         <div className="find-doctors-empty">No doctors found. Try different filters.</div>
//       ) : (
//         <div className="find-doctors-grid">
//           {doctors.map((doctor) => (
//             <div key={doctor.id} className="find-doctors-card">
//               <div className="find-doctors-card-top">
//                 <div className="find-doctors-avatar">{doctor.user?.name?.[0] || 'D'}</div>
//                 <div className="find-doctors-doc-info">
//                   <h3 className="find-doctors-doc-name">Dr. {doctor.user?.name || 'Unknown'}</h3>
//                   <p className="find-doctors-doc-spec">{doctor.specialization}</p>
//                   <p className="find-doctors-doc-exp">{doctor.experience} yrs experience</p>
//                   {getDoctorLocation(doctor) && (
//                     <p className="find-doctors-doc-location"><MapPin size={13} /> {getDoctorLocation(doctor)}</p>
//                   )}
//                   <div className="find-doctors-stars">{renderStars(doctor.rating)} <span className="find-doctors-reviews">({doctor.totalReviews || 0})</span></div>
//                 </div>
//               </div>
//               {doctor.about && <p className="find-doctors-about">{doctor.about.substring(0, 100)}...</p>}
//               <div className="find-doctors-fees">
//                 <span className="find-doctors-fee"><Stethoscope size={14} /> Rs {doctor.consultationFee}</span>
//                 {doctor.isAvailableOnline && <span className="find-doctors-fee"><Video size={14} /> Rs {doctor.telemedicineFee}</span>}
//               </div>
//               <div className="find-doctors-langs">
//                 {doctor.languages?.map((language) => <span key={language} className="find-doctors-lang">{language}</span>)}
//               </div>
//               <div className="find-doctors-card-actions">
//                 <button className="find-doctors-book-btn" onClick={() => setSelectedDoctor(doctor)} type="button">
//                   <CalendarDays size={15} /> Book Appointment
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {selectedDoctor && (
//         <div className="find-doctors-overlay" onClick={(event) => event.target === event.currentTarget && setSelectedDoctor(null)}>
//           <div className="find-doctors-modal">
//             <h2 className="find-doctors-modal-title"><CalendarDays size={18} /> Book Appointment</h2>
//             <div className="find-doctors-modal-doc">
//               <div className="find-doctors-modal-avatar">{selectedDoctor.user?.name?.[0]}</div>
//               <div>
//                 <div className="find-doctors-modal-doc-name">Dr. {selectedDoctor.user?.name}</div>
//                 <div className="find-doctors-modal-doc-spec">{selectedDoctor.specialization}</div>
//                 {getDoctorLocation(selectedDoctor) && (
//                   <div className="find-doctors-modal-doc-location"><MapPin size={13} /> {getDoctorLocation(selectedDoctor)}</div>
//                 )}
//               </div>
//             </div>

//             <div className="find-doctors-m-form">
//               <label className="find-doctors-label">Appointment Type</label>
//               <div className="find-doctors-type-row">
//                 {[
//                   ['in-person', 'In-Person', `Rs ${selectedDoctor.consultationFee}`, <Stethoscope size={18} />],
//                   ['telemedicine', 'Video Call', `Rs ${selectedDoctor.telemedicineFee}`, <Video size={18} />]
//                 ].map(([value, label, fee, icon]) => (
//                   <div
//                     key={value}
//                     className={`find-doctors-type-card${bookingForm.type === value ? ' active' : ''}`}
//                     onClick={() => setBookingForm({ ...bookingForm, type: value })}
//                   >
//                     <div style={{ fontSize: '20px' }}>{icon}</div>
//                     <div style={{ fontSize: '12px', fontWeight: '600' }}>{label}</div>
//                     <div style={{ fontSize: '11px', color: '#1565c0' }}>{fee}</div>
//                   </div>
//                 ))}
//               </div>

//               <label className="find-doctors-label">Date</label>
//               <input
//                 className="find-doctors-input"
//                 type="date"
//                 min={new Date().toISOString().split('T')[0]}
//                 value={bookingForm.appointmentDate}
//                 onChange={(event) => setBookingForm({ ...bookingForm, appointmentDate: event.target.value })}
//               />

//               <label className="find-doctors-label">Time Slot</label>
//               <div className="find-doctors-slot-grid">
//                 {TIME_SLOTS.map((slot) => (
//                   <div
//                     key={slot}
//                     className={`find-doctors-slot${bookingForm.timeSlot === slot ? ' active' : ''}`}
//                     onClick={() => setBookingForm({ ...bookingForm, timeSlot: slot })}
//                   >
//                     {slot}
//                   </div>
//                 ))}
//               </div>

//               <label className="find-doctors-label">Symptoms / Reason</label>
//               <textarea
//                 className="find-doctors-input"
//                 style={{ height: '70px' }}
//                 placeholder="Describe your symptoms..."
//                 value={bookingForm.symptoms}
//                 onChange={(event) => setBookingForm({ ...bookingForm, symptoms: event.target.value })}
//               />

//               <div className="find-doctors-fee-row">
//                 <span>Consultation Fee:</span>
//                 <strong style={{ color: '#1565c0', fontSize: '18px' }}>
//                   Rs {bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee}
//                 </strong>
//               </div>

//               <div style={{ background: '#fff3cd', border: '1px solid #ffc107', borderRadius: '8px', padding: '12px', marginTop: '16px', marginBottom: '16px' }}>
//                 <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
//                   Payment required: You will need to pay Rs {bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee} via Razorpay to confirm this appointment.
//                 </p>
//               </div>

//               <div className="find-doctors-modal-btns">
//                 <button className="find-doctors-cancel-btn" onClick={() => setSelectedDoctor(null)} type="button">Cancel</button>
//                 <button className="find-doctors-confirm-btn" onClick={handleBook} disabled={bookingLoading} type="button">
//                   {bookingLoading ? 'Processing...' : `Pay & Book (Rs ${bookingForm.type === 'telemedicine' ? selectedDoctor.telemedicineFee : selectedDoctor.consultationFee})`}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
// import { CalendarDays, MapPin, Search, Stethoscope, Video } from 'lucide-react';
import { CalendarDays, MapPin, Search, Stethoscope, Video, RotateCcw } from 'lucide-react';
import './FindDoctors.css';
import { loadRazorpayScript } from '../../utils/razorpay';
import { useAuth } from '../../context/AuthContext';

const SPECIALIZATIONS = [
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Psychiatrist',
  'General Physician',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist'
];

const buildLocationOptions = (doctorList = []) => {
  const statesMap = new Map();

  doctorList.forEach((doctor) => {
    const state = doctor?.addressState?.trim();
    const cityName = doctor?.addressCity?.trim();

    if (!state) {
      return;
    }

    if (!statesMap.has(state)) {
      statesMap.set(state, new Set());
    }

    if (cityName) {
      statesMap.get(state).add(cityName);
    }
  });

  return Array.from(statesMap.entries())
    .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
    .map(([state, cities]) => ({
      state,
      cities: Array.from(cities).sort((cityA, cityB) => cityA.localeCompare(cityB))
    }));
};

export default function FindDoctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    type: 'in-person',
    symptoms: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);

  const TIME_SLOTS = [
    '09:00 - 09:30',
    '09:30 - 10:00',
    '10:00 - 10:30',
    '10:30 - 11:00',
    '11:00 - 11:30',
    '14:00 - 14:30',
    '14:30 - 15:00',
    '15:00 - 15:30',
    '16:00 - 16:30',
    '16:30 - 17:00'
  ];

  useEffect(() => {
    fetchDoctors();
  }, [search, specialization, city, stateName]);

  useEffect(() => {
    if (!user) return;

    setCity((currentCity) => currentCity || user.addressCity || '');
    setStateName((currentState) => currentState || user.addressState || '');
  }, [user]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (specialization) params.append('specialization', specialization);
      if (city.trim()) params.append('city', city.trim());
      if (stateName.trim()) params.append('state', stateName.trim());

      const { data } = await axios.get(`/api/doctors?${params.toString()}`);
      const doctorList = data.doctors || [];
      setDoctors(doctorList);
      setLocationOptions((currentOptions) => (
        currentOptions.length > 0 ? currentOptions : buildLocationOptions(doctorList)
      ));
    } catch (err) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

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

      setPendingAppointment(data.appointment);
      initiatePayment(data.appointment);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const initiatePayment = async (appointment) => {
    try {
      const loaded = await loadRazorpayScript();

      if (!loaded) {
        toast.error('Failed to load payment gateway');
        setPendingAppointment(null);
        return;
      }

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
            const { data: verifyData } = await axios.post('/api/payments/verify', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              appointmentId: appointment.id
            });

            if (verifyData.success) {
              toast.success('Payment successful! Appointment confirmed');
              setSelectedDoctor(null);
              setPendingAppointment(null);
              setBookingForm({
                appointmentDate: '',
                timeSlot: '',
                type: 'in-person',
                symptoms: ''
              });
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: { name: '', email: '', contact: '' },
        theme: { color: '#1565c0' },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
          emi: true
        }
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error?.description || 'Please try again'}`);
        setPendingAppointment(null);
      });

      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setPendingAppointment(null);
    }
  };

  const renderStars = (rating) =>
    '*'.repeat(Math.round(rating || 0)) + 'o'.repeat(5 - Math.round(rating || 0));

  const getDoctorLocation = (doctor) =>
    [doctor?.addressCity, doctor?.addressState].filter(Boolean).join(', ');

  const normalizedState = stateName.trim().toLowerCase();
  const normalizedCity = city.trim().toLowerCase();
  const filteredDoctors = doctors.filter((doctor) => {
    const doctorState = doctor?.addressState?.trim().toLowerCase() || '';
    const doctorCity = doctor?.addressCity?.trim().toLowerCase() || '';

    if (normalizedState && doctorState !== normalizedState) {
      return false;
    }

    if (normalizedCity && doctorCity !== normalizedCity) {
      return false;
    }

    return true;
  });

  const availableCities = locationOptions.find((item) => item.state === stateName)?.cities || [];

  const clearLocationFilters = () => {
    setCity('');
    setStateName('');
  };

  return (
    <div className="find-doctors-page">
      <div className="find-doctors-header">
        <h1 className="find-doctors-title">
          <Search size={24} /> Find a Doctor
        </h1>
        <p className="find-doctors-sub">{filteredDoctors.length} doctors available</p>
      </div>

      {/* {user?.addressCity || user?.addressState ? (
        <div className="find-doctors-location-bar">
          <MapPin size={15} />
          <span>
            Showing nearby doctors for {[user?.addressCity, user?.addressState].filter(Boolean).join(', ')}
          </span>
        </div>
      ) : null} */}

      <div className="find-doctors-filters">
        <input
          className="find-doctors-search"
          placeholder="Search by name or specialization..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          className="find-doctors-select"
          value={specialization}
          onChange={(event) => setSpecialization(event.target.value)}
        >
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          className="find-doctors-select"
          value={stateName}
          onChange={(event) => {
            const nextState = event.target.value;
            setStateName(nextState);
            setCity((currentCity) => {
              const nextCities = locationOptions.find((item) => item.state === nextState)?.cities || [];
              return nextCities.includes(currentCity) ? currentCity : '';
            });
          }}
        >
          <option value="">All States</option>
          {locationOptions.map((location) => (
            <option key={location.state} value={location.state}>
              {location.state}
            </option>
          ))}
        </select>

        <select
          className="find-doctors-select"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          disabled={!stateName}
        >
          <option value="">{stateName ? 'All Cities' : 'Select State First'}</option>
          {availableCities.map((cityOption) => (
            <option key={cityOption} value={cityOption}>
              {cityOption}
            </option>
          ))}
        </select>

        {/* <button
          type="button"
          className="find-doctors-clear-btn"
          onClick={clearLocationFilters}
        >
          Change
        </button> */}
        <button
          type="button"
          className="find-doctors-clear-btn"
          onClick={clearLocationFilters}>
          <RotateCcw size={16} strokeWidth={2.2} />
        </button>
      </div>

      {(city || stateName) && (
        <div className="find-doctors-location-bar">
          <MapPin size={15} />
          <span>
            Showing doctors for {[city || 'All Cities', stateName].filter(Boolean).join(', ')}
          </span>
        </div>
      )}

      <div className="find-doctors-chips">
        {SPECIALIZATIONS.slice(0, 6).map((item) => (
          <button
            key={item}
            className={`find-doctors-chip${specialization === item ? ' active' : ''}`}
            onClick={() => setSpecialization(specialization === item ? '' : item)}
            type="button"
          >
            {item}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="find-doctors-loading">Loading doctors...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="find-doctors-empty">
          No doctors found for selected city/state. Try different filters.
        </div>
      ) : (
        <div className="find-doctors-grid">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="find-doctors-card">
              <div className="find-doctors-card-top">
                <div className="find-doctors-avatar">
                  {doctor.user?.name?.[0] || 'D'}
                </div>

                <div className="find-doctors-doc-info">
                  <h3 className="find-doctors-doc-name">
                    Dr. {doctor.user?.name || 'Unknown'}
                  </h3>
                  <p className="find-doctors-doc-spec">{doctor.specialization}</p>
                  <p className="find-doctors-doc-exp">
                    {doctor.experience} yrs experience
                  </p>

                  {getDoctorLocation(doctor) && (
                    <p className="find-doctors-doc-location">
                      <MapPin size={13} /> {getDoctorLocation(doctor)}
                    </p>
                  )}

                  <div className="find-doctors-stars">
                    {renderStars(doctor.rating)}{' '}
                    <span className="find-doctors-reviews">
                      ({doctor.totalReviews || 0})
                    </span>
                  </div>
                </div>
              </div>

              {doctor.about && (
                <p className="find-doctors-about">
                  {doctor.about.substring(0, 100)}...
                </p>
              )}

              <div className="find-doctors-fees">
                <span className="find-doctors-fee">
                  <Stethoscope size={14} /> Rs {doctor.consultationFee}
                </span>
                {doctor.isAvailableOnline && (
                  <span className="find-doctors-fee">
                    <Video size={14} /> Rs {doctor.telemedicineFee}
                  </span>
                )}
              </div>

              <div className="find-doctors-langs">
                {doctor.languages?.map((language) => (
                  <span key={language} className="find-doctors-lang">
                    {language}
                  </span>
                ))}
              </div>

              <div className="find-doctors-card-actions">
                <button
                  className="find-doctors-book-btn"
                  onClick={() => setSelectedDoctor(doctor)}
                  type="button"
                >
                  <CalendarDays size={15} /> Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDoctor && (
        <div
          className="find-doctors-overlay"
          onClick={(event) =>
            event.target === event.currentTarget && setSelectedDoctor(null)
          }
        >
          <div className="find-doctors-modal">
            <h2 className="find-doctors-modal-title">
              <CalendarDays size={18} /> Book Appointment
            </h2>

            <div className="find-doctors-modal-doc">
              <div className="find-doctors-modal-avatar">
                {selectedDoctor.user?.name?.[0]}
              </div>
              <div>
                <div className="find-doctors-modal-doc-name">
                  Dr. {selectedDoctor.user?.name}
                </div>
                <div className="find-doctors-modal-doc-spec">
                  {selectedDoctor.specialization}
                </div>
                {getDoctorLocation(selectedDoctor) && (
                  <div className="find-doctors-modal-doc-location">
                    <MapPin size={13} /> {getDoctorLocation(selectedDoctor)}
                  </div>
                )}
              </div>
            </div>

            <div className="find-doctors-m-form">
              <label className="find-doctors-label">Appointment Type</label>

              <div className="find-doctors-type-row">
                {[
                  ['in-person', 'In-Person', `Rs ${selectedDoctor.consultationFee}`, <Stethoscope size={18} />],
                  ['telemedicine', 'Video Call', `Rs ${selectedDoctor.telemedicineFee}`, <Video size={18} />]
                ].map(([value, label, fee, icon]) => (
                  <div
                    key={value}
                    className={`find-doctors-type-card${
                      bookingForm.type === value ? ' active' : ''
                    }`}
                    onClick={() => setBookingForm({ ...bookingForm, type: value })}
                  >
                    <div style={{ fontSize: '20px' }}>{icon}</div>
                    <div style={{ fontSize: '12px', fontWeight: '600' }}>{label}</div>
                    <div style={{ fontSize: '11px', color: '#1565c0' }}>{fee}</div>
                  </div>
                ))}
              </div>

              <label className="find-doctors-label">Date</label>
              <input
                className="find-doctors-input"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={bookingForm.appointmentDate}
                onChange={(event) =>
                  setBookingForm({
                    ...bookingForm,
                    appointmentDate: event.target.value
                  })
                }
              />

              <label className="find-doctors-label">Time Slot</label>
              <div className="find-doctors-slot-grid">
                {TIME_SLOTS.map((slot) => (
                  <div
                    key={slot}
                    className={`find-doctors-slot${
                      bookingForm.timeSlot === slot ? ' active' : ''
                    }`}
                    onClick={() =>
                      setBookingForm({
                        ...bookingForm,
                        timeSlot: slot
                      })
                    }
                  >
                    {slot}
                  </div>
                ))}
              </div>

              <label className="find-doctors-label">Symptoms / Reason</label>
              <textarea
                className="find-doctors-input"
                style={{ height: '70px' }}
                placeholder="Describe your symptoms..."
                value={bookingForm.symptoms}
                onChange={(event) =>
                  setBookingForm({
                    ...bookingForm,
                    symptoms: event.target.value
                  })
                }
              />

              <div className="find-doctors-fee-row">
                <span>Consultation Fee:</span>
                <strong style={{ color: '#1565c0', fontSize: '18px' }}>
                  Rs{' '}
                  {bookingForm.type === 'telemedicine'
                    ? selectedDoctor.telemedicineFee
                    : selectedDoctor.consultationFee}
                </strong>
              </div>

              <div
                style={{
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '16px',
                  marginBottom: '16px'
                }}
              >
                <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                  Payment required: You will need to pay Rs{' '}
                  {bookingForm.type === 'telemedicine'
                    ? selectedDoctor.telemedicineFee
                    : selectedDoctor.consultationFee}{' '}
                  via Razorpay to confirm this appointment.
                </p>
              </div>

              <div className="find-doctors-modal-btns">
                <button
                  className="find-doctors-cancel-btn"
                  onClick={() => setSelectedDoctor(null)}
                  type="button"
                >
                  Cancel
                </button>

                <button
                  className="find-doctors-confirm-btn"
                  onClick={handleBook}
                  disabled={bookingLoading}
                  type="button"
                >
                  {bookingLoading
                    ? 'Processing...'
                    : `Pay & Book (Rs ${
                        bookingForm.type === 'telemedicine'
                          ? selectedDoctor.telemedicineFee
                          : selectedDoctor.consultationFee
                      })`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
