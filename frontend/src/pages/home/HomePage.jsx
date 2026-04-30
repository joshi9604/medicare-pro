import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Video,
  FileText,
  CreditCard,
  Shield,
  Users,
  Stethoscope,
  Building2,
  CheckCircle2,
  HeartPulse,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import './HomePage.css';

const fallbackStats = {
  totalPatients: 50000,
  totalDoctors: 2000
};

const formatStat = (value) => {
  const number = Number(value || 0);

  if (number >= 100000) {
    return `${Math.floor(number / 100000)}L+`;
  }

  if (number >= 1000) {
    return `${Math.floor(number / 1000)}K+`;
  }

  return number.toLocaleString('en-IN');
};

export default function HomePage() {
  const [stats, setStats] = useState(fallbackStats);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    let isMounted = true;

    axios.get('/api/public/stats')
      .then((response) => {
        if (!isMounted) return;

        setStats({
          totalPatients: response.data?.stats?.totalPatients ?? fallbackStats.totalPatients,
          totalDoctors: response.data?.stats?.totalDoctors ?? fallbackStats.totalDoctors
        });
      })
      .catch(() => {
        if (isMounted) setStats(fallbackStats);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="home">
      <header className="home-header">
        <div className="home-brand">
          <div className="home-logo" aria-hidden>
            <Building2 size={22} />
          </div>
          <div className="home-brand-text">
            <div className="home-title">MediCare Pro</div>
            <div className="home-subtitle">Hospital Management + Telemedicine</div>
          </div>
        </div>

        <div className="home-header-right">
          <button
            className="home-mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav className="home-nav" aria-label="Primary">
            <a className="home-nav-link" href="#home">Home</a>
            <a className="home-nav-link" href="#features">Features</a>
            <a className="home-nav-link" href="#services">Services</a>
            <a className="home-nav-link" href="#help">Help</a>
            <div className="home-nav-dropdown">
              <button className="home-nav-link home-nav-dropdown-btn" type="button">
                Tools <ChevronDown size={14} />
              </button>
              <div className="home-nav-menu">
                <Link className="home-nav-menu-link" to="/bmi">BMI Calculator</Link>
                <Link className="home-nav-menu-link" to="/bmr">BMR Calculator</Link>
                <Link className="home-nav-menu-link" to="/water-intake">Water Intake Calculator</Link>
                <Link className="home-nav-menu-link" to="/blood-pressure-guide">Blood Pressure Checker Guide</Link>
                <Link className="home-nav-menu-link" to="/sugar-level-guide">Sugar Level Checker Guide</Link>
              </div>
            </div>
            <a className="home-nav-link" href="#faq">FAQ</a>
          </nav>

          {/* <nav className="home-actions" aria-label="Authentication">
            <Link className="home-btn home-btn-ghost" to="/auth?mode=login">
              Sign In
            </Link>
            <Link className="home-btn home-btn-primary" to="/auth?mode=register">
              Sign Up
            </Link>
          </nav> */}
        </div>

        <nav className={`home-mobile-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile primary">
          <a className="home-mobile-nav-link" href="#home" onClick={closeMobileMenu}>Home</a>
          <a className="home-mobile-nav-link" href="#features" onClick={closeMobileMenu}>Features</a>
          <a className="home-mobile-nav-link" href="#services" onClick={closeMobileMenu}>Services</a>
          <a className="home-mobile-nav-link" href="#help" onClick={closeMobileMenu}>Help</a>
          <div className="home-mobile-nav-group">
            <div className="home-mobile-nav-title">Tools</div>
            <Link className="home-mobile-nav-link" to="/bmi" onClick={closeMobileMenu}>BMI Calculator</Link>
            <Link className="home-mobile-nav-link" to="/bmr" onClick={closeMobileMenu}>BMR Calculator</Link>
            <Link className="home-mobile-nav-link" to="/water-intake" onClick={closeMobileMenu}>Water Intake Calculator</Link>
            <Link className="home-mobile-nav-link" to="/blood-pressure-guide" onClick={closeMobileMenu}>Blood Pressure Checker Guide</Link>
            <Link className="home-mobile-nav-link" to="/sugar-level-guide" onClick={closeMobileMenu}>Sugar Level Checker Guide</Link>
          </div>
          <a className="home-mobile-nav-link" href="#faq" onClick={closeMobileMenu}>FAQ</a>
        </nav>
      </header>

      <main className="home-main">
        <section id="home" className="home-hero" aria-label="Hero">
          <div className="home-hero-left">
            <div className="home-badge">
              <Shield size={16} />
              <span>Secure • Fast • Reliable</span>
            </div>

            <h1 className="home-h1">
              Healthcare, simplified for patients, doctors, and admins.
            </h1>

            <p className="home-lead">
              Book appointments, consult via video, manage prescriptions, and track records—
              all in one professional platform.
            </p>

            <div className="home-cta">
              <Link className="home-btn home-btn-primary home-btn-lg" to="/auth?mode=register">
                Get Started <ChevronRight size={16} />
              </Link>
              <Link className="home-btn home-btn-ghost home-btn-lg" to="/auth?mode=login">
                Sign In
              </Link>
            </div>

            <div className="home-trust">
              <div className="home-trust-item">
                <Link className="home-trust-link" to="/stats/patients">
                  <div className="home-trust-num">{formatStat(stats.totalPatients)}</div>
                  <div className="home-trust-label">Patients</div>
                </Link>
              </div>
              <div className="home-trust-item">
                <Link className="home-trust-link" to="/stats/doctors">
                  <div className="home-trust-num">{formatStat(stats.totalDoctors)}</div>
                  <div className="home-trust-label">Doctors</div>
                </Link>
              </div>
              {/* <div className="home-trust-item">
                <div className="home-trust-num">1L+</div>
                <div className="home-trust-label">Consultations</div>
              </div> */}
            </div>
          </div>

          <div className="home-hero-right" aria-hidden>
            <div className="home-card">
              <div className="home-card-header">
                <div className="home-card-title">Today</div>
                <div className="home-chip">Live</div>
              </div>

              <div className="home-card-grid">
                <div className="home-mini">
                  <CalendarDays size={18} />
                  <div>
                    <div className="home-mini-title">Appointments</div>
                    <div className="home-mini-sub">Quick booking</div>
                  </div>
                </div>

                <div className="home-mini">
                  <Video size={18} />
                  <div>
                    <div className="home-mini-title">Consultations</div>
                    <div className="home-mini-sub">HD video call</div>
                  </div>
                </div>

                <div className="home-mini">
                  <FileText size={18} />
                  <div>
                    <div className="home-mini-title">Prescriptions</div>
                    <div className="home-mini-sub">Digital & shareable</div>
                  </div>
                </div>

                <div className="home-mini">
                  <CreditCard size={18} />
                  <div>
                    <div className="home-mini-title">Payments</div>
                    <div className="home-mini-sub">Secure checkout</div>
                  </div>
                </div>
              </div>

              <div className="home-card-footer">
                <div className="home-pill">
                  <Stethoscope size={16} />
                  <span>Doctor-ready workflows</span>
                </div>
              </div>
            </div>
            <div className="home-glow" />
          </div>
        </section>

        <section id="features" className="home-section" aria-label="Features">
          <div className="home-section-head">
            <div className="home-kicker">All-in-one platform</div>
            <h2 className="home-h2">Everything you need to run care smoothly.</h2>
            <p className="home-p">
              Built for real hospital workflows—fast booking, secure records, doctor tools, and admin control.
            </p>
          </div>

          <div className="home-feature-grid">
            {[
              { icon: CalendarDays, title: 'Appointments', desc: 'Book, manage, and track appointments with status & reminders.' },
              { icon: Video, title: 'Video consultations', desc: 'Telemedicine-ready experience for patients and doctors.' },
              { icon: FileText, title: 'Prescriptions & records', desc: 'Digital prescriptions and medical record management.' },
              { icon: CreditCard, title: 'Payments', desc: 'Secure payments with transaction history and receipts.' },
              { icon: Users, title: 'Role-based access', desc: 'Patient, doctor, and admin experiences with clean separation.' },
              { icon: Shield, title: 'Security', desc: 'Authentication and protection for sensitive health data.' },
            ].map((f) => (
              <div key={f.title} className="home-feature">
                <div className="home-feature-icon" aria-hidden>
                  {React.createElement(f.icon, { size: 18 })}
                </div>
                <div className="home-feature-title">{f.title}</div>
                <div className="home-feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="home-section" aria-label="Services">
          <div className="home-section-head">
            <div className="home-kicker">Role-based experience</div>
            <h2 className="home-h2">Designed for every user in your hospital.</h2>
            <p className="home-p">Each role gets the right tools—no clutter, just speed.</p>
          </div>

          <div className="home-role-grid">
            <div className="home-role">
              <img
                src="https://img.freepik.com/free-photo/young-man-using-mobile-phone-hospital_23-2148983137.jpg"
                alt="Patient"
                className="home-role-img"
              />
              <div className="home-role-top">
                <div className="home-role-badge">Patient</div>
                <Users size={18} />
              </div>
              <div className="home-role-title">Book care in minutes</div>
              <ul className="home-role-list">
                {['Find doctors', 'Book appointments', 'View prescriptions', 'Medical records & payments'].map((t) => (
                  <li key={t}>
                    <CheckCircle2 size={16} /> {t}
                  </li>
                ))}
              </ul>
              <Link className="home-btn home-btn-primary home-btn-wide home-role-btn" to="/auth?mode=register">
                Join as Patient
              </Link>
            </div>

            <div className="home-role home-role-highlight">
              <img
                src="https://img.freepik.com/free-photo/doctor-with-stethoscope-hands-hospital-background_1423-1.jpg"
                alt="Doctor"
                className="home-role-img"
              />
              <div className="home-role-top">
                <div className="home-role-badge">Doctor</div>
                <Stethoscope size={18} />
              </div>
              <div className="home-role-title">Work smarter, not harder</div>
              <ul className="home-role-list">
                {['Appointments schedule', 'Patient management', 'Prescriptions', 'Consultation workflow'].map((t) => (
                  <li key={t}>
                    <CheckCircle2 size={16} /> {t}
                  </li>
                ))}
              </ul>
              <Link className="home-btn home-btn-primary home-btn-wide home-role-btn" to="/auth?mode=register">
                Join as Doctor
              </Link>
            </div>

            <div className="home-role">
              <img
                src="https://img.freepik.com/free-photo/businessman-working-laptop-office_1303-19466.jpg"
                alt="Admin"
                className="home-role-img"
              />
              <div className="home-role-top">
                <div className="home-role-badge">Admin</div>
                <Building2 size={18} />
              </div>
              <div className="home-role-title">Control everything</div>
              <ul className="home-role-list">
                {['User & doctor management', 'Appointments overview', 'System dashboards', 'Operational visibility'].map((t) => (
                  <li key={t}>
                    <CheckCircle2 size={16} /> {t}
                  </li>
                ))}
              </ul>
              <Link className="home-btn home-btn-primary home-btn-wide home-role-btn" to="/auth?mode=register">
                Join as Admin
              </Link>
            </div>
          </div>
        </section>

        <section id="help" className="home-section" aria-label="Help">
          <div className="home-section-head">
            <div className="home-kicker">Simple onboarding</div>
            <h2 className="home-h2">Start in 3 steps.</h2>
            <p className="home-p">A clean flow so users don’t get confused.</p>
          </div>

          <div className="home-steps">
            {[
              { n: '01', title: 'Create account', desc: 'Choose role and register in seconds.' },
              { n: '02', title: 'Setup & explore', desc: 'Access your dashboard and tools.' },
              { n: '03', title: 'Book & manage', desc: 'Appointments, records, and payments—done.' },
            ].map((s) => (
              <div key={s.n} className="home-step">
                <div className="home-step-n">{s.n}</div>
                <div className="home-step-title">{s.title}</div>
                <div className="home-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="home-section" aria-label="Reviews">
          <div className="home-section-head">
            <div className="home-kicker">Loved by teams</div>
            <h2 className="home-h2">Professional feel, real results.</h2>
            <p className="home-p">A modern experience for hospitals and clinics.</p>
          </div>

          <div className="home-testimonials">
            {[
              { who: 'Clinic Admin', quote: 'Appointments and users are finally organized. The dashboard feels premium and fast.' },
              { who: 'Doctor', quote: 'Prescriptions + appointments in one place saves me time every day.' },
              { who: 'Patient', quote: 'Booking and payments are simple. I can see my records anytime.' },
            ].map((t) => (
              <div key={t.who} className="home-quote">
                <div className="home-quote-icon" aria-hidden>
                  <HeartPulse size={18} />
                </div>
                <div className="home-quote-text">“{t.quote}”</div>
                <div className="home-quote-who">— {t.who}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="home-section" aria-label="FAQ">
          <div className="home-section-head">
            <div className="home-kicker">FAQ</div>
            <h2 className="home-h2">Questions? We’ve got answers.</h2>
            <p className="home-p">Quick clarity for new users.</p>
          </div>

          <div className="home-faq">
            {[
              { q: 'Is this secure?', a: 'Yes. The app uses authentication and role-based access to protect sensitive data.' },
              { q: 'Can I register as a doctor or admin?', a: 'Yes. On Sign Up, select your role (Patient / Doctor / Admin).' },
              { q: 'Does it support payments?', a: 'Yes. Payments and history are available inside the dashboard.' },
            ].map((x) => (
              <details key={x.q} className="home-faq-item">
                <summary className="home-faq-q">
                  <HelpCircle size={18} />
                  <span>{x.q}</span>
                </summary>
                <div className="home-faq-a">{x.a}</div>
              </details>
            ))}
          </div>
        </section>

        <section className="home-final" aria-label="Final CTA">
          <div className="home-final-card">
            <div className="home-final-left">
              <div className="home-final-title">Ready to use MediCare Pro?</div>
              <div className="home-final-sub">
                Create your account and start managing care smoothly today.
              </div>
            </div>

            <div className="home-final-actions">
              <Link className="home-btn home-btn-primary home-btn-lg" to="/auth?mode=register">
                Sign Up
              </Link>
              <Link className="home-btn home-btn-ghost home-btn-lg" to="/auth?mode=login">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <div className="footer-logo" aria-hidden>
                <Building2 size={18} />
              </div>
              <div>
                <div className="footer-title">MediCare Pro</div>
                <div className="footer-sub">Smart healthcare platform</div>
              </div>
            </div>
            <p className="footer-desc">
              A modern hospital management and telemedicine platform for patients, doctors, and admins.
            </p>
          </div>

          <div className="footer-col">
            <h4>Product</h4>
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#services">Services</a>
            <a href="#help">Help</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-col">
            <h4>Access</h4>
            <Link to="/auth?mode=login">Sign In</Link>
            <Link to="/auth?mode=register">Sign Up</Link>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <a href="#faq">Help Center</a>
            <a href="#features">Platform</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} MediCare Pro • All rights reserved</span>
        </div>
      </footer>
    </div>
  );
}
