import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './DoctorPayments.css';

export default function DoctorPayments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, paid, pending

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments/history');
      
      // For doctors, the API returns payments where they are the doctor
      setPayments(data.payments || []);
      setStats({ 
        total: data.totalAmount || 0, 
        count: data.payments?.length || 0,
        pending: data.payments?.filter(p => p.status === 'pending').length || 0
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
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

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => {
        if (filter === 'paid') return p.status === 'paid';
        if (filter === 'pending') return p.status === 'pending' || p.appointment?.status === 'pending';
        return true;
      });

  if (loading) {
    return (
      <div className="doctor-payments-page">
        <h1 className="doctor-payments-title">💳 Payment History</h1>
        <div className="doctor-payments-loading">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="doctor-payments-page">
      {/* Header */}
      <div className="doctor-payments-header">
        <div>
          <h1 className="doctor-payments-title">💳 Payment History & Earnings</h1>
          <p className="doctor-payments-subtitle">Track your consultation earnings and payment status</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="doctor-payments-stats-grid">
        <div className="doctor-payments-stat-card" style={{ borderLeft: '4px solid #1565c0' }}>
          <div className="doctor-payments-stat-icon" style={{ background: '#e3f2fd' }}>💰</div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">₹{stats.total.toLocaleString('en-IN')}</div>
            <div className="doctor-payments-stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="doctor-payments-stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="doctor-payments-stat-icon" style={{ background: '#dcfce7' }}>✅</div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">{stats.count}</div>
            <div className="doctor-payments-stat-label">Paid Appointments</div>
          </div>
        </div>

        <div className="doctor-payments-stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="doctor-payments-stat-icon" style={{ background: '#fef3c7' }}>⏳</div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">{stats.pending}</div>
            <div className="doctor-payments-stat-label">Pending Payments</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="doctor-payments-filter-container">
        <button
          onClick={() => setFilter('all')}
          className={`doctor-payments-filter-btn${filter === 'all' ? ' active' : ''}`}
        >
          All Payments
          <span className="doctor-payments-badge">{payments.length}</span>
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`doctor-payments-filter-btn${filter === 'paid' ? ' active' : ''}`}
        >
          ✅ Paid
          <span className="doctor-payments-badge">{payments.filter(p => p.status === 'paid').length}</span>
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`doctor-payments-filter-btn${filter === 'pending' ? ' active' : ''}`}
        >
          ⏳ Pending
          <span className="doctor-payments-badge">{payments.filter(p => p.status === 'pending' || p.appointment?.status === 'pending').length}</span>
        </button>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <div className="doctor-payments-empty">
          <div className="doctor-payments-empty-icon">📋</div>
          <h3>No payments found</h3>
          <p>You don't have any {filter !== 'all' ? filter : ''} payments yet.</p>
        </div>
      ) : (
        <div className="doctor-payments-table-container">
          <table className="doctor-payments-table">
            <thead>
              <tr>
                <th className="doctor-payments-th">Transaction ID</th>
                <th className="doctor-payments-th">Patient</th>
                <th className="doctor-payments-th">Date & Time</th>
                <th className="doctor-payments-th">Type</th>
                <th className="doctor-payments-th">Amount</th>
                <th className="doctor-payments-th">Status</th>
                <th className="doctor-payments-th">Payment Method</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="doctor-payments-tr">
                  <td className="doctor-payments-td">
                    <div className="doctor-payments-tx-id">
                      {payment.razorpayPaymentId || payment.id.slice(0, 8)}
                    </div>
                  </td>
                  <td className="doctor-payments-td">
                    <div className="doctor-payments-patient-cell">
                      <div className="doctor-payments-avatar">
                        {payment.patient?.name?.[0] || 'P'}
                      </div>
                      <div>
                        <div className="doctor-payments-patient-name">
                          {payment.patient?.name || 'N/A'}
                        </div>
                        <div className="doctor-payments-appointment-id">
                          APT: {payment.appointment?.appointmentId?.slice(0, 8) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="doctor-payments-td">
                    <div className="doctor-payments-datetime">
                      <div>{formatDate(payment.createdAt)}</div>
                      <div className="doctor-payments-time">{formatTime(payment.createdAt)}</div>
                    </div>
                  </td>
                  <td className="doctor-payments-td">
                    <span className="doctor-payments-type-badge">
                      {payment.appointment?.type === 'telemedicine' ? '🎥 Video' : '🏥 Clinic'}
                    </span>
                  </td>
                  <td className="doctor-payments-td">
                    <strong className="doctor-payments-amount">₹{payment.amount}</strong>
                  </td>
                  <td className="doctor-payments-td">
                    <span 
                      className="doctor-payments-status-badge" 
                      style={{
                        background: payment.status === 'paid' ? '#dcfce7' : '#fef3c7',
                        color: payment.status === 'paid' ? '#15803d' : '#a16207'
                      }}
                    >
                      {payment.status === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                  <td className="doctor-payments-td">
                    {payment.method ? (
                      <span className="doctor-payments-method" style={{ textTransform: 'uppercase', fontSize: '12px' }}>
                        {payment.method}
                      </span>
                    ) : (
                      <span className="doctor-payments-method">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Section */}
      {stats.total > 0 && (
        <div className="doctor-payments-summary">
          <h3 className="doctor-payments-summary-title">📊 Earnings Summary</h3>
          <div className="doctor-payments-summary-grid">
            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Total Earned:</span>
              <span className="doctor-payments-summary-value">₹{stats.total.toLocaleString('en-IN')}</span>
            </div>
            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Total Appointments:</span>
              <span className="doctor-payments-summary-value">{stats.count}</span>
            </div>
            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Average per Appointment:</span>
              <span className="doctor-payments-summary-value">₹{stats.count > 0 ? Math.round(stats.total / stats.count) : 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
