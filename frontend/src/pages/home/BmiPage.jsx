import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calculator, HeartPulse, Ruler, User } from 'lucide-react';
import './HomePage.css';

const getBmiInfo = (bmi) => {
  if (!bmi) return { label: 'Enter details', tone: 'neutral', note: 'Add height and weight.', percent: 0 };
  if (bmi < 18.5) return { label: 'Underweight', tone: 'warning', note: 'Below healthy range.', percent: 20 };
  if (bmi < 25) return { label: 'Normal', tone: 'success', note: 'Healthy range.', percent: 50 };
  if (bmi < 30) return { label: 'Overweight', tone: 'warning', note: 'Above healthy range.', percent: 75 };
  return { label: 'Obese', tone: 'danger', note: 'Significantly above range.', percent: 95 };
};

export default function BmiPage() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState(''); // Age field added as per your description

  const bmi = useMemo(() => {
    const heightInMeters = Number(height) / 100;
    const weightInKg = Number(weight);
    if (!heightInMeters || !weightInKg) return 0;
    return weightInKg / (heightInMeters * heightInMeters);
  }, [height, weight]);

  const info = getBmiInfo(bmi);
  
  // Speedometer needle rotation logic (-90deg to 90deg)
  const calculateRotation = () => {
    if (!bmi) return -90;
    const minBmi = 15;
    const maxBmi = 40;
    const clampedBmi = Math.min(Math.max(bmi, minBmi), maxBmi);
    return ((clampedBmi - minBmi) / (maxBmi - minBmi)) * 180 - 90;
  };

  return (
    <div className="home">
      <header className="home-header">
        <Link className="home-brand home-brand-link" to="/">
          <div className="home-logo"><Building2 size={22} /></div>
          <div className="home-brand-text">
            <div className="home-title">MediCare Pro</div>
            <div className="home-subtitle">Health Metrics</div>
          </div>
        </Link>
        <Link className="home-btn home-btn-ghost" to="/"><ArrowLeft size={16} /> Back</Link>
      </header>

      <main className="home-main">
        <section className="bmi-container">
          <div className="bmi-panel">
            <div className="home-kicker"><Calculator size={15} /> Health Tool</div>
            <h1 className="home-h2">BMI Calculator</h1>
            
            <div className="bmi-form">
              <label className="bmi-field">
                <span><Ruler size={16} /> Height (cm)</span>
                <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
              </label>

              <label className="bmi-field">
                <span><HeartPulse size={16} /> Weight (kg)</span>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" />
              </label>

              <label className="bmi-field">
                <span><User size={16} /> Age</span>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="25" />
              </label>
            </div>
          </div>

          <div className="bmi-visual">
            <div className="speedometer-container">
              <svg className="speedometer" viewBox="0 0 200 100">
                <path className="speed-track" d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#2d3748" strokeWidth="12" />
                {/* Colored Zones */}
                <path d="M20,100 A80,80 0 0,1 60,35" fill="none" stroke="#ecc94b" strokeWidth="12" strokeDasharray="0" />
                <path d="M60,35 A80,80 0 0,1 140,35" fill="none" stroke="#48bb78" strokeWidth="12" />
                <path d="M140,35 A80,80 0 0,1 180,100" fill="none" stroke="#f56565" strokeWidth="12" />
                
                {/* Needle */}
                <line 
                  className="needle"
                  x1="100" y1="100" x2="100" y2="30" 
                  stroke="#fff" strokeWidth="3"
                  style={{ transform: `rotate(${calculateRotation()}deg)`, transformOrigin: '100px 100px' }}
                />
                <circle cx="100" cy="100" r="5" fill="#fff" />
              </svg>
              <div className="bmi-display">
                <span className="bmi-num">{bmi ? bmi.toFixed(1) : '--'}</span>
                <span className={`bmi-stat status-${info.tone}`}>{info.label}</span>
              </div>
            </div>
            <p className="bmi-note">{info.note}</p>
          </div>
        </section>
      </main>
    </div>
  );
}