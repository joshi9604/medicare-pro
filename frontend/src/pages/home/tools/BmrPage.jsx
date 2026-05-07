import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calculator, HeartPulse, Ruler, ShieldCheck, Users } from 'lucide-react';
import './BmrPage.css';

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

export default function BmrPage() {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('kcal');

  const bmr = useMemo(() => {
    const ageValue = Number(age);
    const heightValue = Number(height);
    const weightValue = Number(weight);

    if (!ageValue || !heightValue || !weightValue) return null;

    const base = 10 * weightValue + 6.25 * heightValue - 5 * ageValue;
    return Math.round(gender === 'female' ? base - 161 : base + 5);
  }, [age, gender, height, weight]);

  const displayValue = unit === 'kcal'
    ? bmr
    : bmr
      ? Math.round(bmr * 4.184)
      : null;

  const displayUnit = unit === 'kcal' ? 'kcal/day' : 'kJ/day';

  return (
    <div className="bmr-page">
      <header className="bmr-header">
        <Link className="bmr-brand" to="/">
          <span className="bmr-logo"><Building2 size={22} /></span>
          <span><strong>MediCare Pro</strong><small>BMR Calculator</small></span>
        </Link>

        <Link className="bmr-back" to="/">
          <ArrowLeft size={16} /> Back
        </Link>
      </header>

      <main className="bmr-main">
        <section className="bmr-card">
          <div className="bmr-kicker"><Calculator size={15} /> Free Tool</div>
          <h1>BMR Calculator</h1>
          <p>Estimate how many calories your body burns at rest each day.</p>

          <div className="bmr-form">
            <label>
              <span><Users size={16} /> Age</span>
              <input type="number" min="1" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age in years" />
            </label>

            <label>
              <span><Users size={16} /> Gender</span>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>

            <label>
              <span><Ruler size={16} /> Height</span>
              <input type="number" min="1" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height in cm" />
            </label>

            <label>
              <span><HeartPulse size={16} /> Weight</span>
              <input type="number" min="1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight in kg" />
            </label>
          </div>
        </section>

        <aside className="bmr-result">
          <h2>Your Results</h2>
          <h3>Basal Metabolic Rate (BMR)</h3>

          <div className="bmr-gauge">
            <div className="bmr-needle"></div>
            <div className="bmr-gauge-value">
              <strong>{displayValue || '--'}</strong>
              <span>{displayValue ? displayUnit : 'kcal/day'}</span>
            </div>
          </div>

          <div className="bmr-gauge-labels">
            <span>Low</span>
            <span>Normal</span>
            <span>High</span>
          </div>

          <p>
            {bmr
              ? `Your estimated Basal Metabolic Rate (BMR) is ${displayValue} ${displayUnit}.`
              : 'Enter your details to calculate your estimated BMR.'}
          </p>

          <div className="bmr-unit-toggle">
            <button className={unit === 'kcal' ? 'active' : ''} onClick={() => setUnit('kcal')}>
              kcal/day
            </button>
            <button className={unit === 'kj' ? 'active' : ''} onClick={() => setUnit('kj')}>
              kJ/day
            </button>
          </div>
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