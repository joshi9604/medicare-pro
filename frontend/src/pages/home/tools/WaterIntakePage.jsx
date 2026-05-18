import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { ArrowLeft, Building2, Droplets, HeartPulse, ShieldCheck, Timer, Waves, Sparkles } from 'lucide-react';
import './WaterIntakePage.css';



export default function WaterIntakePage() {
  const [weight, setWeight] = useState('');
  const [activity, setActivity] = useState('30');

  const litres = useMemo(() => {
    const weightValue = Number(weight);
    if (!weightValue) return null;
    return ((weightValue * 35 + Number(activity || 0) * 12) / 1000).toFixed(1);
  }, [activity, weight]);

  const glasses = litres ? Math.round(Number(litres) / 0.25) : 0;
  const percent = litres ? Math.min(100, Math.max(12, (Number(litres) / 4) * 100)) : 10;

  return (
    <div className="water-page">
      <Navbar />

      <main className="water-main">
        <section className="water-card">
          <div className="water-kicker">
            <Droplets size={15} /> Free Tool
          </div>

          <h1>Water Intake Calculator</h1>
          <p>Estimate your daily water need using weight and activity time.</p>

          <div className="water-form">
            <label>
              <span><HeartPulse size={16} /> Weight</span>
              <input
                type="number"
                min="1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight in kg"
              />
            </label>

            <label>
              <span><Timer size={16} /> Activity</span>
              <input
                type="number"
                min="0"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Minutes per day"
              />
            </label>
          </div>
        </section>

        <aside className="water-result">
          <div className="water-result-top">
            <div className="water-icon-orb">
              <Droplets size={42} />
            </div>
            <div>
              <span>Suggested Intake</span>
              <h2>{litres ? `${litres} L/day` : '--'}</h2>
            </div>
          </div>

          <div className="water-bottle">
            <div className="water-bottle-cap"></div>
            <div className="water-bottle-body">
              <div className="water-fill" style={{ height: `${percent}%` }}>
                <div className="water-wave"></div>
              </div>
              <div className="water-bottle-value">
                <Waves size={22} />
                <strong>{litres ? `${glasses}` : '--'}</strong>
                <small>glasses/day</small>
              </div>
            </div>
          </div>

          <div className="water-info-grid">
            <div>
              <Sparkles size={18} />
              <strong>{litres ? `${litres} L` : '--'}</strong>
              <span>Daily Target</span>
            </div>

            <div>
              <Droplets size={18} />
              <strong>{litres ? `${glasses}` : '--'}</strong>
              <span>250ml Glasses</span>
            </div>
          </div>

          <p>
            Hot weather, fever, pregnancy, or heavy exercise may increase your need.
          </p>
        </aside>
      </main>

      <Footer />
    </div>
  );
}