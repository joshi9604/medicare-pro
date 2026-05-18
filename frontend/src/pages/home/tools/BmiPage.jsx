import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { ArrowLeft, Building2, Calculator, HeartPulse, Ruler, ShieldCheck, Users } from 'lucide-react';
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
      <Navbar />

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
      
      

      <Footer />
    </div>
  );
}