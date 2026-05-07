import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Info,
  ShieldCheck,
} from 'lucide-react';
import './SugarLevelGuidePage.css';

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

export default function SugarLevelGuidePage() {
  const [type, setType] = useState('fasting');
  const [sugar, setSugar] = useState('');

  const result = useMemo(() => {
    const value = Number(sugar);
    if (!value) return null;

    if (type === 'fasting') {
      if (value < 70) {
        return {
          title: 'Low range',
          tone: 'low',
          message: 'This reading may be below the common fasting range.',
          advice: ['Consider eating something if symptoms are present.', 'Recheck your reading after a short time.'],
        };
      }

      if (value >= 126) {
        return {
          title: 'High range',
          tone: 'high',
          message: 'This reading may be above the common fasting range.',
          advice: ['Confirm with a clinician or lab test.', 'Track readings for patterns.'],
        };
      }

      if (value >= 100) {
        return {
          title: 'Prediabetes range',
          tone: 'warning',
          message: 'This reading may fall in an elevated fasting range.',
          advice: ['Maintain healthy meals and activity.', 'Discuss repeated results with a clinician.'],
        };
      }

      return {
        title: 'Within common fasting range',
        tone: 'normal',
        message: 'This reading is commonly considered within fasting range.',
        advice: ['Keep monitoring regularly.', 'Maintain a balanced lifestyle.'],
      };
    }

    if (value < 70) {
      return {
        title: 'Low range',
        tone: 'low',
        message: 'This reading may be below the common random sugar range.',
        advice: ['Watch for dizziness or sweating.', 'Recheck your sugar if needed.'],
      };
    }

    if (value >= 200) {
      return {
        title: 'High range',
        tone: 'high',
        message: 'This reading may be high for random/post-meal sugar.',
        advice: ['Seek medical guidance for repeated high readings.', 'Keep a record of meals and readings.'],
      };
    }

    if (value >= 140) {
      return {
        title: 'Elevated range',
        tone: 'warning',
        message: 'This reading may be elevated after meals.',
        advice: ['Monitor your next readings.', 'Review meal timing and activity.'],
      };
    }

    return {
      title: 'Within common random range',
      tone: 'normal',
      message: 'This reading is commonly considered within random range.',
      advice: ['Stay hydrated.', 'Continue routine monitoring.'],
    };
  }, [sugar, type]);

  const value = Number(sugar);
  const progress = value ? Math.min(100, Math.max(8, (value / 250) * 100)) : 8;

  const toneIcon = {
    low: AlertTriangle,
    warning: Info,
    high: AlertTriangle,
    normal: CheckCircle2,
  };

  const ResultIcon = result ? toneIcon[result.tone] : Activity;

  return (
    <div className="sugar-page">
      <header className="sugar-header">
        <Link className="sugar-brand" to="/">
          <span>
            <Building2 size={22} />
          </span>
          <strong>MediCare Pro</strong>
        </Link>

        <Link className="sugar-back" to="/">
          <ArrowLeft size={16} /> Back
        </Link>
      </header>

      <main className="sugar-main">
        <section className="sugar-card">
          <div className="sugar-kicker">
            <HeartPulse size={15} /> Guide
          </div>

          <h1>Sugar Level Checker Guide</h1>
          <p>Check fasting or random sugar values against common guide ranges.</p>

          <div className="sugar-form">
            <label>
              <span>Reading Type</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="fasting">Fasting</option>
                <option value="random">Random/Post-meal</option>
              </select>
            </label>

            <label>
              <span>Sugar Level</span>
              <input
                type="number"
                min="1"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="mg/dL"
              />
            </label>
          </div>
        </section>

        <aside className={`sugar-result ${result ? `is-${result.tone}` : ''}`}>
          <div className="sugar-result-icon">
            <ResultIcon size={34} />
          </div>

          <span>{sugar ? `${sugar} mg/dL` : 'Result'}</span>
          <strong>{result?.title || '--'}</strong>

          <div className="sugar-meter">
            <div className="sugar-meter-track">
              <div className="sugar-meter-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="sugar-meter-labels">
              <small>Low</small>
              <small>Normal</small>
              <small>High</small>
            </div>
          </div>

          <p>{result?.message || 'Enter your sugar level to see a guide result.'}</p>

          <div className="sugar-info-grid">
            <div>
              <Droplets size={18} />
              <b>{type === 'fasting' ? 'Fasting' : 'Random'}</b>
              <small>Reading Type</small>
            </div>

            <div>
              <Activity size={18} />
              <b>{sugar || '--'}</b>
              <small>mg/dL</small>
            </div>
          </div>

          {result && (
            <ul className="sugar-advice">
              {result.advice.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} />
                  {item}
                </li>
              ))}
            </ul>
          )}

          <em>This is a guide only. Confirm concerns with a clinician or lab test.</em>
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