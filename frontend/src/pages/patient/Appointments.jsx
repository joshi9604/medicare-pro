import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CalendarDays, Clock3, Star, Stethoscope, Video, Wallet } from 'lucide-react';
import './Appointments.css';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ratingModal, setRatingModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/appointments');
      setAppointments(data.appointments || []);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await axios.put(`/api/appointments/${id}/cancel`, { reason: 'Patient cancelled' });
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filteredAppointments = filter === 'all'
    ? appointments
    : appointments.filter((appointment) => appointment.status === filter);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  if (loading) {
    return (
      <div className="appointments-page">
        <h1 className="appointments-title"><CalendarDays size={24} /> My Appointments</h1>
        <div className="appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1 className="appointments-title"><CalendarDays size={24} /> My Appointments</h1>
        <p className="appointments-subtitle">Manage your upcoming and past appointments</p>
      </div>

      <div className="appointments-filter-container">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`appointments-filter-btn ${status}${filter === status ? ' active' : ''}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && (
              <span className="appointments-badge">
                {appointments.filter((appointment) => appointment.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="appointments-empty">
          <div className="appointments-empty-icon"><CalendarDays size={42} /></div>
          <h3>No appointments found</h3>
          <p>You don't have any {filter !== 'all' ? filter : ''} appointments.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="appointments-card">
              <div className="appointments-card-header">
                <div className="appointments-appointment-id">{appointment.appointmentId}</div>
                <span className={`appointments-status-badge appointments-status-${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointments-doctor-info">
                <div className="appointments-avatar">{appointment.doctor?.name?.[0] || 'D'}</div>
                <div className="appointments-doctor-details">
                  <div className="appointments-doctor-name">Dr. {appointment.doctor?.name}</div>
                  <div className="appointments-specialization">{appointment.doctorProfile?.specialization}</div>
                </div>
              </div>

              <div className="appointments-details">
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon"><CalendarDays size={16} /></span>
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon"><Clock3 size={16} /></span>
                  <span>{appointment.timeSlot}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon">
                    {appointment.type === 'telemedicine' ? <Video size={16} /> : <Stethoscope size={16} />}
                  </span>
                  <span>{appointment.type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon"><Wallet size={16} /></span>
                  <span className="appointments-fee">Rs {appointment.fee}</span>
                </div>
              </div>

              {appointment.symptoms && (
                <div className="appointments-symptoms">
                  <strong>Symptoms:</strong> {appointment.symptoms}
                </div>
              )}

              <div className="appointments-actions">
                {appointment.status === 'pending' && (
                  <button onClick={() => cancelAppointment(appointment.id)} className="appointments-cancel-btn">
                    Cancel Appointment
                  </button>
                )}
                {appointment.status === 'confirmed' && appointment.type === 'telemedicine' && appointment.videoCallLink && (
                  <a href={appointment.videoCallLink} target="_blank" rel="noreferrer" className="appointments-join-btn">
                    <Video size={15} /> Join Video Call
                  </a>
                )}
                {appointment.status === 'completed' && !appointment.rating && (
                  <button className="appointments-rate-btn" onClick={() => setRatingModal(appointment)}>
                    <Star size={15} /> Rate Doctor
                  </button>
                )}
                {appointment.rating && (
                  <div className="appointments-rating">
                    {'*'.repeat(appointment.rating)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {ratingModal && (
        <div className="appointments-overlay" onClick={(event) => event.target === event.currentTarget && setRatingModal(null)}>
          <div className="appointments-modal">
            <div className="appointments-modal-header">
              <h3><Star size={18} /> Rate Your Experience</h3>
              <button onClick={() => setRatingModal(null)} className="appointments-close-btn">x</button>
            </div>
            <div className="appointments-modal-content">
              <p className="appointments-modal-text">How was your consultation with Dr. {ratingModal.doctor?.name}?</p>

              <div className="appointments-stars-container">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    onClick={() => setRating(starValue)}
                    className="appointments-star-btn"
                    type="button"
                  >
                    {starValue <= rating ? '*' : 'o'}
                  </button>
                ))}
              </div>

              <textarea
                className="appointments-review-input"
                placeholder="Share your experience (optional)..."
                value={review}
                onChange={(event) => setReview(event.target.value)}
                rows={4}
              />

              <button
                className="appointments-submit-btn"
                onClick={async () => {
                  if (!rating) return toast.error('Please select a rating');
                  setSubmitting(true);
                  try {
                    await axios.post(`/api/appointments/${ratingModal.id}/rate`, { rating, review });
                    toast.success('Thank you for your feedback!');
                    setRatingModal(null);
                    setRating(0);
                    setReview('');
                    fetchAppointments();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'Failed to submit rating');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={submitting || !rating}
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
