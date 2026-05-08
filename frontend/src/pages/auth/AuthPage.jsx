import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  HeartPulse,
  Lock,
  Mail,
  Phone,
  Stethoscope,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AuthPage.css';

const ROLES = [
  { id: 'patient', label: 'Patient', icon: User },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope },
];

const initialLoginForm = {
  email: '',
  password: '',
};

const initialRegisterForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  role: 'patient',
};

const initialResetForm = {
  email: '',
  otp: '',
  password: '',
  confirmPassword: '',
};

function Field({
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  children,
  inputMode,
  maxLength,
  minLength,
  pattern,
  title,
}) {
  return (
    <label className="auth-field">
      {Icon && <Icon className="auth-field-icon" size={22} />}
      {children || (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          inputMode={inputMode}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          title={title}
        />
      )}
    </label>
  );
}

const isGmailAddress = (email) =>
  String(email || '').trim().toLowerCase().endsWith('@gmail.com');

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const onlyLettersAndSpaces = (value) =>
  String(value || '').replace(/[^a-zA-Z\s]/g, '').replace(/\s{2,}/g, ' ');

export default function AuthPage() {
  const [activeMode, setActiveMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loginForm, setLoginForm] = useState(initialLoginForm);
  const [registerForm, setRegisterForm] = useState(initialRegisterForm);
  const [resetForm, setResetForm] = useState(initialResetForm);

  const { login, register, verifyEmail, resendOtp, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const mode = (searchParams.get('mode') || '').toLowerCase();
    if (mode === 'register' || mode === 'signup') setActiveMode('register');
    if (mode === 'login' || mode === 'signin') setActiveMode('login');
  }, [searchParams]);

  const openMode = (mode) => {
    setActiveMode(mode);
    setVerificationEmail('');
    setOtp('');

    // Keep UI state in sync with URL so router shows login/register mode.
    // Example URLs:
    // - /auth?mode=login
    // - /auth?mode=register
    if (mode === 'login' || mode === 'register' || mode === 'forgot') {
      setSearchParams({ mode }, { replace: true });
    }

    if (mode === 'register') setAgreeTerms(false);

    if (mode === 'forgot') {
      setResetForm({ ...initialResetForm, email: loginForm.email });
      setResetOtpSent(false);
      setShowResetPassword(false);
    }
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await login(loginForm.email, loginForm.password);

      if (data.requiresVerification) {
        setVerificationEmail(data.email || loginForm.email);
        setOtp('');
        toast[data.emailDeliveryFailed ? 'error' : 'success'](
          data.message || (data.emailDeliveryFailed ? 'OTP email could not be sent' : 'OTP sent to your email')
        );
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      if (err.response?.data?.requiresVerification && err.response?.status !== 500) {
        setVerificationEmail(err.response.data.email || loginForm.email);
        setOtp('');
      }

      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();

    const cleanName = registerForm.name.trim();

    if (!/^[A-Za-z\s]{3,}$/.test(cleanName)) {
      toast.error('Name must contain only letters and at least 3 characters');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please accept Terms & Conditions and Privacy Policy');
      return;
    }

    if (!isGmailAddress(registerForm.email)) {
      toast.error('Email must be a Gmail address ending with @gmail.com');
      return;
    }

    if (!/^\d{10}$/.test(registerForm.phone)) {
      toast.error('Contact number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      const data = await register({
        ...registerForm,
        name: cleanName,
        role: selectedRole,
      });

      setVerificationEmail(data.email || registerForm.email);
      setOtp('');

      toast[data.emailDeliveryFailed ? 'error' : 'success'](
        data.message || (data.emailDeliveryFailed ? 'OTP email could not be sent' : 'OTP sent to your email')
      );
    } catch (err) {
      if (err.response?.data?.requiresVerification && err.response?.status !== 500) {
        setVerificationEmail(err.response.data.email || registerForm.email);
        setOtp('');
      }

      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await verifyEmail(verificationEmail, otp);
      toast.success('Email verified successfully!');
      navigate(`/${data.user.role}/dashboard`);
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Invalid OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!verificationEmail) return;
    setLoading(true);

    try {
      const data = await resendOtp(verificationEmail);
      setOtp('');

      toast[data.emailDeliveryFailed ? 'error' : 'success'](
        data.message || (data.emailDeliveryFailed ? 'OTP email could not be sent' : 'OTP sent again')
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await forgotPassword(resetForm.email);
      setResetOtpSent(true);
      setResetForm((form) => ({ ...form, otp: '', password: '', confirmPassword: '' }));

      toast[data.emailDeliveryFailed ? 'error' : 'success'](
        data.message || (data.emailDeliveryFailed ? 'Reset OTP email could not be sent' : 'Reset OTP sent to your email')
      );
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to send reset OTP'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (event) => {
    event.preventDefault();

    if (resetForm.password !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(resetForm.email, resetForm.otp, resetForm.password);
      toast.success(data.message || 'Password reset successfully');
      setLoginForm({ ...loginForm, email: resetForm.email, password: '' });
      setResetForm(initialResetForm);
      setResetOtpSent(false);
      setActiveMode('login');
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        'Failed to reset password'
      );
    } finally {
      setLoading(false);
    }
  };

  if (verificationEmail) {
    return (
      <div className="auth-page">
        <div className="auth-bg-dot auth-bg-dot-left" />
        <div className="auth-bg-dot auth-bg-dot-right" />

        <div className="auth-verify-card">
          <div className="auth-card-icon">
            <Mail size={38} />
          </div>

          <h1>Verify your email</h1>
          <p>Enter the 6-digit OTP sent to {verificationEmail}</p>

          <form onSubmit={handleVerifyOtp} className="auth-form">
            <Field
              icon={Lock}
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              inputMode="numeric"
              maxLength="6"
            />

            <button className="auth-submit-btn" type="submit" disabled={loading || otp.length !== 6}>
              {loading ? 'Please wait...' : 'Verify OTP'}
              <ArrowRight size={22} />
            </button>
          </form>

          <div className="auth-verify-actions">
            <button type="button" onClick={handleResendOtp} disabled={loading}>
              Resend OTP
            </button>
            <button type="button" onClick={() => setVerificationEmail('')} disabled={loading}>
              Change email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-dot auth-bg-dot-left" />
      <div className="auth-bg-dot auth-bg-dot-right" />
      <div className="auth-wave auth-wave-left" />
      <div className="auth-wave auth-wave-right" />

      <div className={`auth-shell auth-shell-${activeMode}`}>
        {activeMode === 'login' && (
          <section className="auth-card auth-login-card focused">
            <div className="auth-card-icon">
              <HeartPulse size={38} />
            </div>

            <div className="auth-card-head">
              <h1>Welcome Back</h1>
              <p>Sign in to continue to your account</p>
            </div>

            <div className="auth-toggle">
              <button className="auth-toggle-btn active" type="button" onClick={() => openMode('login')}>
                Login
              </button>
              <button className="auth-toggle-btn" type="button" onClick={() => openMode('register')}>
                Register
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <Field
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={loginForm.email}
                onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                required
              />

              <Field icon={Lock}>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  required
                />
                <button
                  className="auth-eye-btn"
                  type="button"
                  onClick={() => setShowLoginPassword((show) => !show)}
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  <Eye size={22} />
                </button>
              </Field>

              <div className="auth-form-row">
                <label className="auth-check">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>

                <button className="auth-text-btn" type="button" onClick={() => openMode('forgot')}>
                  Forgot password?
                </button>
              </div>

              <button className="auth-submit-btn" type="submit" disabled={loading}>
                {loading && activeMode === 'login' ? 'Please wait...' : 'Sign In'}
                <ArrowRight size={22} />
              </button>
            </form>

            <p className="auth-switch-copy">
              Don&apos;t have an account?{' '}
              <button type="button" onClick={() => openMode('register')}>
                Register
              </button>
            </p>
          </section>
        )}

        {activeMode === 'forgot' && (
          <section className="auth-card auth-login-card focused">
            <div className="auth-card-icon">
              <Lock size={38} />
            </div>

            <div className="auth-card-head">
              <h1>Reset Password</h1>
              <p>{resetOtpSent ? 'Enter the OTP and your new password' : 'Enter your email to receive a reset OTP'}</p>
            </div>

            <form onSubmit={resetOtpSent ? handleResetPasswordSubmit : handleForgotPasswordSubmit} className="auth-form">
              <Field
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={resetForm.email}
                onChange={(event) => setResetForm({ ...resetForm, email: event.target.value })}
                required
              />

              {resetOtpSent && (
                <>
                  <Field
                    icon={Lock}
                    placeholder="Reset OTP"
                    value={resetForm.otp}
                    onChange={(event) =>
                      setResetForm({ ...resetForm, otp: onlyDigits(event.target.value).slice(0, 6) })
                    }
                    required
                    inputMode="numeric"
                    maxLength="6"
                    pattern="\d{6}"
                    title="Enter the 6-digit reset OTP"
                  />

                  <Field icon={Lock}>
                    <input
                      type={showResetPassword ? 'text' : 'password'}
                      placeholder="New Password"
                      value={resetForm.password}
                      onChange={(event) => setResetForm({ ...resetForm, password: event.target.value })}
                      required
                      minLength="6"
                    />
                    <button
                      className="auth-eye-btn"
                      type="button"
                      onClick={() => setShowResetPassword((show) => !show)}
                      aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                    >
                      <Eye size={22} />
                    </button>
                  </Field>

                  <Field
                    icon={Lock}
                    type="password"
                    placeholder="Confirm Password"
                    value={resetForm.confirmPassword}
                    onChange={(event) => setResetForm({ ...resetForm, confirmPassword: event.target.value })}
                    required
                    minLength="6"
                  />
                </>
              )}

              <button
                className="auth-submit-btn"
                type="submit"
                disabled={loading || (resetOtpSent && resetForm.otp.length !== 6)}
              >
                {loading ? 'Please wait...' : resetOtpSent ? 'Reset Password' : 'Send Reset OTP'}
                <ArrowRight size={22} />
              </button>
            </form>

            {resetOtpSent && (
              <div className="auth-verify-actions">
                <button type="button" onClick={handleForgotPasswordSubmit} disabled={loading}>
                  Resend OTP
                </button>
              </div>
            )}

            <p className="auth-switch-copy">
              Remembered your password?{' '}
              <button type="button" onClick={() => openMode('login')}>
                Login
              </button>
            </p>
          </section>
        )}

        {activeMode === 'register' && (
          <section className="auth-card auth-register-card focused">
            <div className="auth-card-icon">
              <UserPlus size={38} />
            </div>

            <div className="auth-card-head">
              <h1>Create Account</h1>
              <p>Create an account to get started</p>
            </div>

            <div className="auth-toggle">
              <button className="auth-toggle-btn" type="button" onClick={() => openMode('login')}>
                Login
              </button>
              <button className="auth-toggle-btn active" type="button" onClick={() => openMode('register')}>
                Register
              </button>
            </div>

            <div className="auth-role-grid">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  className={`auth-role-card ${selectedRole === role.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role.id);
                    setRegisterForm({ ...registerForm, role: role.id });
                  }}
                >
                  {React.createElement(role.icon, { size: 24 })}
                  <span>{role.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <Field
                icon={User}
                placeholder="Full Name"
                value={registerForm.name}
                onChange={(event) => {
                  const value = onlyLettersAndSpaces(event.target.value);
                  setRegisterForm({ ...registerForm, name: value });
                }}
                required
                minLength="3"
                pattern="^[A-Za-z\s]{3,}$"
                title="Name must contain only letters and at least 3 characters"
              />

              <Field
                icon={Mail}
                type="email"
                placeholder="Email Address"
                value={registerForm.email}
                onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value.trimStart() })}
                required
                pattern="^[A-Za-z0-9._%+\-]+@gmail\.com$"
                title="Email must end with @gmail.com"
              />

              <Field icon={Lock}>
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                  required
                />
                <button
                  className="auth-eye-btn"
                  type="button"
                  onClick={() => setShowRegisterPassword((show) => !show)}
                  aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                >
                  <Eye size={22} />
                </button>
              </Field>

              <Field
                icon={Phone}
                placeholder="Phone Number"
                value={registerForm.phone}
                onChange={(event) =>
                  setRegisterForm({ ...registerForm, phone: onlyDigits(event.target.value).slice(0, 10) })
                }
                required
                inputMode="numeric"
                maxLength="10"
                pattern="\d{10}"
                title="Contact number must be exactly 10 digits"
              />

              <Field icon={User}>
                <select
                  value={registerForm.gender}
                  onChange={(event) => setRegisterForm({ ...registerForm, gender: event.target.value })}
                  required
                >
                  <option value="" disabled>
                    Gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <ChevronDown className="auth-select-icon" size={20} />
              </Field>

              <label className="auth-terms">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(event) => setAgreeTerms(event.target.checked)}
                />
                <span className="auth-checkmark">
                  {agreeTerms && <Check size={14} />}
                </span>
                <span>
                  I agree to the{' '}
                  <Link to="/terms">Terms & Conditions</Link> and{' '}
                  <Link to="/privacy">Privacy Policy</Link>
                </span>
              </label>

              <button className="auth-submit-btn" type="submit" disabled={loading || !agreeTerms}>
                {loading && activeMode === 'register' ? 'Please wait...' : 'Create Account'}
                <ArrowRight size={22} />
              </button>
            </form>

            <p className="auth-switch-copy">
              Already have an account?{' '}
              <button type="button" onClick={() => openMode('login')}>
                Login
              </button>
            </p>
          </section>
        )}
      </div>
    </div>
  );
}