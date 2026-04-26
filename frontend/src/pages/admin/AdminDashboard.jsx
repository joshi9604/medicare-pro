import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  IndianRupee,
  Receipt,
  ShieldCheck,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [payments, setPayments] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState(null);
  const [tab, setTab] = useState('overview');
  const [revenueView, setRevenueView] = useState('overview');

  const isRevenueMode = location.pathname === '/admin/payments';

  const buildFallbackRevenueAnalytics = (statsData, paymentsData = []) => ({
    totalRevenue: Number(statsData?.totalRevenue || 0),
    monthlyRevenue: Number(statsData?.monthRevenue || 0),
    totalTransactions: paymentsData.length,
    paidTransactions: paymentsData.filter((payment) => payment.status === 'paid').length,
    pendingTransactions: paymentsData.filter((payment) => ['created', 'pending'].includes(String(payment.status).toLowerCase())).length,
    refundedTransactions: paymentsData.filter((payment) => payment.status === 'refunded').length,
    totalRefunds: paymentsData.reduce((sum, payment) => sum + Number(payment.refundAmount || 0), 0),
    averageOrderValue: 0,
    collectionRate: 0,
    monthlyBreakdown: []
  });

  useEffect(() => {
    Promise.allSettled([
      axios.get('/api/admin/stats'),
      axios.get('/api/admin/users'),
      axios.get('/api/admin/doctors/pending'),
      axios.get('/api/admin/payments')
    ])
      .then(([statsResult, usersResult, doctorsResult, paymentsResult]) => {
        if (statsResult.status !== 'fulfilled') {
          throw statsResult.reason;
        }

        const statsData = statsResult.value.data.stats;
        const usersData = usersResult.status === 'fulfilled' ? usersResult.value.data.users || [] : [];
        const doctorsData = doctorsResult.status === 'fulfilled' ? doctorsResult.value.data.doctors || [] : [];
        const paymentsData = paymentsResult.status === 'fulfilled' ? paymentsResult.value.data.payments || [] : [];
        const analyticsData = paymentsResult.status === 'fulfilled'
          ? (paymentsResult.value.data.analytics || buildFallbackRevenueAnalytics(statsData, paymentsData))
          : buildFallbackRevenueAnalytics(statsData, paymentsData);

        setStats(statsData);
        setUsers(usersData);
        setPendingDoctors(doctorsData);
        setPayments(paymentsData);
        setRevenueAnalytics(analyticsData);

        if (paymentsResult.status === 'rejected' && paymentsResult.reason?.response?.status === 404) {
          console.warn('Admin payments endpoint unavailable on current backend. Using fallback revenue stats.');
          toast('Revenue details are using fallback stats. Restart backend to enable full payment analytics.', {
            icon: 'ℹ️'
          });
        }
      })
      .catch((error) => {
        console.error('Admin dashboard fetch error:', error);
        toast.error('Failed to load admin dashboard');
      });
  }, []);

  useEffect(() => {
    if (!isRevenueMode) {
      setRevenueView('overview');
    }
  }, [isRevenueMode]);

  const approveDoctor = async (id, approve) => {
    try {
      await axios.put(`/api/admin/doctors/${id}/approve`, { isApproved: approve });
      setPendingDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
      toast.success(approve ? 'Doctor approved' : 'Doctor rejected');
    } catch {
      toast.error('Action failed');
    }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers((prev) => prev.map((user) => (user.id === id ? data.user : user)));
      toast.success('User status updated');
    } catch {
      toast.error('Failed');
    }
  };

  const chartData = stats ? [
    { name: 'Doctors', count: stats.totalDoctors },
    { name: 'Patients', count: stats.totalPatients },
    { name: 'Appointments', count: stats.totalAppointments },
    { name: 'Pending', count: stats.pendingDoctors }
  ] : [];

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totalUsers || 0, color: '#1565c0' },
    { icon: Stethoscope, label: 'Doctors', value: stats?.totalDoctors || 0, color: '#10b981' },
    { icon: UserCheck, label: 'Patients', value: stats?.totalPatients || 0, color: '#8b5cf6' },
    { icon: CalendarDays, label: 'Appointments', value: stats?.totalAppointments || 0, color: '#f59e0b' },
    { icon: Clock3, label: 'Pending Doctors', value: stats?.pendingDoctors || 0, color: '#ef4444' },
    { icon: Activity, label: 'Today', value: stats?.todayAppointments || 0, color: '#06b6d4' },
    { icon: IndianRupee, label: 'Total Revenue', value: `${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#10b981' },
    { icon: IndianRupee, label: 'Month Revenue', value: `${(stats?.monthRevenue || 0).toLocaleString('en-IN')}`, color: '#1565c0' }
  ];

  const revenueStatCards = [
    { icon: IndianRupee, label: 'Total Revenue', value: `Rs ${Number(revenueAnalytics?.totalRevenue || 0).toLocaleString('en-IN')}`, tone: 'emerald' },
    { icon: IndianRupee, label: 'Monthly Revenue', value: `Rs ${Number(revenueAnalytics?.monthlyRevenue || 0).toLocaleString('en-IN')}`, tone: 'blue' },
    { icon: Receipt, label: 'Transactions', value: revenueAnalytics?.totalTransactions || 0, tone: 'violet' },
    { icon: Wallet, label: 'Collection Rate', value: `${Number(revenueAnalytics?.collectionRate || 0).toFixed(1)}%`, tone: 'teal' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'doctors', label: 'Pending Doctors', icon: Stethoscope },
    { id: 'users', label: 'All Users', icon: Users }
  ];

  const revenueTabs = [
    { id: 'overview', label: 'Revenue Overview', icon: Wallet },
    { id: 'history', label: 'Payment History', icon: Receipt },
    { id: 'billing', label: 'Billing Stats', icon: CreditCard },
    { id: 'analytics', label: 'Earnings Analytics', icon: TrendingUp }
  ];

  const recentPayments = useMemo(() => payments.slice(0, 10), [payments]);

  const bestMonth = useMemo(() => {
    return (revenueAnalytics?.monthlyBreakdown || []).reduce((best, item) => {
      if (!best || item.revenue > best.revenue) return item;
      return best;
    }, null);
  }, [revenueAnalytics]);

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const formatDate = (value) => new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const formatTime = (value) => new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isRevenueMode) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-revenue-hero">
          <div>
            <div className="admin-dashboard-revenue-kicker">Payments Workspace</div>
            <h1 className="admin-dashboard-title"><IndianRupee size={24} /> Revenue & Billing</h1>
            <p className="admin-dashboard-revenue-subtitle">
              Focused payment operations view with collections, transactions, billing performance, payment history,
              and earnings analytics for your healthcare SaaS admin team.
            </p>
          </div>

          <button className="admin-dashboard-back-btn" type="button" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="admin-dashboard-revenue-stats-grid">
          {revenueStatCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`admin-dashboard-revenue-stat-card ${stat.tone}`}>
                <div className="admin-dashboard-revenue-stat-icon"><Icon size={20} /></div>
                <div className="admin-dashboard-revenue-stat-value">{stat.value}</div>
                <div className="admin-dashboard-revenue-stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="admin-dashboard-revenue-tabs">
          {revenueTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`admin-dashboard-tab ${revenueView === item.id ? 'active' : ''}`}
                onClick={() => setRevenueView(item.id)}
                type="button"
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {revenueView === 'overview' && (
          <div className="admin-dashboard-revenue-grid">
            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><TrendingUp size={18} /> Earnings Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={revenueAnalytics?.monthlyBreakdown || []}>
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><Receipt size={18} /> Billing Snapshot</h3>
              <div className="admin-dashboard-billing-list">
                <div className="admin-dashboard-billing-item">
                  <span>Paid Transactions</span>
                  <strong>{revenueAnalytics?.paidTransactions || 0}</strong>
                </div>
                <div className="admin-dashboard-billing-item">
                  <span>Pending Transactions</span>
                  <strong>{revenueAnalytics?.pendingTransactions || 0}</strong>
                </div>
                <div className="admin-dashboard-billing-item">
                  <span>Refunded Transactions</span>
                  <strong>{revenueAnalytics?.refundedTransactions || 0}</strong>
                </div>
                <div className="admin-dashboard-billing-item">
                  <span>Average Order Value</span>
                  <strong>{formatCurrency(revenueAnalytics?.averageOrderValue || 0)}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {revenueView === 'history' && (
          <div className="admin-dashboard-section admin-dashboard-payments-section">
            <h3 className="admin-dashboard-section-title"><Receipt size={18} /> Payment History</h3>
            {recentPayments.length === 0 ? (
              <div className="admin-dashboard-empty">No payment records available.</div>
            ) : (
              <div className="admin-dashboard-overflow-auto">
                <table className="admin-dashboard-table admin-dashboard-payments-table">
                  <thead>
                    <tr>
                      {['Transaction', 'Patient', 'Doctor', 'Date & Time', 'Amount', 'Status'].map((header) => (
                        <th key={header} className="admin-dashboard-table-header">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayments.map((payment) => (
                      <tr key={payment.id} className="admin-dashboard-table-row">
                        <td className="admin-dashboard-table-cell" data-label="Transaction">
                          <div className="admin-dashboard-payment-id">{payment.razorpayPaymentId || payment.id?.slice(0, 8) || 'N/A'}</div>
                        </td>
                        <td className="admin-dashboard-table-cell" data-label="Patient">
                          <strong className="admin-dashboard-table-cell-name">{payment.patient?.name || 'N/A'}</strong>
                        </td>
                        <td className="admin-dashboard-table-cell" data-label="Doctor">
                          <span className="admin-dashboard-table-cell-email">{payment.doctor?.name || 'N/A'}</span>
                        </td>
                        <td className="admin-dashboard-table-cell" data-label="Date & Time">
                          <span className="admin-dashboard-table-cell-email">{formatDate(payment.createdAt)} • {formatTime(payment.createdAt)}</span>
                        </td>
                        <td className="admin-dashboard-table-cell" data-label="Amount">
                          <strong className="admin-dashboard-payment-amount">{formatCurrency(payment.amount)}</strong>
                        </td>
                        <td className="admin-dashboard-table-cell" data-label="Status">
                          <span className={`admin-dashboard-payment-status ${String(payment.status).toLowerCase()}`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {revenueView === 'billing' && (
          <div className="admin-dashboard-revenue-grid">
            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><CreditCard size={18} /> Billing Stats</h3>
              <div className="admin-dashboard-billing-cards">
                <div className="admin-dashboard-billing-card">
                  <span>Gross Collections</span>
                  <strong>{formatCurrency(revenueAnalytics?.totalRevenue || 0)}</strong>
                </div>
                <div className="admin-dashboard-billing-card">
                  <span>Monthly Collections</span>
                  <strong>{formatCurrency(revenueAnalytics?.monthlyRevenue || 0)}</strong>
                </div>
                <div className="admin-dashboard-billing-card">
                  <span>Total Refunds</span>
                  <strong>{formatCurrency(revenueAnalytics?.totalRefunds || 0)}</strong>
                </div>
                <div className="admin-dashboard-billing-card">
                  <span>Collection Efficiency</span>
                  <strong>{Number(revenueAnalytics?.collectionRate || 0).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><CalendarDays size={18} /> Transaction Mix</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={[
                    { name: 'Paid', count: revenueAnalytics?.paidTransactions || 0 },
                    { name: 'Pending', count: revenueAnalytics?.pendingTransactions || 0 },
                    { name: 'Refunded', count: revenueAnalytics?.refundedTransactions || 0 }
                  ]}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {revenueView === 'analytics' && (
          <div className="admin-dashboard-revenue-grid">
            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><TrendingUp size={18} /> Earnings Analytics</h3>
              <div className="admin-dashboard-analytics-grid">
                <div className="admin-dashboard-analytics-item">
                  <span>Best Performing Month</span>
                  <strong>{bestMonth?.label || 'N/A'}</strong>
                </div>
                <div className="admin-dashboard-analytics-item">
                  <span>Highest Revenue</span>
                  <strong>{formatCurrency(bestMonth?.revenue || 0)}</strong>
                </div>
                <div className="admin-dashboard-analytics-item">
                  <span>Average Order Value</span>
                  <strong>{formatCurrency(revenueAnalytics?.averageOrderValue || 0)}</strong>
                </div>
                <div className="admin-dashboard-analytics-item">
                  <span>Total Processed Transactions</span>
                  <strong>{revenueAnalytics?.totalTransactions || 0}</strong>
                </div>
              </div>
            </div>

            <div className="admin-dashboard-section admin-dashboard-revenue-panel">
              <h3 className="admin-dashboard-section-title"><Wallet size={18} /> Monthly Collections</h3>
              <div className="admin-dashboard-monthly-list">
                {(revenueAnalytics?.monthlyBreakdown || []).map((month) => (
                  <div key={month.label} className="admin-dashboard-monthly-item">
                    <div>
                      <div className="admin-dashboard-monthly-label">{month.label}</div>
                      <div className="admin-dashboard-monthly-meta">{month.transactions} transactions</div>
                    </div>
                    <strong>{formatCurrency(month.revenue)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <h1 className="admin-dashboard-title"><ShieldCheck size={24} /> Admin Control Panel</h1>

      <div className="admin-dashboard-stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-dashboard-stat-card" style={{ borderTop: `3px solid ${stat.color}` }}>
              <div className="admin-dashboard-stat-icon"><Icon size={20} /></div>
              <div className="admin-dashboard-stat-value">{stat.value}</div>
              <div className="admin-dashboard-stat-label">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-dashboard-tabs">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`admin-dashboard-tab ${tab === item.id ? 'active' : ''}`}
              onClick={() => setTab(item.id)}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Activity size={18} /> System Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 13 }} />
              <YAxis tick={{ fontSize: 13 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#1565c0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'doctors' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Clock3 size={18} /> Pending Doctor Approvals ({pendingDoctors.length})</h3>
          {pendingDoctors.length === 0 ? (
            <div className="admin-dashboard-empty">No pending approvals.</div>
          ) : pendingDoctors.map((doctor) => (
            <div key={doctor.id} className="admin-dashboard-doc-row">
              <div className="admin-dashboard-doc-avatar">{doctor.user?.name?.[0] || 'D'}</div>
              <div className="admin-dashboard-doc-info">
                <div className="admin-dashboard-doc-name">{doctor.user?.name}</div>
                <div className="admin-dashboard-doc-meta">{doctor.user?.email} • {doctor.specialization}</div>
                <div className="admin-dashboard-doc-meta">License: {doctor.licenseNumber} • {doctor.experience} yrs exp</div>
              </div>
              <div className="admin-dashboard-doc-actions">
                <button className="admin-dashboard-approve-btn" onClick={() => approveDoctor(doctor.id, true)} type="button">
                  <CheckCircle2 size={15} />
                  <span>Approve</span>
                </button>
                <button className="admin-dashboard-reject-btn" onClick={() => approveDoctor(doctor.id, false)} type="button">
                  <XCircle size={15} />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-dashboard-section">
          <h3 className="admin-dashboard-section-title"><Users size={18} /> All Users ({users.length})</h3>
          <div className="admin-dashboard-overflow-auto">
            <table className="admin-dashboard-table">
              <thead>
                <tr>
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Action'].map((header) => (
                    <th key={header} className="admin-dashboard-table-header">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="admin-dashboard-table-row">
                    <td className="admin-dashboard-table-cell" data-label="Name"><strong className="admin-dashboard-table-cell-name">{user.name}</strong></td>
                    <td className="admin-dashboard-table-cell" data-label="Email"><span className="admin-dashboard-table-cell-email">{user.email}</span></td>
                    <td className="admin-dashboard-table-cell" data-label="Role">
                      <span className={`admin-dashboard-role-badge ${user.role}`}>
                        {user.role === 'admin' && <ShieldCheck size={14} />}
                        {user.role === 'doctor' && <Stethoscope size={14} />}
                        {user.role === 'patient' && <UserCheck size={14} />}
                        <span>{user.role}</span>
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell" data-label="Status">
                      <span className={`admin-dashboard-status ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="admin-dashboard-table-cell" data-label="Joined"><span className="admin-dashboard-table-cell-date">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span></td>
                    <td className="admin-dashboard-table-cell" data-label="Action">
                      <button
                        className={`admin-dashboard-toggle-btn ${user.isActive ? 'active' : 'inactive'}`}
                        onClick={() => toggleUser(user.id)}
                        type="button"
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
