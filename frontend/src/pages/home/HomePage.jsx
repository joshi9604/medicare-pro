import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Bell,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Menu,
  Shield,
  ShieldCheck,
  Stethoscope,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react';
import './HomePage.css';

const brand = {
  name: 'MediCare Pro',
  subtitle: 'Hospital Management + Telemedicine',
};

const fallbackStats = {
  totalPatients: 50000,
  totalDoctors: 500,
};

const formatStat = (value) => {
  const number = Number(value || 0);

  if (number >= 100000) return `${Math.floor(number / 100000)}L+`;
  if (number >= 1000) return `${Math.floor(number / 1000)}K+`;

  return number.toLocaleString('en-IN');
};

const navLinks = [
  { label: 'Home', href: '#home', active: true },
  { label: 'Features', href: '#features' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Help', href: '#help' },
];

const resourceLinks = [
  { label: 'BMI Calculator', to: '/bmi' },
  { label: 'BMR Calculator', to: '/bmr' },
  { label: 'Water Intake Calculator', to: '/water-intake' },
  { label: 'Blood Pressure Guide', to: '/blood-pressure-guide' },
  { label: 'Sugar Level Guide', to: '/sugar-level-guide' },
];

const authLinks = [
  { label: 'Login', to: '/auth?mode=login', className: 'home-btn home-btn-ghost' },
  { label: 'Get Started', to: '/auth?mode=register', className: 'home-btn home-btn-primary' },
];

const heroContent = {
  badge: 'Secure + Fast + Reliable',
  title: 'Healthcare, simplified for',
  highlight: 'everyone.',
  lead: 'Book appointments, consult via video, manage prescriptions, and track records all in one professional platform.',
  cta: { label: 'Get Started Free', to: '/auth?mode=register' },
};

const heroStats = [
  { label: 'Patients', key: 'totalPatients', to: '/stats/patients', icon: Users },
  { label: 'Doctors', key: 'totalDoctors', to: '/stats/doctors', icon: Stethoscope },
];

const securityBadges = [
  { label: 'HIPAA Compliant', icon: Lock },
  { label: 'End-to-End Encryption' },
  { label: 'Secure Data' },
];

const features = [
  {
    icon: CalendarDays,
    title: 'Appointments',
    desc: 'Book, manage, and track appointments with status and reminders.',
  },
  {
    icon: Video,
    title: 'Video Consultations',
    desc: 'Telemedicine-ready experience for patients and doctors.',
  },
  {
    icon: FileText,
    title: 'Prescriptions & Records',
    desc: 'Digital prescriptions and medical record management.',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'Secure payments with transaction history and receipts.',
  },
  {
    icon: Users,
    title: 'Role-based Access',
    desc: 'Patient, doctor, and admin experiences with clean separation.',
  },
  {
    icon: Shield,
    title: 'Security',
    desc: 'Authentication and protection for sensitive health data.',
  },
];

const dashboardSidebarItems = [
  'Dashboard',
  'Appointments',
  'Consultations',
  'Prescriptions',
  'Patients',
  'Doctors',
  'Payments',
  'Reports',
  'Settings',
];

const dashboardMetrics = [
  { label: 'Total Appointments', value: '1,256', change: '+12% from last month' },
  { label: 'Consultations', value: '842', change: '+8% from last month' },
  { label: 'Total Patients', statKey: 'totalPatients', change: '+15% from last month' },
  { label: 'Total Doctors', statKey: 'totalDoctors', change: '+10% from last month' },
];

const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const todaysSchedule = [
  { time: '09:00 AM', name: 'John Doe', type: 'Consultation' },
  { time: '10:30 AM', name: 'Emily Smith', type: 'Follow-up' },
  { time: '12:00 PM', name: 'Michael Brown', type: 'Video Call' },
];

const roleCards = [
  {
    role: 'Patient',
    icon: Users,
    title: 'Book care in minutes',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80',
    items: ['Find doctors', 'Book appointments', 'View prescriptions', 'Medical records & payments'],
    tone: 'blue',
    cta: 'Join as Patient',
  },
  {
    role: 'Doctor',
    icon: Stethoscope,
    title: 'Work smarter, not harder',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80',
    items: ['Appointments schedule', 'Patient management', 'Prescriptions', 'Consultation workflow'],
    tone: 'teal',
    cta: 'Join as Doctor',
  },
  // {
  //   role: 'Admin',
  //   icon: Building2,
  //   title: 'Control everything',
  //   image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
  //   items: ['User & doctor management', 'Appointments overview', 'System dashboards', 'Operational visibility'],
  //   tone: 'violet',
  //   cta: 'Join as Admin',
  // },
];

const steps = [
  { icon: UserPlus, n: '01', title: 'Create account', desc: 'Choose role and register in seconds.' },
  { icon: LayoutDashboard, n: '02', title: 'Setup & explore', desc: 'Access your dashboard and tools.' },
  { icon: CalendarCheck, n: '03', title: 'Book & manage', desc: 'Appointments, records, and payments done.' },
];

const trustedBrands = ['Fortis', 'MAX Healthcare', 'Apollo Hospitals', 'Manipal Hospitals', 'Medanta'];

const testimonials = [
  {
    who: 'Dr. Rajesh Kumar',
    org: 'Apollo Hospitals',
    quote: 'MediCare Pro has completely transformed how we manage appointments and patient records.',
  },
  {
    who: 'Dr. Priya Sharma',
    org: 'Fortis Healthcare',
    quote: 'The platform is intuitive, fast, and incredibly helpful for both doctors and patients.',
  },
  // {
  //   who: 'Admin User',
  //   org: 'Max Healthcare',
  //   quote: 'Everything is in one place: consultations, prescriptions, payments. Highly recommended.',
  // },
];

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Services', href: '#services' },
      { label: 'Integrations', href: '#help' },
      { label: 'Updates', href: '#home' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#home' },
      { label: 'Careers', href: '#services' },
      { label: 'Blog', href: '#features' },
      { label: 'Contact Us', to: '/auth?mode=login' },
      { label: 'Press', href: '#home' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#help' },
      { label: 'Documentation', href: '#features' },
      { label: 'Guides', to: '/bmi' },
      { label: 'API', to: '/bmr' },
      { label: 'Status', href: '#home' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#home' },
      { label: 'Terms of Service', href: '#home' },
      { label: 'Security', href: '#home' },
      { label: 'Compliance', href: '#home' },
    ],
  },
];

const AppLink = ({ link, className, children, onClick }) => {
  if (link.to) {
    return (
      <Link className={className} to={link.to} onClick={onClick}>
        {children || link.label}
      </Link>
    );
  }

  return (
    <a className={className} href={link.href} onClick={onClick}>
      {children || link.label}
    </a>
  );
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
          totalDoctors: response.data?.stats?.totalDoctors ?? fallbackStats.totalDoctors,
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
        <Link className="home-brand home-brand-link" to="/">
          <div className="home-logo" aria-hidden>
            <Building2 size={22} />
          </div>
          <div className="home-brand-text">
            <div className="home-title">{brand.name}</div>
            <div className="home-subtitle">{brand.subtitle}</div>
          </div>
        </Link>

        <div className="home-header-right">
          <nav className="home-nav" aria-label="Primary">
            {navLinks.filter((link) => link.label !== 'Help').map((link) => (
              <AppLink
                key={link.label}
                link={link}
                className={`home-nav-link ${link.active ? 'active' : ''}`}
              />
            ))}
            <div className="home-nav-dropdown">
              <button className="home-nav-link home-nav-dropdown-btn" type="button">
                Resources <ChevronDown size={14} />
              </button>
              <div className="home-nav-menu">
                {resourceLinks.map((link) => (
                  <AppLink key={link.label} link={link} className="home-nav-menu-link" />
                ))}
              </div>
            </div>
            <AppLink link={navLinks.find((link) => link.label === 'Help')} className="home-nav-link" />
          </nav>

          <nav className="home-actions" aria-label="Authentication">
            {authLinks.map((link) => (
              <AppLink key={link.label} link={link} className={link.className} />
            ))}
          </nav>

          <button
            className="home-mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <nav className={`home-mobile-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Mobile primary">
          {[...navLinks, ...resourceLinks, ...authLinks].map((link) => (
            <AppLink
              key={link.label}
              link={link}
              className={`home-mobile-nav-link ${link.label === 'Get Started' ? 'strong' : ''}`}
              onClick={closeMobileMenu}
            />
          ))}
        </nav>
      </header>

      <main className="home-main">
        <section id="home" className="home-hero" aria-label="Hero">
          <div className="home-hero-left">
            <div className="home-badge">
              <ShieldCheck size={16} />
              <span>{heroContent.badge}</span>
            </div>

            <h1 className="home-h1">
              {heroContent.title} <span>{heroContent.highlight}</span>
            </h1>

            <p className="home-lead">
              {heroContent.lead}
            </p>

            <div className="home-cta">
              <AppLink link={heroContent.cta} className="home-btn home-btn-primary home-btn-lg">
                {heroContent.cta.label} <ChevronRight size={16} />
              </AppLink>
            </div>

            <div className="home-stats-row">
              {heroStats.map((item) => (
                <Link key={item.label} className="home-stat-box" to={item.to}>
                  {React.createElement(item.icon, { size: 22 })}
                  <div>
                    <div className="home-stat-num">{formatStat(stats[item.key])}</div>
                    <div className="home-stat-label">{item.label}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="home-security-row">
              {securityBadges.map((badge) => (
                <span key={badge.label}>
                  {badge.icon && React.createElement(badge.icon, { size: 14 })}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          <div className="home-hero-right" aria-hidden>
            <div className="home-dashboard-shell">
              <div className="home-dashboard-sidebar">
                <div className="home-sidebar-logo"><HeartPulse size={18} /></div>
                {dashboardSidebarItems.map((item, index) => (
                  <div key={item} className={`home-sidebar-item ${index === 0 ? 'selected' : ''}`}>
                    <span />
                    {item}
                  </div>
                ))}
              </div>

              <div className="home-dashboard-main">
                <div className="home-dashboard-top">
                  <h3>Dashboard</h3>
                  <div className="home-profile">
                    <Bell size={16} />
                    <div className="home-avatar" />
                    <div>
                      <strong>Dr. Sarah Wilson</strong>
                      <span>Admin</span>
                    </div>
                  </div>
                </div>

                <div className="home-metric-grid">
                  {dashboardMetrics.map((metric) => (
                    <div className="home-metric" key={metric.label}>
                      <span>{metric.label}</span>
                      <strong>{metric.statKey ? formatStat(stats[metric.statKey]) : metric.value}</strong>
                      <small>{metric.change}</small>
                    </div>
                  ))}
                </div>

                <div className="home-chart-row">
                  <div className="home-chart-card">
                    <div className="home-chart-title">Appointments Overview</div>
                    <div className="home-chart">
                      <svg viewBox="0 0 420 180" role="img" aria-label="appointments chart">
                        <defs>
                          <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#2f7df6" stopOpacity="0.32" />
                            <stop offset="100%" stopColor="#2f7df6" stopOpacity="0.03" />
                          </linearGradient>
                        </defs>
                        <path className="home-chart-fill" d="M0 145 C38 124 45 70 86 95 C125 118 135 42 185 68 C235 95 232 14 285 45 C327 70 324 96 365 76 C392 63 398 43 420 36 L420 180 L0 180 Z" />
                        <path className="home-chart-line" d="M0 145 C38 124 45 70 86 95 C125 118 135 42 185 68 C235 95 232 14 285 45 C327 70 324 96 365 76 C392 63 398 43 420 36" />
                      </svg>
                      <div className="home-chart-days">
                        {chartDays.map((day) => <span key={day}>{day}</span>)}
                      </div>
                      <div className="home-chart-pill">+12%</div>
                    </div>
                  </div>

                  <div className="home-schedule-card">
                    <div className="home-chart-title">Today&apos;s Schedule</div>
                    {todaysSchedule.map((item) => (
                      <div className="home-schedule-item" key={`${item.time}-${item.name}`}>
                        <span>{item.time}</span>
                        <strong>{item.name}</strong>
                        <small>{item.type}</small>
                      </div>
                    ))}
                    <button className="home-view-btn" type="button">View all appointments</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="home-section" aria-label="Features">
          <div className="home-section-head">
            <div className="home-kicker">All-in-one platform</div>
            <h2 className="home-h2">Everything you need to run care smoothly.</h2>
            <p className="home-p">
              Built for real hospital workflows: fast booking, secure records, doctor tools, and admin control.
            </p>
          </div>

          <div className="home-feature-grid">
            {features.map((feature) => (
              <div key={feature.title} className="home-feature">
                <div className="home-feature-icon" aria-hidden>
                  {React.createElement(feature.icon, { size: 24 })}
                </div>
                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                  <a href="#help">Learn more <ChevronRight size={14} /></a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="services" className="home-section" aria-label="Services">
          <div className="home-section-head">
            <div className="home-kicker">Role-based experience</div>
            <h2 className="home-h2">Designed for every user in your hospital.</h2>
            <p className="home-p">Each role gets the right tools: no clutter, just speed.</p>
          </div>

          <div className="home-role-grid">
            {roleCards.map((card) => (
              <div key={card.role} className={`home-role home-role-${card.tone}`}>
                <div className="home-role-media">
                  <img src={card.image} alt={card.role} />
                  <div className="home-role-badge">
                    {React.createElement(card.icon, { size: 15 })} {card.role}
                  </div>
                </div>
                <h3>{card.title}</h3>
                <ul>
                  {card.items.map((item) => (
                    <li key={item}><CheckCircle2 size={15} /> {item}</li>
                  ))}
                </ul>
                <Link className="home-role-btn" to="/auth?mode=register">{card.cta}</Link>
              </div>
            ))}
          </div>
        </section>

        <section id="help" className="home-section home-step-section" aria-label="Help">
          <div className="home-section-head">
            <div className="home-kicker">Simple onboarding</div>
            <h2 className="home-h2">Start in 3 simple steps.</h2>
            <p className="home-p">A clean flow so users do not get confused.</p>
          </div>

          <div className="home-steps">
            {steps.map((step) => (
              <div key={step.n} className="home-step">
                <div className="home-step-icon">{React.createElement(step.icon, { size: 34 })}</div>
                <div>
                  <span>{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="home-logo-strip" aria-label="Trusted hospitals">
          <p>Trusted by 500+ hospitals worldwide</p>
          <div className="home-logo-row">
            {trustedBrands.map((name) => (
              <span key={name}>{name}</span>
            ))}
            <a href="#features">More <ChevronRight size={15} /></a>
          </div>
        </section>

        <section className="home-section" aria-label="Reviews">
          <div className="home-testimonials">
            {testimonials.map((item) => (
              <div key={item.who} className="home-quote">
                <div className="home-quote-icon">&quot;</div>
                <p>{item.quote}</p>
                <div className="home-stars">★★★★★</div>
                <strong>{item.who}</strong>
                <span>{item.org}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="home-final" aria-label="Final CTA">
          <div className="home-final-card">
            <div className="home-final-icon"><Building2 size={36} /></div>
            <div>
              <h2>Ready to simplify your hospital management?</h2>
              <p>Join thousands of healthcare professionals using MediCare Pro.</p>
            </div>
            <div className="home-final-actions">
              <Link className="home-btn home-btn-light" to="/auth?mode=register">Get Started Free</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <div className="footer-logo" aria-hidden><Building2 size={20} /></div>
              <div>
                <div className="footer-title">{brand.name}</div>
                <div className="footer-sub">{brand.subtitle}</div>
              </div>
            </div>
            <p className="footer-desc">
              A modern medical management and telemedicine platform for patients, doctors, and admins.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div className="footer-col" key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <AppLink key={link.label} link={link} />
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <span><ShieldCheck size={14} /> Secure + HIPAA Compliant</span>
        </div>
      </footer>
    </div>
  );
}
