import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Hourglass,
  Stethoscope,
  Video
} from 'lucide-react';
import './DoctorPayments.css';

export default function DoctorPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const normalizeAmount = (value) => {
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amount || 0));
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/payments/history');
      const paymentsData = Array.isArray(data?.payments) ? data.payments : [];
      setPayments(paymentsData);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const paidPayments = payments.filter(
      (payment) => String(payment.status).toLowerCase() === 'paid'
    );

    const pendingPayments = payments.filter((payment) => {
      const paymentStatus = String(payment.status).toLowerCase();
      const appointmentStatus = String(payment.appointment?.status || '').toLowerCase();

      return paymentStatus === 'created' || paymentStatus === 'pending' || appointmentStatus === 'pending';
    });

    const totalAmount = paidPayments.reduce(
      (sum, payment) => sum + normalizeAmount(payment.amount),
      0
    );

    return {
      total: totalAmount,
      count: paidPayments.length,
      pending: pendingPayments.length,
      all: payments.length
    };
  }, [payments]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  const formatTime = (dateStr) =>
    new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });

  const filteredPayments =
    filter === 'all'
      ? payments
      : payments.filter((payment) => {
          const paymentStatus = String(payment.status).toLowerCase();
          const appointmentStatus = String(payment.appointment?.status || '').toLowerCase();

          if (filter === 'paid') return paymentStatus === 'paid';
          if (filter === 'pending') {
            return paymentStatus === 'created' || paymentStatus === 'pending' || appointmentStatus === 'pending';
          }
          return true;
        });

  if (loading) {
    return (
      <div className="doctor-payments-page">
        <h1 className="doctor-payments-title">
          <CreditCard size={24} /> Payment History
        </h1>
        <div className="doctor-payments-loading">Loading payment history...</div>
      </div>
    );
  }

  return (
    <div className="doctor-payments-page">
      <div className="doctor-payments-header">
        <div>
          <h1 className="doctor-payments-title">
            <CreditCard size={24} /> Payment History & Earnings
          </h1>
          <p className="doctor-payments-subtitle">
            Track your consultation earnings and payment status
          </p>
        </div>
      </div>

      <div className="doctor-payments-stats-grid">
        <div
          className="doctor-payments-stat-card"
          style={{ borderLeft: '4px solid #1565c0' }}
        >
          <div
            className="doctor-payments-stat-icon"
            style={{ background: '#e3f2fd' }}
          >
            <CreditCard size={24} />
          </div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">
              ₹{formatAmount(stats.total)}
            </div>
            <div className="doctor-payments-stat-label">Total Earnings</div>
          </div>
        </div>

        <div
          className="doctor-payments-stat-card"
          style={{ borderLeft: '4px solid #10b981' }}
        >
          <div
            className="doctor-payments-stat-icon"
            style={{ background: '#dcfce7' }}
          >
            <CheckCircle2 size={24} />
          </div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">{stats.count}</div>
            <div className="doctor-payments-stat-label">Paid Appointments</div>
          </div>
        </div>

        <div
          className="doctor-payments-stat-card"
          style={{ borderLeft: '4px solid #f59e0b' }}
        >
          <div
            className="doctor-payments-stat-icon"
            style={{ background: '#fef3c7' }}
          >
            <Hourglass size={24} />
          </div>
          <div className="doctor-payments-stat-content">
            <div className="doctor-payments-stat-value">{stats.pending}</div>
            <div className="doctor-payments-stat-label">Pending Payments</div>
          </div>
        </div>
      </div>

      <div className="doctor-payments-filter-container">
        <button
          onClick={() => setFilter('all')}
          className={`doctor-payments-filter-btn${filter === 'all' ? ' active' : ''}`}
          type="button"
        >
          All Payments
          <span className="doctor-payments-badge">{stats.all}</span>
        </button>

        <button
          onClick={() => setFilter('paid')}
          className={`doctor-payments-filter-btn${filter === 'paid' ? ' active' : ''}`}
          type="button"
        >
          <CheckCircle2 size={15} /> Paid
          <span className="doctor-payments-badge">{stats.count}</span>
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`doctor-payments-filter-btn${filter === 'pending' ? ' active' : ''}`}
          type="button"
        >
          <Hourglass size={15} /> Pending
          <span className="doctor-payments-badge">{stats.pending}</span>
        </button>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="doctor-payments-empty">
          <div className="doctor-payments-empty-icon">
            <CalendarDays size={44} />
          </div>
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
              {filteredPayments.map((payment) => {
                const paymentStatus = String(payment.status).toLowerCase();
                const isPaid = paymentStatus === 'paid';
                const isPending =
                  paymentStatus === 'created' ||
                  paymentStatus === 'pending' ||
                  String(payment.appointment?.status || '').toLowerCase() === 'pending';

                return (
                  <tr key={payment.id} className="doctor-payments-tr">
                    <td className="doctor-payments-td" data-label="Transaction ID">
                      <div className="doctor-payments-tx-id">
                        {payment.razorpayPaymentId || payment.id?.slice(0, 8) || 'N/A'}
                      </div>
                    </td>

                    <td className="doctor-payments-td" data-label="Patient">
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

                    <td className="doctor-payments-td" data-label="Date & Time">
                      <div className="doctor-payments-datetime">
                        <div>{formatDate(payment.createdAt)}</div>
                        <div className="doctor-payments-time">
                          {formatTime(payment.createdAt)}
                        </div>
                      </div>
                    </td>

                    <td className="doctor-payments-td" data-label="Type">
                      <span className="doctor-payments-type-badge">
                        {payment.appointment?.type === 'telemedicine' ? (
                          <>
                            <Video size={14} /> Video
                          </>
                        ) : (
                          <>
                            <Stethoscope size={14} /> Clinic
                          </>
                        )}
                      </span>
                    </td>

                    <td className="doctor-payments-td" data-label="Amount">
                      <strong className="doctor-payments-amount">
                        ₹{formatAmount(payment.amount)}
                      </strong>
                    </td>

                    <td className="doctor-payments-td" data-label="Status">
                      <span
                        className="doctor-payments-status-badge"
                        style={{
                          background: isPaid ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                          color: isPaid ? '#15803d' : isPending ? '#a16207' : '#dc2626'
                        }}
                      >
                        {isPaid ? 'Paid' : isPending ? 'Pending' : payment.status}
                      </span>
                    </td>

                    <td className="doctor-payments-td" data-label="Payment Method">
                      {payment.method ? (
                        <span
                          className="doctor-payments-method"
                          style={{ textTransform: 'uppercase', fontSize: '12px' }}
                        >
                          {payment.method}
                        </span>
                      ) : (
                        <span className="doctor-payments-method">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {stats.total > 0 && (
        <div className="doctor-payments-summary">
          <h3 className="doctor-payments-summary-title">Earnings Summary</h3>

          <div className="doctor-payments-summary-grid">
            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Total Earned:</span>
              <span className="doctor-payments-summary-value">
                ₹{formatAmount(stats.total)}
              </span>
            </div>

            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Paid Appointments:</span>
              <span className="doctor-payments-summary-value">{stats.count}</span>
            </div>

            <div className="doctor-payments-summary-item">
              <span className="doctor-payments-summary-label">Average per Appointment:</span>
              <span className="doctor-payments-summary-value">
                ₹{formatAmount(stats.count > 0 ? stats.total / stats.count : 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}