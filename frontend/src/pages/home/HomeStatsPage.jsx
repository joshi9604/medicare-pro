import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, Stethoscope, Users } from 'lucide-react';
import './HomePage.css';

const roleConfig = {
  patients: {
    apiRole: 'patient',
    title: 'Patients',
    icon: Users
  },
  doctors: {
    apiRole: 'doctor',
    title: 'Doctors',
    icon: Stethoscope
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export default function HomeStatsPage() {
  const { role } = useParams();
  const config = roleConfig[role] || roleConfig.patients;
  const Icon = config.icon;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    axios.get(`/api/public/users?role=${config.apiRole}`)
      .then((response) => {
        if (!isMounted) return;
        setUsers(response.data?.users || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.message || 'Unable to load data');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [config.apiRole]);

  const approvedDoctors = useMemo(() => (
    users.filter((user) => user.doctorProfile?.isApproved).length
  ), [users]);

  return (
    <div className="home">
      <header className="home-header">
        <Link className="home-brand home-brand-link" to="/">
          <div className="home-logo" aria-hidden>
            <Building2 size={22} />
          </div>
          <div className="home-brand-text">
            <div className="home-title">MediCare Pro</div>
            <div className="home-subtitle">Hospital Management + Telemedicine</div>
          </div>
        </Link>

        <Link className="home-btn home-btn-ghost" to="/">
          <ArrowLeft size={16} /> Back
        </Link>
      </header>

      <main className="home-main">
        <section className="home-stats-page" aria-label={`${config.title} details`}>
          <div className="home-stats-head">
            <div className="home-kicker">
              <Icon size={15} /> {config.title}
            </div>
            <h1 className="home-h2">{config.title} information</h1>
            <p className="home-p">
              Total {config.title.toLowerCase()} calculated from live database records.
            </p>
          </div>

          <div className="home-summary-grid">
            <div className="home-summary-box">
              <div className="home-summary-label">Total {config.title}</div>
              <div className="home-summary-value">{loading ? '...' : users.length}</div>
            </div>

            {config.apiRole === 'doctor' && (
              <div className="home-summary-box">
                <div className="home-summary-label">Approved Doctors</div>
                <div className="home-summary-value">{loading ? '...' : approvedDoctors}</div>
              </div>
            )}
          </div>

          <div className="home-table-wrap">
            {loading ? (
              <div className="home-table-state">Loading...</div>
            ) : error ? (
              <div className="home-table-state">{error}</div>
            ) : users.length === 0 ? (
              <div className="home-table-state">No {config.title.toLowerCase()} found.</div>
            ) : (
              <table className="home-data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                    {config.apiRole === 'doctor' && (
                      <>
                        <th>Specialization</th>
                        <th>Experience</th>
                        <th>Fee</th>
                        <th>Status</th>
                      </>
                    )}
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="Role">{user.role}</td>
                      {config.apiRole === 'doctor' && (
                        <>
                          <td data-label="Specialization">{user.doctorProfile?.specialization || '-'}</td>
                          <td data-label="Experience">{user.doctorProfile?.experience ?? 0} yrs</td>
                          <td data-label="Fee">Rs {user.doctorProfile?.consultationFee || 0}</td>
                          <td data-label="Status">
                            {user.doctorProfile?.isApproved ? 'Approved' : 'Pending'}
                          </td>
                        </>
                      )}
                      <td data-label="Joined">{formatDate(user.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
