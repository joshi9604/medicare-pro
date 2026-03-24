import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from '../notifications/NotificationBell';
import './AppLayout.css';

const NAV_ITEMS = {
  patient: [
    { to: '/patient/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/patient/find-doctors', icon: '🔍', label: 'Find Doctors' },
    { to: '/patient/appointments', icon: '📅', label: 'My Appointments' },
    { to: '/patient/prescriptions', icon: '💊', label: 'Prescriptions' },
    { to: '/patient/payments', icon: '💳', label: 'Payments' },
    { to: '/patient/records', icon: '📋', label: 'Medical Records' },
    { to: '/patient/profile', icon: '👤', label: 'Profile' },
  ],
  doctor: [
    { to: '/doctor/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/doctor/appointments', icon: '📅', label: 'Appointments' },
    { to: '/doctor/patients', icon: '🧑‍💼', label: 'My Patients' },
    { to: '/doctor/prescriptions', icon: '💊', label: 'Prescriptions' },
    { to: '/doctor/schedule', icon: '🗓️', label: 'My Schedule' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/users', icon: '👥', label: 'Users' },
    { to: '/admin/doctors', icon: '👨‍⚕️', label: 'Doctors' },
    { to: '/admin/appointments', icon: '📅', label: 'Appointments' },
    { to: '/admin/payments', icon: '💰', label: 'Revenue' },
  ]
};

const ROLE_COLORS = { patient: '#1565c0', doctor: '#10b981', admin: '#8b5cf6' };
const ROLE_LABELS = { patient: '🧑‍💼 Patient', doctor: '👨‍⚕️ Doctor', admin: '🏥 Admin' };

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const navItems = NAV_ITEMS[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || '#1565c0';

  const handleLogout = () => { logout(); navigate('/auth'); };

  // Profile menu items based on role
  const profileMenuItems = {
    patient: [
      { to: '/patient/profile', icon: '👤', label: 'My Profile' },
      { to: '/patient/payments', icon: '💳', label: 'Payment History' },
    ],
    doctor: [
      { to: '/doctor/profile', icon: '👨‍⚕️', label: 'Professional Profile' },
      { to: '/doctor/payments', icon: '💰', label: 'Payment History' },
    ],
    admin: [
      { to: '/admin/dashboard', icon: '📊', label: 'Admin Panel' },
    ]
  };

  const currentProfileMenu = profileMenuItems[user?.role] || [];

  return (
    <div className="layout">
      <aside className="sidebar" style={{ width: collapsed ? '64px' : '230px' }}>
        {/* Logo */}
        <div className="logo">
          <span className="logo-icon">🏥</span>
          {!collapsed && <span className="logo-text">MediCare Pro</span>}
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="role-badge" style={{ background: roleColor + '15', color: roleColor, borderColor: roleColor + '30' }}>
            {ROLE_LABELS[user?.role]}
          </div>
        )}

        {/* Nav */}
        <nav className="nav">
          {navItems.map(item => (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                background: isActive ? roleColor + '15' : 'transparent',
                color: isActive ? roleColor : '#64748b',
                borderLeft: isActive ? `3px solid ${roleColor}` : '3px solid transparent',
              })}>
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="bottom">
          {!collapsed && (
            <div 
              className="user-card"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="avatar" style={{ background: roleColor }}>{user?.name?.[0]?.toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user?.name?.split(' ')[0]}</div>
                <div className="user-role">{user?.role}</div>
              </div>
              <span className="user-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </div>
          )}

          {/* User Menu Dropdown */}
          {showUserMenu && !collapsed && (
            <div className="user-menu">
              {currentProfileMenu.map((item, index) => (
                <NavLink
                  key={index}
                  to={item.to}
                  className="user-menu-item"
                  onClick={() => setShowUserMenu(false)}
                >
                  <span className="menu-item-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
              <div className="menu-divider" />
              <button className="logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          )}

          {!showUserMenu && !collapsed && (
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          )}
          
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      <main className="main" style={{ marginLeft: collapsed ? '64px' : '230px' }}>
        {/* Top bar */}
        <div className="top-bar">
          <div className="breadcrumb">
            {user?.role === 'patient' && '🧑‍💼 Patient Portal'}
            {user?.role === 'doctor' && '👨‍⚕️ Doctor Portal'}
            {user?.role === 'admin' && '🏥 Admin Panel'}
          </div>
          <div className="top-right">
            <NotificationBell />
            <button className="theme-btn" onClick={toggleDarkMode} title={darkMode ? 'Light Mode' : 'Dark Mode'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <div className="online-dot" style={{ background: '#10b981' }} />
            <span className="online-text">Online</span>
          </div>
        </div>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
