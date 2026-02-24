import { useState, useEffect } from 'react';
import './Weather.css';
import { wmoLabel, wmoIcon, windDir, shortDay, toDisplay } from './weatherUtils';
import { reverseGeocode, fetchForecast } from './weatherApiUtils';

// Component
export default function Weather() {
  const [weather, setWeather]   = useState(null);
  const [location, setLocation] = useState('');
  const [unit, setUnit]         = useState('celsius'); // 'celsius' | 'fahrenheit'
  const [status, setStatus]     = useState('loading'); // 'loading' | 'idle' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [forecastPage, setForecastPage] = useState(0); // 0 = days 1–7, 1 = days 8–14

  const fetchWeather = async (lat, lon) => {
    setStatus('loading');

    reverseGeocode(lat, lon)
      .then(setLocation)
      .catch(() => setLocation('Your Location'));

    try {
      const data = await fetchForecast(lat, lon);
      setWeather(data);
      setStatus('idle');
    } catch {
      setStatus('error');
      setErrorMsg('Failed to fetch weather data. Please try again.');
    }
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

      {/* ── 14-day forecast ── */}
      <section className="wx-forecast">
        <div className="wx-forecast-header">
          <h2 className="wx-forecast-title">14-Day Forecast</h2>
          <div className="wx-forecast-pagination">
            <button
              className={`wx-page-btn${forecastPage === 0 ? ' wx-page-btn--active' : ''}`}
              onClick={() => setForecastPage(0)}
            >
              Days 1–7
            </button>
            <button
              className={`wx-page-btn${forecastPage === 1 ? ' wx-page-btn--active' : ''}`}
              onClick={() => setForecastPage(1)}
            >
              Days 8–14
            </button>
          </div>
        </div>
        <div className="wx-forecast-scroll">
          {d.time.slice(forecastPage * 7, forecastPage * 7 + 7).map((date, idx) => {
            const i = forecastPage * 7 + idx;
            return (
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
            );
          })}
        </div>
      </section>

      <footer className="wx-footer">
        Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </footer>
    </div>
  );
}
