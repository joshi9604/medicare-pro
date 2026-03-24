import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

const ROLES = [
  { id: 'patient', label: 'Patient', icon: '🧑‍💼', desc: 'Book appointments & consultations' },
  { id: 'doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'Manage patients & appointments' },
  { id: 'admin', label: 'Admin', icon: '🏥', desc: 'Manage the entire system' }
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', gender: 'male', role: 'patient' });
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await login(form.email, form.password);
        toast.success(`Welcome back, ${data.user.name}! 🏥`);
        navigate(`/${data.user.role}/dashboard`);
      } else {
        const data = await register({ ...form, role: selectedRole });
        toast.success('Account created successfully! 🎉');
        navigate(`/${data.user.role}/dashboard`);
      }
    } catch (err) {
      console.error('Auth error:', err.response?.data);
      const errorMsg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Something went wrong';
      toast.error(errorMsg);
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">🏥</div>
          <h1 className="auth-brand">MediCare Pro</h1>
          <p className="auth-tagline">India's Most Trusted Hospital Management & Telemedicine Platform</p>
          <div className="auth-features">
            {['📅 Easy Appointment Booking','🎥 HD Video Consultations','💊 Digital Prescriptions','💳 Secure Payments','📊 Health Analytics'].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
          <div className="auth-stats">
            {[['50K+','Patients'],['2K+','Doctors'],['1L+','Consultations']].map(([n,l]) => (
              <div key={l} className="auth-stat"><span className="auth-stat-num">{n}</span><span className="auth-stat-label">{l}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-toggle">
            {['Login','Register'].map((t,i) => (
              <button 
                key={t} 
                className={`auth-toggle-btn ${isLogin === (i===0) ? 'active' : ''}`}
                onClick={() => setIsLogin(i===0)}
              >
                {t}
              </button>
            ))}
          </div>

          {!isLogin && (
            <div className="auth-role-grid">
              {ROLES.map(r => (
                <div 
                  key={r.id}
                  className={`auth-role-card ${selectedRole === r.id ? 'active' : ''}`}
                  onClick={() => { setSelectedRole(r.id); setForm({...form, role: r.id}); }}
                >
                  <div className="auth-role-icon">{r.icon}</div>
                  <div className="auth-role-label">{r.label}</div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <input 
                className="auth-input" 
                placeholder="Full Name" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            )}
            <input 
              className="auth-input" 
              type="email" 
              placeholder="Email Address" 
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} 
              required 
            />
            <input 
              className="auth-input" 
              type="password" 
              placeholder="Password" 
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} 
              required 
            />
            {!isLogin && (
              <>
                <input 
                  className="auth-input" 
                  placeholder="Phone Number" 
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} 
                />
                <select 
                  className="auth-input" 
                  value={form.gender} 
                  onChange={e => setForm({...form, gender: e.target.value})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </>
            )}
            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? '⏳ Please wait...' : (isLogin ? '→ Sign In' : '→ Create Account')}
            </button>
          </form>

          {isLogin && (
            <div className="auth-demo-accounts">
              <p className="auth-demo-title">Demo Accounts:</p>
              {[['patient@demo.com','Patient'],['doctor@demo.com','Doctor'],['admin@demo.com','Admin']].map(([e,r]) => (
                <button 
                  key={e} 
                  className="auth-demo-btn"
                  onClick={() => setForm({...form, email: e, password: 'demo123'})}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
