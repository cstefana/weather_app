import { useNavigate } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
  { icon: '🌡️', title: 'Real-Time Conditions', desc: 'Temperature, humidity, wind, UV index, pressure and more — updated live.' },
  { icon: '📅', title: '14-Day Forecast', desc: 'See highs, lows, rain chance, sunrise & sunset for the next two weeks.' },
  { icon: '⏱️', title: 'Hourly Timeline', desc: 'Hour-by-hour breakdown of the next 24 hours at a glance.' },
  { icon: '⭐', title: 'Saved Cities', desc: 'Bookmark your favourite locations and switch between them in one tap.' },
  { icon: '🕐', title: 'Search History', desc: 'Your recent lookups are remembered so you can revisit them instantly.' },
  { icon: '📍', title: 'Auto Location', desc: 'Tap once to pull weather for wherever you are right now.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="land-page">
      {/* Hero */}
      <section className="land-hero">
        <h1 className="land-hero-title">Ready to check the weather?</h1>
        <div className="land-hero-actions">
          <button className="land-cta land-cta--primary" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button className="land-cta land-cta--ghost" onClick={() => navigate('/app')}>
            Continue without signing in
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="land-features">
        <h2 className="land-section-title">Everything you need</h2>
        <div className="land-grid">
          {FEATURES.map(f => (
            <div key={f.title} className="land-card">
              <span className="land-card-icon">{f.icon}</span>
              <h3 className="land-card-title">{f.title}</h3>
              <p className="land-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>


      <footer className="land-footer">
        <span>Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></span>
      </footer>
    </div>
  );
}
