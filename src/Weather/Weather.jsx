import { useState, useEffect } from 'react';
import './Weather.css';
import { wmoLabel, wmoIcon, windDir, shortDay, toDisplay } from './weatherUtils';

// Component
export default function Weather() {
  const [weather, setWeather]   = useState(null);
  const [location, setLocation] = useState('');
  const [unit, setUnit]         = useState('celsius'); // 'celsius' | 'fahrenheit'
  const [status, setStatus]     = useState('loading'); // 'loading' | 'idle' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const fetchWeather = (lat, lon) => {
    setStatus('loading');

    // Reverse geocode for city name
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
      .then((r) => r.json())
      .then((geo) => {
        const city =
          geo.address?.city ||
          geo.address?.town ||
          geo.address?.village ||
          geo.address?.county ||
          'Your Location';
        const country = geo.address?.country_code?.toUpperCase() ?? '';
        setLocation(`${city}${country ? ', ' + country : ''}`);
      })
      .catch(() => setLocation('Your Location'));

    // Open-Meteo forecast
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
        'is_day', 'precipitation', 'weather_code', 'cloud_cover',
        'wind_speed_10m', 'wind_direction_10m',
      ].join(','),
      daily: [
        'weather_code', 'temperature_2m_max', 'temperature_2m_min',
        'precipitation_probability_max',
      ].join(','),
      timezone: 'auto',
      forecast_days: 7,
    });

    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then((r) => { if (!r.ok) throw new Error('API error'); return r.json(); })
      .then((data) => { setWeather(data); setStatus('idle'); })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Failed to fetch weather data. Please try again.');
      });
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        setStatus('error');
        setErrorMsg('Location access denied. Please allow location access and try again.');
      }
    );
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      Promise.resolve().then(() => {
        setStatus('error');
        setErrorMsg('Geolocation is not supported by your browser.');
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        setStatus('error');
        setErrorMsg('Location access denied. Please allow location access and try again.');
      }
    );
  }, []);

  // render helpers
  if (status === 'loading') {
    return (
      <div className="wx-page wx-loading">
        <div className="wx-spinner" />
        <p>Fetching your weather…</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="wx-page wx-error-page">
        <p className="wx-error-msg">⚠️ {errorMsg}</p>
        <button className="wx-retry-btn" onClick={requestLocation}>Try Again</button>
      </div>
    );
  }

  if (!weather) return null;

  const c  = weather.current;
  const d  = weather.daily;
  const isDay = c.is_day === 1;

  return (
    <div className={`wx-page ${isDay ? 'wx-day' : 'wx-night'}`}>
      {/* ── Header ── */}
      <header className="wx-header">
        <div className="wx-location">
          <span className="wx-location-icon">📍</span>
          <span>{location}</span>
        </div>
        <button
          className="wx-unit-toggle"
          onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
        >
          {unit === 'celsius' ? '°F' : '°C'}
        </button>
      </header>

      {/* ── Current ── */}
      <section className="wx-current">
        <div className="wx-main-icon">{wmoIcon(c.weather_code)}</div>
        <div className="wx-temp">{toDisplay(c.temperature_2m, unit)}</div>
        <div className="wx-condition">{wmoLabel(c.weather_code)}</div>
        <div className="wx-feels">Feels like {toDisplay(c.apparent_temperature, unit)}</div>
      </section>

      {/* ── Stats grid ── */}
      <section className="wx-stats">
        <div className="wx-stat">
          <span className="wx-stat-icon">💧</span>
          <span className="wx-stat-value">{c.relative_humidity_2m}%</span>
          <span className="wx-stat-label">Humidity</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">💨</span>
          <span className="wx-stat-value">{Math.round(c.wind_speed_10m)} km/h</span>
          <span className="wx-stat-label">Wind {windDir(c.wind_direction_10m)}</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">🌧️</span>
          <span className="wx-stat-value">{c.precipitation} mm</span>
          <span className="wx-stat-label">Precipitation</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">☁️</span>
          <span className="wx-stat-value">{c.cloud_cover}%</span>
          <span className="wx-stat-label">Cloud Cover</span>
        </div>
      </section>

      {/* ── 7-day forecast ── */}
      <section className="wx-forecast">
        <h2 className="wx-forecast-title">7-Day Forecast</h2>
        <div className="wx-forecast-scroll">
          {d.time.map((date, i) => (
            <div key={date} className="wx-forecast-day">
              <span className="wx-fday-label">
                {i === 0 ? 'Today' : shortDay(date)}
              </span>
              <span className="wx-fday-icon">{wmoIcon(d.weather_code[i])}</span>
              <span className="wx-fday-rain">
                {d.precipitation_probability_max[i] ?? 0}%
              </span>
              <span className="wx-fday-high">{toDisplay(d.temperature_2m_max[i], unit)}</span>
              <span className="wx-fday-low">{toDisplay(d.temperature_2m_min[i], unit)}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="wx-footer">
        Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </footer>
    </div>
  );
}
