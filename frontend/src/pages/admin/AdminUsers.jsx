import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Stethoscope, UserCheck, UserCog, Users } from 'lucide-react';
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
      setUsers((prev) => prev.map((user) => user.id === id ? data.user : user));
      toast.success('User status updated');
    } catch {
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = filter === 'all' ? users : users.filter((user) => user.role === filter);

  const stats = {
    total: users.length,
    patients: users.filter((user) => user.role === 'patient').length,
    doctors: users.filter((user) => user.role === 'doctor').length,
    admins: users.filter((user) => user.role === 'admin').length,
    active: users.filter((user) => user.isActive).length,
    inactive: users.filter((user) => !user.isActive).length
  };

  const filters = [
    { value: 'all', label: 'All Users', icon: Users },
    { value: 'patient', label: 'Patients', icon: UserCheck },
    { value: 'doctor', label: 'Doctors', icon: Stethoscope },
    { value: 'admin', label: 'Admins', icon: ShieldCheck }
  ];

  if (loading) {
    return (
      <div className="admin-users-page">
        <h1 className="admin-users-title"><Users size={24} /> All Users</h1>
        <div className="admin-users-loading">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-users-header">
        <h1 className="admin-users-title"><Users size={24} /> All Users</h1>
        <p className="admin-users-subtitle">Manage all users in the system</p>
      </div>

      <div className="admin-users-stats">
        <div className="admin-users-stat-card">
          <div className="admin-users-stat-icon"><Users size={18} /></div>
          <div className="admin-users-stat-value">{stats.total}</div>
          <div className="admin-users-stat-label">Total Users</div>
        </div>
        <div className="admin-users-stat-card patients">
          <div className="admin-users-stat-icon"><UserCheck size={18} /></div>
          <div className="admin-users-stat-value">{stats.patients}</div>
          <div className="admin-users-stat-label">Patients</div>
        </div>
        <div className="admin-users-stat-card doctors">
          <div className="admin-users-stat-icon"><Stethoscope size={18} /></div>
          <div className="admin-users-stat-value">{stats.doctors}</div>
          <div className="admin-users-stat-label">Doctors</div>
        </div>
        <div className="admin-users-stat-card admins">
          <div className="admin-users-stat-icon"><ShieldCheck size={18} /></div>
          <div className="admin-users-stat-value">{stats.admins}</div>
          <div className="admin-users-stat-label">Admins</div>
        </div>
        <div className="admin-users-stat-card active">
          <div className="admin-users-stat-icon"><UserCog size={18} /></div>
          <div className="admin-users-stat-value">{stats.active}</div>
          <div className="admin-users-stat-label">Active</div>
        </div>
        <div className="admin-users-stat-card inactive">
          <div className="admin-users-stat-icon"><UserCog size={18} /></div>
          <div className="admin-users-stat-value">{stats.inactive}</div>
          <div className="admin-users-stat-label">Inactive</div>
        </div>
      </div>

      <div className="admin-users-filters">
        {filters.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`admin-users-filter-btn ${filter === item.value ? 'active' : ''}`}
              type="button"
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td data-label="User">
                  <div className="admin-users-user-cell">
                    <div className="admin-users-avatar">{user.name?.[0] || 'U'}</div>
                    <div className="admin-users-name">{user.name}</div>
                  </div>
                </td>
                <td data-label="Email"><span className="admin-users-email">{user.email}</span></td>
                <td data-label="Role">
                  <span className={`admin-users-role-badge ${user.role}`}>
                    {user.role === 'admin' && <ShieldCheck size={14} />}
                    {user.role === 'doctor' && <Stethoscope size={14} />}
                    {user.role === 'patient' && <UserCheck size={14} />}
                    <span>{user.role}</span>
                  </span>
                </td>
                <td data-label="Status">
                  <span className={`admin-users-status ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td data-label="Joined"><span className="admin-users-date">{new Date(user.createdAt).toLocaleDateString('en-IN')}</span></td>
                <td data-label="Actions">
                  <button
                    onClick={() => toggleUser(user.id)}
                    className={`admin-users-action-btn ${user.isActive ? 'deactivate' : 'activate'}`}
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
  );
}
