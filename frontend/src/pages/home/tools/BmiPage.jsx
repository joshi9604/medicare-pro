import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building2, Calculator, HeartPulse, Ruler, Users } from 'lucide-react';
import './BmiPage.css';

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
      <header className="home-header">
        <Link className="home-brand home-brand-link" to="/">
          <div className="home-logo" aria-hidden>
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

      <main className="home-main">
        <section className="bmi-page" aria-label="BMI Calculator">
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
                  min="1"
                  max="120"
                  value={age}
                  onChange={(event) => setAge(event.target.value)}
                  placeholder="Age in years"
                />
              </label>

              <label className="bmi-field">
                <span><Ruler size={16} /> Height</span>
                <input
                  type="number"
                  min="1"
                  value={height}
                  onChange={(event) => setHeight(event.target.value)}
                  placeholder="Height in cm"
                />
              </label>

              <label className="bmi-field">
                <span><HeartPulse size={16} /> Weight</span>
                <input
                  type="number"
                  min="1"
                  value={weight}
                  onChange={(event) => setWeight(event.target.value)}
                  placeholder="Weight in kg"
                />
              </label>

              {error && <div className="bmi-error">{error}</div>}

              <button className="home-btn home-btn-primary bmi-calculate-btn" type="submit">
                <Calculator size={16} /> Calculate BMI
              </button>
            </form>
          </div>

          <div className={`bmi-result bmi-result-${info.tone} ${result ? 'bmi-result-ready' : ''}`}>
            <div className="bmi-speedometer" style={{ '--needle-angle': `${needleAngle}deg` }}>
              <div className="bmi-speedometer-arc" />
              <div className="bmi-speedometer-ticks" aria-hidden>
                {[-90, -60, -30, 0, 30, 60, 90].map((angle) => (
                  <span key={angle} style={{ '--tick-angle': `${angle}deg` }} />
                ))}
              </div>
              <div className="bmi-speedometer-needle" />
              <div className="bmi-speedometer-center" />
              <div className="bmi-speedometer-scale">
                <span>12</span>
                <span>18.5</span>
                <span>25</span>
                <span>30+</span>
              </div>
            </div>
            <div className="bmi-result-label">Your BMI</div>
            <div className="bmi-result-value">{roundedBmi || '--'}</div>
            {result?.age && <div className="bmi-result-age">Age: {result.age} years</div>}
            <div className="bmi-result-status">{info.label}</div>
            <p>{info.note}</p>
            <div className="bmi-range-legend" aria-label="BMI ranges">
              <span><i className="bmi-dot bmi-dot-low" /> Under 18.5</span>
              <span><i className="bmi-dot bmi-dot-good" /> 18.5 - 24.9</span>
              <span><i className="bmi-dot bmi-dot-mid" /> 25 - 29.9</span>
              <span><i className="bmi-dot bmi-dot-high" /> 30+</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
