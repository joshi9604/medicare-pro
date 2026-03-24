import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './AdminUsers.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id) => {
    try {
      const { data } = await axios.put(`/api/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u.id === id ? data.user : u));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);

  const stats = {
    total: users.length,
    patients: users.filter(u => u.role === 'patient').length,
    doctors: users.filter(u => u.role === 'doctor').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <h1 className="admin-users-title">👥 All Users</h1>
        <div className="admin-users-loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1 className="admin-users-title">👥 All Users</h1>
        <p className="admin-users-subtitle">Manage all users in the system</p>
      </div>

      {/* Stats */}
      <div className="admin-users-stats">
        <div className="admin-users-stat-card">
          <div className="admin-users-stat-value">{stats.total}</div>
          <div className="admin-users-stat-label">Total Users</div>
        </div>
        <div className="admin-users-stat-card patients">
          <div className="admin-users-stat-value">{stats.patients}</div>
          <div className="admin-users-stat-label">Patients</div>
        </div>
        <div className="admin-users-stat-card doctors">
          <div className="admin-users-stat-value">{stats.doctors}</div>
          <div className="admin-users-stat-label">Doctors</div>
        </div>
        <div className="admin-users-stat-card admins">
          <div className="admin-users-stat-value">{stats.admins}</div>
          <div className="admin-users-stat-label">Admins</div>
        </div>
        <div className="admin-users-stat-card active">
          <div className="admin-users-stat-value">{stats.active}</div>
          <div className="admin-users-stat-label">Active</div>
        </div>
        <div className="admin-users-stat-card inactive">
          <div className="admin-users-stat-value">{stats.inactive}</div>
          <div className="admin-users-stat-label">Inactive</div>
        </div>
      </div>

      {/* Filter */}
      <div className="admin-users-filters">
        {[
          { value: 'all', label: 'All Users', icon: '👥' },
          { value: 'patient', label: 'Patients', icon: '🧑‍💼' },
          { value: 'doctor', label: 'Doctors', icon: '👨‍⚕️' },
          { value: 'admin', label: 'Admins', icon: '🏥' }
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`admin-users-filter-btn ${filter === f.value ? 'active' : ''}`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="admin-users-table-container">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="admin-users-user-cell">
                    <div className="admin-users-avatar">{user.name?.[0] || 'U'}</div>
                    <div className="admin-users-name">{user.name}</div>
                  </div>
                </td>
                <td>
                  <span className="admin-users-email">{user.email}</span>
                </td>
                <td>
                  <span className={`admin-users-role-badge ${user.role}`}>
                    {user.role === 'admin' ? '🏥' : user.role === 'doctor' ? '👨‍⚕️' : '🧑‍💼'} {user.role}
                  </span>
                </td>
                <td>
                  <span className={`admin-users-status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? '● Active' : '● Inactive'}
                  </span>
                </td>
                <td>
                  <span className="admin-users-date">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span>
                </td>
                <td>
                  <button
                    onClick={() => toggleUser(user.id)}
                    className={`admin-users-action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
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
  );
}
