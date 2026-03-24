import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
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
    : appointments.filter(a => a.status === filter);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="appointments-page">
        <h1 className="appointments-title">📅 My Appointments</h1>
        <div className="appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <h1 className="appointments-title">📅 My Appointments</h1>
        <p className="appointments-subtitle">Manage your upcoming and past appointments</p>
      </div>

      {/* Filter Tabs */}
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
                {appointments.filter(a => a.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="appointments-empty">
          <div className="appointments-empty-icon">📋</div>
          <h3>No appointments found</h3>
          <p>You don't have any {filter !== 'all' ? filter : ''} appointments.</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="appointments-card">
              {/* Card Header */}
              <div className="appointments-card-header">
                <div className="appointments-appointment-id">{apt.appointmentId}</div>
                <span className={`appointments-status-badge appointments-status-${apt.status}`}>
                  {apt.status}
                </span>
              </div>

              {/* Doctor Info */}
              <div className="appointments-doctor-info">
                <div className="appointments-avatar">{apt.doctor?.name?.[0] || 'D'}</div>
                <div className="appointments-doctor-details">
                  <div className="appointments-doctor-name">Dr. {apt.doctor?.name}</div>
                  <div className="appointments-specialization">{apt.doctorProfile?.specialization}</div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="appointments-details">
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon">📅</span>
                  <span>{formatDate(apt.appointmentDate)}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon">⏰</span>
                  <span>{apt.timeSlot}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon">{apt.type === 'telemedicine' ? '🎥' : '🏥'}</span>
                  <span>{apt.type === 'telemedicine' ? 'Video Consultation' : 'In-Person Visit'}</span>
                </div>
                <div className="appointments-detail-row">
                  <span className="appointments-detail-icon">💰</span>
                  <span className="appointments-fee">₹{apt.fee}</span>
                </div>
              </div>

              {/* Symptoms */}
              {apt.symptoms && (
                <div className="appointments-symptoms">
                  <strong>Symptoms:</strong> {apt.symptoms}
                </div>
              )}

              {/* Actions */}
              <div className="appointments-actions">
                {apt.status === 'pending' && (
                  <button
                    onClick={() => cancelAppointment(apt.id)}
                    className="appointments-cancel-btn"
                  >
                    Cancel Appointment
                  </button>
                )}
                {apt.status === 'confirmed' && apt.type === 'telemedicine' && apt.videoCallLink && (
                  <a
                    href={apt.videoCallLink}
                    target="_blank"
                    rel="noreferrer"
                    className="appointments-join-btn"
                  >
                    🎥 Join Video Call
                  </a>
                )}
                {apt.status === 'completed' && !apt.rating && (
                  <button className="appointments-rate-btn" onClick={() => setRatingModal(apt)}>
                    ⭐ Rate Doctor
                  </button>
                )}
                {apt.rating && (
                  <div className="appointments-rating">
                    {'⭐'.repeat(apt.rating)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <div className="appointments-overlay" onClick={(e) => e.target === e.currentTarget && setRatingModal(null)}>
          <div className="appointments-modal">
            <div className="appointments-modal-header">
              <h3>⭐ Rate Your Experience</h3>
              <button onClick={() => setRatingModal(null)} className="appointments-close-btn">✕</button>
            </div>
            <div className="appointments-modal-content">
              <p className="appointments-modal-text">How was your consultation with Dr. {ratingModal.doctor?.name}?</p>
              
              <div className="appointments-stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="appointments-star-btn"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>

              <textarea
                className="appointments-review-input"
                placeholder="Share your experience (optional)..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />

              <button
                className="appointments-submit-btn"
                onClick={async () => {
                  if (!rating) return toast.error('Please select a rating');
                  setSubmitting(true);
                  try {
                    await axios.post(`/api/appointments/${ratingModal.id}/rate`, { rating, review });
                    toast.success('Thank you for your feedback! ⭐');
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
