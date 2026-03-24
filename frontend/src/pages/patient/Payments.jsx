import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { loadRazorpayScript } from '../../utils/razorpay';
import './Payments.css';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [pendingAppointments, setPendingAppointments] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchPendingAppointments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments/history');
      setPayments(data.payments || []);
      setStats({ total: data.totalAmount || 0, count: data.payments?.length || 0 });
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingAppointments = async () => {
    try {
      const { data } = await axios.get('/api/appointments?status=pending&type=all');
      setPendingAppointments(data.appointments || []);
    } catch (err) {
      console.error('Failed to load pending appointments');
    }
  };

  const handlePayment = async (appointment) => {
    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order
      const { data: orderData } = await axios.post('/api/payments/create-order', {
        appointmentId: appointment.id
      });

      const options = {
        key: orderData.order.key,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MediCare Pro',
        description: `Consultation Fee for Dr. ${appointment.doctor?.name}`,
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
              toast.success('Payment successful! ✅');
              fetchPayments();
              fetchPendingAppointments();
            } else {
              toast.error('Payment verification failed');
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: appointment.patient?.name || '',
          email: appointment.patient?.email || '',
          contact: appointment.patient?.phone || ''
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
        <h1 className="payments-title">💳 Payment History</h1>
        <div className="payments-loading">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="payments-page">
      <div className="payments-header">
        <h1 className="payments-title">💳 Payment History</h1>
        <p className="payments-subtitle">View all your payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="payments-stats-grid">
        <div className="payments-stat-card">
          <div className="payments-stat-icon">💰</div>
          <div className="payments-stat-value">₹{stats.total.toLocaleString()}</div>
          <div className="payments-stat-label">Total Spent</div>
        </div>
        <div className="payments-stat-card">
          <div className="payments-stat-icon">📋</div>
          <div className="payments-stat-value">{stats.count}</div>
          <div className="payments-stat-label">Transactions</div>
        </div>
        <div className="payments-stat-card">
          <div className="payments-stat-icon">✅</div>
          <div className="payments-stat-value">{payments.filter(p => p.status === 'paid').length}</div>
          <div className="payments-stat-label">Successful</div>
        </div>
      </div>

      {/* Pending Appointments - Payment Required */}
      {pendingAppointments.length > 0 && (
        <div className="payments-pending-section">
          <h2 className="payments-section-title">⏳ Pending Payments</h2>
          <div className="payments-pending-grid">
            {pendingAppointments.map((apt) => (
              <div key={apt.id} className="payment-card">
                <div className="payment-card-header">
                  <div className="payment-doctor-info">
                    <div className="payment-doc-avatar">{apt.doctor?.name?.[0] || 'D'}</div>
                    <div>
                      <div className="payment-doc-name">Dr. {apt.doctor?.name}</div>
                      <div className="payment-date-time">
                        {new Date(apt.appointmentDate).toLocaleDateString('en-IN')} at {apt.timeSlot}
                      </div>
                    </div>
                  </div>
                  <div className="payment-amount">₹{apt.fee}</div>
                </div>
                <div className="payment-card-footer">
                  <span className="payment-type-badge">
                    {apt.type === 'telemedicine' ? '🎥 Video' : '🏥 Clinic'}
                  </span>
                  <button className="pay-now-btn" onClick={() => handlePayment(apt)}>
                    💳 Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <div className="payments-empty">
          <div className="payments-empty-icon">💳</div>
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
                    <div className="payments-tx-id">{payment.razorpayPaymentId || payment.id.slice(0, 8)}</div>
                  </td>
                  <td className="payments-td">
                    <div className="payments-doctor-cell">
                      <div className="payments-doc-avatar">{payment.doctor?.name?.[0] || 'D'}</div>
                      <span>Dr. {payment.doctor?.name}</span>
                    </div>
                  </td>
                  <td className="payments-td">
                    <div>{formatDate(payment.createdAt)}</div>
                    <div className="payments-time">{formatTime(payment.createdAt)}</div>
                  </td>
                  <td className="payments-td">
                    <span className="payments-type-badge">
                      {payment.appointment?.type === 'telemedicine' ? '🎥 Video' : '🏥 Clinic'}
                    </span>
                  </td>
                  <td className="payments-td">
                    <span className="payments-amount">₹{payment.amount}</span>
                  </td>
                  <td className="payments-td">
                    <span className="payments-status-badge" style={{
                      background: payment.status === 'paid' ? '#dcfce7' : '#fee2e2',
                      color: payment.status === 'paid' ? '#15803d' : '#dc2626'
                    }}>
                      {payment.status === 'paid' ? '✅ Paid' : '❌ Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payment Summary */}
      {payments.length > 0 && (
        <div className="payments-summary">
          <div className="payments-summary-row">
            <span>Total Transactions:</span>
            <span className="payments-summary-value">{stats.count}</span>
          </div>
          <div className="payments-summary-row">
            <span>Total Amount Paid:</span>
            <span className="payments-summary-value">₹{stats.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}

