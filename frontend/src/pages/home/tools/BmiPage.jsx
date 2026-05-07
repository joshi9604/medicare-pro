import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calculator, HeartPulse, Ruler, ShieldCheck, Users } from 'lucide-react';
import './BmiPage.css';

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

const getBmiInfo = (bmi) => {
  if (!bmi) return { label: 'Enter details', tone: 'neutral', note: 'Add your height and weight to calculate BMI.' };
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warning', note: 'Your BMI is below the healthy range.' };
  if (bmi < 25) return { label: 'Normal', tone: 'success', note: 'Your BMI is within the healthy range.' };
  if (bmi < 30) return { label: 'Overweight', tone: 'warning', note: 'Your BMI is above the healthy range.' };
  return { label: 'Obese', tone: 'danger', note: 'Your BMI is significantly above the healthy range.' };
};

export default function BmiPage() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const calculateBmi = () => {
    const heightInMeters = Number(height) / 100;
    const weightInKg = Number(weight);

    if (!Number(age) || !heightInMeters || !weightInKg) return 0;
    return weightInKg / (heightInMeters * heightInMeters);
  };

  const handleCalculate = (event) => {
    event.preventDefault();

    const nextBmi = calculateBmi();

    if (!nextBmi) {
      setError('Please enter valid age, height, and weight.');
      setResult(null);
      return;
    }

    setError('');
    setResult({
      bmi: nextBmi,
      age
    });
  };

  const roundedBmi = result?.bmi ? result.bmi.toFixed(1) : '';
  const info = getBmiInfo(result?.bmi || 0);
  const needleAngle = result?.bmi
    ? Math.max(-90, Math.min(90, ((result.bmi - 12) / 28) * 180 - 90))
    : -90;

  return (
    <div className="home">
      {/* HEADER */}
      <header className="home-header">
        <Link className="home-brand home-brand-link" to="/">
          <div className="home-logo">
            <Building2 size={22} />
          </div>
          <div className="home-brand-text">
            <div className="home-title">MediCare Pro</div>
            <div className="home-subtitle">BMI Calculator</div>
          </div>
        </Link>

        <Link className="home-btn home-btn-ghost" to="/">
          <ArrowLeft size={16} /> Back
        </Link>
      </header>

      {/* MAIN */}
      <main className="home-main">
        <section className="bmi-page">
          <div className="bmi-panel">
            <div className="home-kicker">
              <Calculator size={15} /> Free BMI Calculator
            </div>

            <h1 className="home-h2">Calculate your BMI</h1>

            <p className="home-p">
              Enter age, height, and weight to see your BMI instantly.
            </p>

            <form className="bmi-form" onSubmit={handleCalculate}>
              <label className="bmi-field">
                <span><Users size={16} /> Age</span>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                />
              </label>

              <label className="bmi-field">
                <span><Ruler size={16} /> Height</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Height (cm)"
                />
              </label>

              <label className="bmi-field">
                <span><HeartPulse size={16} /> Weight</span>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Weight (kg)"
                />
              </label>

              {error && <div className="bmi-error">{error}</div>}

              <button className="home-btn home-btn-primary">
                <Calculator size={16} /> Calculate BMI
              </button>
            </form>
          </div>
          

          {/* RESULT */}
          <div className={`bmi-result bmi-result-${info.tone}`}>
            <div className="bmi-speedometer" style={{ '--needle-angle': `${needleAngle}deg` }}>
              <div className="bmi-speedometer-arc" />
              <div className="bmi-speedometer-needle" />
            </div>

            <div className="bmi-result-label">Your BMI</div>
            <div className="bmi-result-value">{roundedBmi || '--'}</div>
            <div className="bmi-result-status">{info.label}</div>
            <p>{info.note}</p>
          </div>
        </section>
        
      </main>
      
      

      {/* FOOTER */}
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