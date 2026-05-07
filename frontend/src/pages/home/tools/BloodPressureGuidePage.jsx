import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  HeartPulse,
  Info,
  ShieldCheck,
} from 'lucide-react';
import './BloodPressureGuidePage.css';

const brand = {
  name: 'MediCare Pro',
  subtitle: 'Hospital Management + Telemedicine',
};

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Roles', href: '/#roles' },
      { label: 'Workflow', href: '/#workflow' },
      { label: 'FAQ', href: '/#faq' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'BMI Calculator', to: '/bmi' },
      { label: 'BMR Calculator', to: '/bmr' },
      { label: 'Water Intake', to: '/water-intake' },
      { label: 'Health Guides', to: '/blood-pressure-guide' },
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

export default function BloodPressureGuidePage() {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');

  const result = useMemo(() => {
    const sys = Number(systolic);
    const dia = Number(diastolic);

    if (!sys || !dia) return null;

    if (sys >= 180 || dia >= 120) {
      return {
        title: 'Hypertensive crisis range',
        tone: 'danger',
        message: 'This reading is very high. Seek urgent medical help if symptoms are present.',
        advice: ['Rest and recheck after a few minutes.', 'Contact a clinician immediately if symptoms occur.'],
      };
    }

    if (sys >= 140 || dia >= 90) {
      return {
        title: 'High blood pressure',
        tone: 'high',
        message: 'This reading may fall in a high blood pressure range.',
        advice: ['Track your readings regularly.', 'Discuss repeated high readings with a doctor.'],
      };
    }

    if (sys >= 120 || dia >= 80) {
      return {
        title: 'Elevated range',
        tone: 'warning',
        message: 'This reading may be elevated compared with common healthy ranges.',
        advice: ['Reduce salt and stress where possible.', 'Monitor readings over multiple days.'],
      };
    }

    return {
      title: 'Normal range',
      tone: 'normal',
      message: 'This reading is commonly considered within a normal range.',
      advice: ['Maintain healthy habits.', 'Keep checking periodically.'],
    };
  }, [diastolic, systolic]);

  const sys = Number(systolic);
  const dia = Number(diastolic);

  const meterPercent = sys && dia
    ? Math.min(100, Math.max(8, ((Math.max(sys, dia * 1.6) - 90) / 100) * 100))
    : 8;

  const ResultIcon =
    result?.tone === 'normal'
      ? ShieldCheck
      : result?.tone === 'warning'
        ? Info
        : result
          ? AlertTriangle
          : Activity;

  return (
    <div className="bp-page">
      <header className="bp-header">
        <Link className="bp-brand" to="/">
          <span><Building2 size={22} /></span>
          <strong>MediCare Pro</strong>
        </Link>

        <Link className="bp-back" to="/">
          <ArrowLeft size={16} /> Back
        </Link>
      </header>

      <main className="bp-main">
        <section className="bp-card">
          <div className="bp-kicker">
            <HeartPulse size={15} /> Guide
          </div>

          <h1>Blood Pressure Checker Guide</h1>
          <p>Enter systolic and diastolic values to see a quick category guide.</p>

          <div className="bp-form">
            <label>
              <span>Systolic</span>
              <input
                type="number"
                min="1"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                placeholder="e.g. 120"
              />
            </label>

            <label>
              <span>Diastolic</span>
              <input
                type="number"
                min="1"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                placeholder="e.g. 80"
              />
            </label>
          </div>
        </section>

        <aside className={`bp-result ${result ? `is-${result.tone}` : ''}`}>
          <div className="bp-result-icon">
            <ResultIcon size={34} />
          </div>

          <span>{systolic && diastolic ? `${systolic}/${diastolic} mmHg` : 'Result'}</span>
          <strong>{result?.title || '--'}</strong>

          <div className="bp-meter">
            <div className="bp-meter-track">
              <div className="bp-meter-pointer" style={{ left: `${meterPercent}%` }} />
            </div>
            <div className="bp-meter-labels">
              <small>Normal</small>
              <small>Elevated</small>
              <small>High</small>
              <small>Crisis</small>
            </div>
          </div>

          <p>{result?.message || 'Enter both readings to view your blood pressure guide.'}</p>

          <div className="bp-info-grid">
            <div>
              <HeartPulse size={18} />
              <b>{systolic || '--'}</b>
              <small>Systolic</small>
            </div>

            <div>
              <Activity size={18} />
              <b>{diastolic || '--'}</b>
              <small>Diastolic</small>
            </div>
          </div>

          {result && (
            <ul className="bp-advice">
              {result.advice.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <em>This is a guide only. If symptoms are present, seek medical help.</em>
        </aside>
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