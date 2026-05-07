import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Clock3,
  CreditCard,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Lock,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  Quote,
  Shield,
  ShieldCheck,
  Star,
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
  totalAppointments: 0,
  totalVideoConsults: 0,
  totalConsultations: 0,
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
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Roles', href: '#roles' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'FAQ', href: '#faq' },
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
  badge: 'Secure care operations in one place',
  title: 'A smarter way to manage healthcare — fast, connected, and effortless.',
  lead: 'All your healthcare operations, streamlined in one platform.',
  cta: { label: 'Get Started Free', to: '/auth?mode=register' },
  secondaryCta: { label: 'Explore Features', href: '#features' },
};

const heroStats = [
  { label: 'Patients', key: 'totalPatients', to: '/stats/patients', icon: Users },
  { label: 'Doctors', key: 'totalDoctors', to: '/stats/doctors', icon: Stethoscope },
  // { label: 'Secure uptime', value: 99, suffix: '%', icon: ShieldCheck },
];

const securityBadges = [
  { label: 'HIPAA-aware workflows', icon: Lock },
  { label: 'Encrypted records', icon: Shield },
  { label: 'Role-based access', icon: Users },
];

const features = [
  {
    icon: CalendarDays,
    title: 'Smart appointments',
    desc: 'Book, track, filter, and manage appointments with clear statuses and visit context.',
  },
  {
    icon: Video,
    title: 'Video consultations',
    desc: 'Telemedicine-ready visits with doctor workflows, call links, and patient access.',
  },
  {
    icon: FileText,
    title: 'Prescriptions & records',
    desc: 'Digital prescriptions and medical records stay connected to each patient journey.',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    desc: 'Payment visibility for patients, doctors, and admins with simple transaction history.',
  },
  {
    icon: Users,
    title: 'Role-based dashboards',
    desc: 'Patient, doctor, and admin experiences are focused around the work each role does.',
  },
  {
    icon: Shield,
    title: 'Security-first design',
    desc: 'Authentication, permissions, and clean data boundaries for sensitive healthcare work.',
  },
];

const platformStats = [
  { label: 'Appointments handled', key: 'totalAppointments', suffix: '+', icon: CalendarCheck },
  { label: 'Video consults', key: 'totalVideoConsults', suffix: '+', icon: Video },
  { label: 'Patient records', key: 'totalPatients', suffix: '+', icon: FileText },
  { label: 'Doctors onboarded', key: 'totalDoctors', suffix: '+', icon: Stethoscope },
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
];

const dashboardMetrics = [
  { label: 'Total Appointments', statKey: 'totalAppointments', change: '+12% this month' },
  { label: 'Total Consultations', statKey: 'totalConsultations', change: '+8% this month' },
  { label: 'Total Patients', statKey: 'totalPatients', change: '+15% this month' },
  { label: 'Total Doctors', statKey: 'totalDoctors', change: '+10% this month' },
];

const chartData = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 49 },
  { day: 'Thu', value: 72 },
  { day: 'Fri', value: 66 },
  { day: 'Sat', value: 88 },
  { day: 'Sun', value: 94 },
];

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
    items: ['Find doctors', 'Book appointments', 'View prescriptions', 'Track records & payments'],
    tone: 'blue',
    cta: 'Join as Patient',
  },
  {
    role: 'Doctor',
    icon: Stethoscope,
    title: 'Run the day with clarity',
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=900&q=80',
    items: ['Manage schedules', 'Review patient history', 'Write prescriptions', 'Handle consultations'],
    tone: 'teal',
    cta: 'Join as Doctor',
  },
  // {
  //   role: 'Admin',
  //   icon: Building2,
  //   title: 'See the whole system',
  //   image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80',
  //   items: ['Manage users', 'Approve doctors', 'Review appointments', 'Monitor platform activity'],
  //   tone: 'violet',
  //   cta: 'Join as Admin',
  // },
];

const steps = [
  { icon: UserPlus, n: '01', title: 'Create account', desc: 'Choose your role and register with a guided, simple flow.' },
  { icon: LayoutDashboard, n: '02', title: 'Open dashboard', desc: 'Access the tools that match your patient, doctor, or admin role.' },
  { icon: CalendarCheck, n: '03', title: 'Manage care', desc: 'Book visits, consult, write prescriptions, and track activity in one place.' },
];

const trustedBrands = ['Fortis', 'MAX Healthcare', 'Apollo Hospitals', 'Manipal Hospitals', 'Medanta'];

const testimonials = [
  {
    who: 'Dr. Rajesh Kumar',
    org: 'Apollo Hospitals',
    quote: 'MediCare Pro makes appointment handling and patient record access much faster for our team.',
  },
  {
    who: 'Dr. Priya Sharma',
    org: 'Fortis Healthcare',
    quote: 'The interface feels clean and practical. Doctors and patients can understand it quickly.',
  },
  // {
  //   who: 'Admin Team',
  //   org: 'Max Healthcare',
  //   quote: 'Role-based dashboards help us keep operations visible without overwhelming the staff.',
  // },
];

const faqs = [
  {
    question: 'Can patients book appointments online?',
    answer: 'Yes. Patients can find doctors, select date and time, choose visit type, and manage their appointments from the patient dashboard.',
  },
  {
    question: 'Does MediCare Pro support video consultations?',
    answer: 'Yes. Telemedicine appointments can include video call links so doctors and patients can join consultations directly.',
  },
  {
    question: 'Are dashboards different for patients, doctors, and admins?',
    answer: 'Yes. Each role gets its own focused dashboard, navigation, and permissions so the experience stays clear and secure.',
  },
  {
    question: 'Can doctors manage prescriptions and records?',
    answer: 'Doctors can handle appointments, create prescriptions, and add medical records from their workflow.',
  },
];

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Roles', href: '#roles' },
      { label: 'Workflow', href: '#workflow' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  // {
  //   title: 'Company',
  //   links: [
  //     { label: 'About', href: '#home' },
  //     { label: 'Reviews', href: '#testimonials' },
  //     { label: 'Contact', to: '/auth?mode=login' },
  //     { label: 'Security', href: '#features' },
  //   ],
  // },
  {
    title: 'Resources',
    links: [
      { label: 'BMI Calculator', to: '/bmi' },
      { label: 'BMR Calculator', to: '/bmr' },
      { label: 'Water Intake', to: '/water-intake' },
      { label: 'Health Guides', to: '/blood-pressure-guide' },
    ],
  },
  // {
  //   title: 'Legal',
  //   links: [
  //     { label: 'Privacy Policy', href: '#home' },
  //     { label: 'Terms of Service', href: '#home' },
  //     { label: 'Compliance', href: '#home' },
  //     { label: 'Status', href: '#home' },
  //   ],
  // },
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

const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isVisible) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px', ...options });

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, options]);

  return [ref, isVisible];
};

const useCountUp = (value, duration = 950) => {
  const [ref, isVisible] = useInView();
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const endValue = Number(value || 0);
    if (!isVisible) return undefined;

    let frameId;
    let startTime;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(endValue * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [duration, isVisible, value]);

  return [ref, displayValue];
};

const AnimatedStat = ({ value, suffix = '', formatter = formatStat, className = '' }) => {
  const [ref, count] = useCountUp(value);

  return (
    <span ref={ref} className={className}>
      {formatter(count)}{suffix}
    </span>
  );
};

const Reveal = ({ children, className = '', delay = 0 }) => {
  const [ref, isVisible] = useInView();

  return (
    <div
      ref={ref}
      className={`home-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const SectionHeader = ({ kicker, title, text }) => (
  <Reveal className="home-section-head">
    <div className="home-kicker">{kicker}</div>
    <h2 className="home-h2">{title}</h2>
    <p className="home-p">{text}</p>
  </Reveal>
);

const buildChartPaths = (data) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const width = 420;
  const top = 28;
  const bottom = 145;
  const step = width / Math.max(data.length - 1, 1);
  const points = data.map((item, index) => {
    const x = Math.round(index * step);
    const y = Math.round(bottom - ((item.value / maxValue) * (bottom - top)));
    return `${x} ${y}`;
  });
  const linePath = `M${points.join(' L')}`;
  const lastX = Math.round((data.length - 1) * step);
  const fillPath = `${linePath} L${lastX} 180 L0 180 Z`;

  return { linePath, fillPath };
};

export default function HomePage() {
  const [stats, setStats] = useState(fallbackStats);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const chartPaths = useMemo(() => buildChartPaths(chartData), []);

  useEffect(() => {
    let isMounted = true;

    axios.get('/api/public/stats')
      .then((response) => {
        if (!isMounted) return;

        setStats({
          ...fallbackStats,
          ...(response.data?.stats || {}),
        });
      })
      .catch(() => {
        if (isMounted) setStats(fallbackStats);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setResourcesOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            {navLinks.map((link) => (
              <AppLink
                key={link.label}
                link={link}
                className={`home-nav-link ${link.label === 'Home' ? 'active' : ''}`}
              />
            ))}

            <div
              className={`home-nav-dropdown ${resourcesOpen ? 'open' : ''}`}
              onMouseEnter={() => setResourcesOpen(true)}
              onMouseLeave={() => setResourcesOpen(false)}
            >
              <button
                className="home-nav-link home-nav-dropdown-btn"
                type="button"
                onClick={() => setResourcesOpen((open) => !open)}
                aria-expanded={resourcesOpen}
              >
                Resources <ChevronDown size={14} />
              </button>
              <div className="home-nav-menu">
                {resourceLinks.map((link) => (
                  <AppLink key={link.label} link={link} className="home-nav-menu-link" />
                ))}
              </div>
            </div>
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
          <Reveal className="home-hero-left">
            <div className="home-badge">
              <ShieldCheck size={16} />
              <span>{heroContent.badge}</span>
            </div>

            <h1 className="home-h1">{heroContent.title}</h1>

            <p className="home-lead">{heroContent.lead}</p>

            <div className="home-cta">
              <AppLink link={heroContent.cta} className="home-btn home-btn-primary home-btn-lg">
                {heroContent.cta.label} <ChevronRight size={16} />
              </AppLink>
              <AppLink link={heroContent.secondaryCta} className="home-btn home-btn-soft home-btn-lg">
                {heroContent.secondaryCta.label}
              </AppLink>
            </div>

            <div className="home-stats-row">
              {heroStats.map((item, index) => {
                const Icon = item.icon;
                const value = item.key ? stats[item.key] : item.value;
                const content = (
                  <>
                    <Icon size={22} />
                    <div>
                      <AnimatedStat value={value} suffix={item.suffix || ''} className="home-stat-num" />
                      <div className="home-stat-label">{item.label}</div>
                    </div>
                  </>
                );

                return item.to ? (
                  <Link key={item.label} className="home-stat-box" to={item.to} style={{ '--i': index }}>
                    {content}
                  </Link>
                ) : (
                  <div key={item.label} className="home-stat-box" style={{ '--i': index }}>
                    {content}
                  </div>
                );
              })}
            </div>

            <div className="home-security-row">
              {securityBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <span key={badge.label}>
                    <Icon size={14} />
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="home-hero-right" delay={130}>
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
                  <h3>Live Operations</h3>
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
                  {dashboardMetrics.map((metric) => {
                    const value = metric.statKey ? stats[metric.statKey] : metric.value;
                    return (
                      <div className="home-metric" key={metric.label}>
                        <span>{metric.label}</span>
                        <AnimatedStat value={value} className="home-metric-value" />
                        <small>{metric.change}</small>
                      </div>
                    );
                  })}
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
                        <path className="home-chart-fill" d={chartPaths.fillPath} />
                        <path className="home-chart-line" d={chartPaths.linePath} />
                      </svg>
                      <div className="home-chart-days">
                        {chartData.map((item) => <span key={item.day}>{item.day}</span>)}
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
                    <Link className="home-view-btn" to="/auth?mode=login">View appointments</Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="features" className="home-section" aria-label="Features">
          <SectionHeader
            kicker="All-in-one platform"
            title="Everything your healthcare team needs to move faster."
            text="Built around real hospital workflows: booking, records, doctor tools, payments, and admin visibility."
          />

          <div className="home-feature-grid">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 55}>
                <article className="home-feature">
                  <div className="home-feature-icon" aria-hidden>
                    {React.createElement(feature.icon, { size: 24 })}
                  </div>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                    <a href="#workflow">Learn more <ChevronRight size={14} /></a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-stats-band" aria-label="Platform stats">
          {platformStats.map((item, index) => {
            const Icon = item.icon;
            const value = item.key ? stats[item.key] : item.value;

            return (
              <Reveal key={item.label} className="home-stat-card" delay={index * 70}>
                <Icon size={22} />
                <AnimatedStat value={value} suffix={item.suffix} className="home-stat-card-value" />
                <span>{item.label}</span>
              </Reveal>
            );
          })}
        </section>

        <section id="roles" className="home-section" aria-label="Roles">
          <SectionHeader
            kicker="Role-based experience"
            title="Designed for every user in your healthcare system."
            text="Patients, doctors, and admins each get a focused workspace with the right actions surfaced first."
          />

          <div className="home-role-grid">
            {roleCards.map((card, index) => (
              <Reveal key={card.role} delay={index * 80}>
                <article className={`home-role home-role-${card.tone}`}>
                  <div className="home-role-media">
                    <img src={card.image} alt={`${card.role} dashboard experience`} />
                    <div className="home-role-badge">
                      {React.createElement(card.icon, { size: 15 })} {card.role}
                    </div>
                  </div>
                  <div className="home-role-body">
                    <h3>{card.title}</h3>
                    <ul>
                      {card.items.map((item) => (
                        <li key={item}><CheckCircle2 size={15} /> {item}</li>
                      ))}
                    </ul>
                    <Link className="home-role-btn" to="/auth?mode=register">{card.cta}</Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="workflow" className="home-section home-step-section" aria-label="Workflow">
          <SectionHeader
            kicker="Simple onboarding"
            title="Start in 3 simple steps."
            text="A clear path from signup to real care management, without making users hunt for tools."
          />

          <div className="home-steps">
            {steps.map((step, index) => (
              <Reveal key={step.n} delay={index * 80}>
                <article className={`home-step home-step-${index + 1}`}>
                  <div className="home-step-icon">{React.createElement(step.icon, { size: 32 })}</div>
                  <div>
                    <span>{step.n}</span>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-logo-strip" aria-label="Trusted hospitals">
          <p>Trusted by 500+ healthcare teams worldwide</p>
          <div className="home-logo-row">
            {trustedBrands.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </section>

        <section id="testimonials" className="home-section" aria-label="Testimonials">
          <SectionHeader
            kicker="Customer stories"
            title="A calmer way to run daily healthcare operations."
            text="Built for teams that need speed, clarity, and confidence from the first login."
          />

          <div className="home-testimonials">
            {testimonials.map((item, index) => (
              <Reveal key={item.who} delay={index * 80}>
                <article className="home-quote">
                  <div className="home-quote-top">
                    <div className="home-quote-icon"><Quote size={20} /></div>
                    <div className="home-stars">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={starIndex} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p>{item.quote}</p>
                  <strong>{item.who}</strong>
                  <span>{item.org}</span>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="faq" className="home-section home-faq-section" aria-label="FAQ">
          <SectionHeader
            kicker="FAQ"
            title="Questions teams ask before getting started."
            text="A few practical answers about appointments, roles, video visits, and records."
          />

          <div className="home-faq-list">
            {faqs.map((item, index) => {
              const isOpen = activeFaq === index;

              return (
                <Reveal key={item.question} delay={index * 45}>
                  <div className={`home-faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="home-faq-question"
                      onClick={() => setActiveFaq((current) => (current === index ? -1 : index))}
                      aria-expanded={isOpen}
                    >
                      <span>{item.question}</span>
                      {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                    </button>
                    <div className="home-faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        <section className="home-final" aria-label="Final CTA">
          <Reveal className="home-final-card">
            <div className="home-final-icon"><MessageCircle size={32} /></div>
            <div>
              <h2>Ready to simplify your hospital management?</h2>
              <p>Bring appointments, records, consultations, and payments into one calm workspace.</p>
            </div>
            <div className="home-final-actions">
              <Link className="home-btn home-btn-light" to="/auth?mode=register">Get Started Free</Link>
            </div>
          </Reveal>
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
          <span>Copyright {new Date().getFullYear()} {brand.name}. All rights reserved.</span>
          <span><ShieldCheck size={14} /> Secure healthcare workflows</span>
        </div>
      </footer>
    </div>
  );
}
