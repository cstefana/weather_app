import { useState, useEffect, useRef } from 'react';
import './Weather.css';
import { wmoLabel, wmoIcon, windDir, shortDay, toDisplay, shortHour, uvLabel } from './weatherUtils';
import { reverseGeocode, fetchForecast, geocodeCity, getCitySuggestions } from './weatherApiUtils';
import { useWeatherStorage } from './useWeatherStorage';

// Component
export default function Weather({ onSignOut, onSignIn, userId }) {
  const [weather, setWeather]   = useState(null);
  const [location, setLocation] = useState('');
  const [currentCoords, setCurrentCoords] = useState(null); // { lat, lon } of displayed location
  const [unit, setUnit]         = useState('celsius'); // 'celsius' | 'fahrenheit'
  const [status, setStatus]     = useState('loading'); // 'loading' | 'idle' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [forecastPage, setForecastPage] = useState(0); // 0 = days 1–7, 1 = days 8–14
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef(null);

  // favorites & history (per-user, localStorage)
  const {
    favorites, history,
    isFavorited, toggleFavorite, removeFavorite,
    addToHistory, clearHistory,
  } = useWeatherStorage(userId);

  const loadFavorite = async (fav) => {
    setLocation(fav.label);
    setCurrentCoords({ lat: fav.lat, lon: fav.lon });
    setStatus('loading');
    try {
      const data = await fetchForecast(fav.lat, fav.lon);
      setWeather(data);
      setStatus('idle');
      setForecastPage(0);
      addToHistory(fav.label, fav.lat, fav.lon);
    } catch {
      setStatus('error');
      setErrorMsg('Failed to fetch weather data. Please try again.');
    }
  };

  // debounced suggestions — no synchronous setState in effect body
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      const results = await getCitySuggestions(searchQuery);
      setSuggestions(results);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const showSuggestions = suggestions.length > 0;

  const handleSuggestionSelect = async (suggestion) => {
    setSuggestions([]);
    setSearchQuery('');
    setSearchError('');
    setLocation(suggestion.label);
    setCurrentCoords({ lat: suggestion.lat, lon: suggestion.lon });
    setStatus('loading');
    try {
      const data = await fetchForecast(suggestion.lat, suggestion.lon);
      setWeather(data);
      setStatus('idle');
      setForecastPage(0);
      addToHistory(suggestion.label, suggestion.lat, suggestion.lon);
    } catch {
      setStatus('error');
      setErrorMsg('Failed to fetch weather data. Please try again.');
    }
  };

  const fetchWeather = async (lat, lon) => {
    setStatus('loading');
    setCurrentCoords({ lat, lon });

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setStatus('loading');
    setSearchError('');
    try {
      const { lat, lon, label } = await geocodeCity(searchQuery.trim());
      setLocation(label);
      setCurrentCoords({ lat, lon });
      const data = await fetchForecast(lat, lon);
      setWeather(data);
      setStatus('idle');
      setForecastPage(0);
      setSearchQuery('');
      addToHistory(label, lat, lon);
    } catch (err) {
      if (err.message === 'City not found') {
        setSearchError('City not found. Try a different name.');
        setStatus(weather ? 'idle' : 'error');
        setErrorMsg('City not found. Try searching above.');
      } else {
        setStatus('error');
        setErrorMsg('Failed to fetch weather data. Please try again.');
      }
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
        <p>Fetching your weather…</p>
        <div className="wx-spinner" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="wx-page wx-error-page">
        <form className="wx-search" onSubmit={handleSearch}>
          <div className="wx-search-wrapper">
            <input
              className="wx-search-input"
              type="text"
              placeholder="Search city…"
              value={searchQuery}
              autoComplete="off"
              onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
              onFocus={() => {}}
              onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            />
            {showSuggestions && (
              <ul className="wx-suggestions">
                {suggestions.map((s) => (
                  <li key={s.id} className="wx-suggestion-item" onMouseDown={() => handleSuggestionSelect(s)}>
                    {s.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="wx-search-btn" type="submit">🔍</button>
        </form>
        {searchError && <p className="wx-search-error">{searchError}</p>}
        <p className="wx-error-msg">⚠️ {errorMsg}</p>
        <button className="wx-retry-btn" onClick={requestLocation}>Use My Location</button>
      </div>
    );
  }



  if (!weather) return null;

  const c  = weather.current;
  const d  = weather.daily;
  const h  = weather.hourly;
  const isDay = c.is_day === 1;

  // Find current hour in hourly array
  const currentHourPrefix = c.time.slice(0, 13);
  const currentHourIdx = Math.max(0, h.time.findIndex(t => t.slice(0, 13) === currentHourPrefix));
  const uvIndex = Math.round(h.uv_index?.[currentHourIdx] ?? 0);

  // Next 24 hours for the strip
  const hourlyWindow = h.time.slice(currentHourIdx, currentHourIdx + 24).map((t, i) => ({
    time: t,
    temp: h.temperature_2m[currentHourIdx + i],
    code: h.weather_code[currentHourIdx + i],
  }));

  return (
    <>
    <div className={`wx-page ${isDay ? 'wx-day' : 'wx-night'}`}>
      {/* Search */}
      <form className="wx-search" onSubmit={handleSearch}>
        <div className="wx-search-wrapper">
          <input
            className="wx-search-input"
            type="text"
            placeholder="Search city…"
            value={searchQuery}
            autoComplete="off"
            onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
            onFocus={() => {}}
            onBlur={() => setTimeout(() => setSuggestions([]), 150)}
          />
          {showSuggestions && (
            <ul className="wx-suggestions">
              {suggestions.map((s) => (
                <li key={s.id} className="wx-suggestion-item" onMouseDown={() => handleSuggestionSelect(s)}>
                  {s.label}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="wx-search-btn" type="submit">🔍</button>
        <button
          type="button"
          className="wx-search-locate-btn"
          title="Use my location"
          onClick={() => { setSearchQuery(''); setSearchError(''); requestLocation(); }}
        >
          📍
        </button>
      </form>
      {searchError && <p className="wx-search-error">{searchError}</p>}

      {/* Favorites bar — logged-in only */}
      {userId && favorites.length > 0 && (
        <div className="wx-favorites-bar">
          <span className="wx-favorites-label">⭐ Saved</span>
          {favorites.map(fav => (
            <div
              key={fav.label}
              className={`wx-fav-chip${fav.label === location ? ' wx-fav-chip--active' : ''}`}
            >
              <button
                className="wx-fav-chip-name"
                onClick={() => loadFavorite(fav)}
              >
                {fav.label}
              </button>
              <button
                className="wx-fav-chip-remove"
                title="Remove from favorites"
                onClick={() => removeFavorite(fav.label)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="wx-left">
      <div className="wx-location">
          <span className="wx-location-icon">📍</span>
          <span className="wx-location-name">{location}</span>
          {userId && (
            <button
              className={`wx-fav-toggle${isFavorited(location) ? ' wx-fav-toggle--active' : ''}`}
              onClick={() => toggleFavorite(location, currentCoords)}
              title={isFavorited(location) ? 'Remove from favorites' : 'Add to favorites'}
              disabled={!currentCoords}
            >
              {isFavorited(location) ? '⭐' : '☆'}
            </button>
          )}
          <button
            className="wx-unit-toggle"
            onClick={() => setUnit(unit === 'celsius' ? 'fahrenheit' : 'celsius')}
          >
            {unit === 'celsius' ? '°F' : '°C'}
          </button>
          {onSignOut && (
            <button className="wx-signout-btn" onClick={onSignOut} title="Sign out">
              Sign Out
            </button>
          )}
          {onSignIn && (
            <button className="wx-signout-btn" onClick={onSignIn} title="Sign in">
              Sign In
            </button>
          )}
      </div>
      <section className="wx-current">
        <div className="wx-main-icon">{wmoIcon(c.weather_code)}</div>
        <div className="wx-temp">{toDisplay(c.temperature_2m, unit)}</div>
        <div className="wx-condition">{wmoLabel(c.weather_code)}</div>
        <div className="wx-feels">Feels like {toDisplay(c.apparent_temperature, unit)}</div>
      </section>

      {/* Stats grid */}
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
        <div className="wx-stat">
          <span className="wx-stat-icon">💨</span>
          <span className="wx-stat-value">{Math.round(c.wind_gusts_10m)} km/h</span>
          <span className="wx-stat-label">Wind Gusts</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">🌡️</span>
          <span className="wx-stat-value">{Math.round(c.surface_pressure)} hPa</span>
          <span className="wx-stat-label">Pressure</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">👁️</span>
          <span className="wx-stat-value">{(c.visibility / 1000).toFixed(0)} km</span>
          <span className="wx-stat-label">Visibility</span>
        </div>
        <div className="wx-stat">
          <span className="wx-stat-icon">🔆</span>
          <span className="wx-stat-value">{uvIndex} <span className="wx-stat-sublabel">{uvLabel(uvIndex)}</span></span>
          <span className="wx-stat-label">UV Index</span>
        </div>
      </section>
      </div>{/* end wx-left */}

      <div className="wx-right">
      {/* ── Hourly strip ── */}
      <section className="wx-hourly">
        <h2 className="wx-hourly-title">Next 24 Hours</h2>
        <div className="wx-hourly-scroll">
          {hourlyWindow.map((item, i) => (
            <div key={item.time} className="wx-hourly-item">
              <span className="wx-hourly-time">{i === 0 ? 'Now' : shortHour(item.time)}</span>
              <span className="wx-hourly-icon">{wmoIcon(item.code)}</span>
              <span className="wx-hourly-temp">{toDisplay(item.temp, unit)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 14-day forecast */}
      <section className="wx-forecast">
        <div className="wx-forecast-header">
          <h2 className="wx-forecast-title">14-Day Forecast</h2>
          <div className="wx-forecast-pagination">
            <button
              className={`wx-page-btn${forecastPage === 0 ? ' wx-page-btn--active' : ''}`}
              onClick={() => setForecastPage(0)}
            >
              Days 1-7
            </button>
            <button
              className={`wx-page-btn${forecastPage === 1 ? ' wx-page-btn--active' : ''}`}
              onClick={() => setForecastPage(1)}
            >
              Days 8-14
            </button>
          </div>
        </div>
        
        <div className="wx-forecast-labels">
          <span>Day</span>
          <span></span>
          <span>Rain</span>
          <span>Wind</span>
          <span>Sunrise - sunset</span>
          <span className="wx-text-right">High</span>
          <span className="wx-text-right">Low</span>
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
                  💧 {d.precipitation_probability_max[i] ?? 0}%
                </span>
                <span className="wx-fday-wind">
                  💨 {d.wind_speed_10m_max && d.wind_speed_10m_max[i] ? Math.round(d.wind_speed_10m_max[i]) : 0} <small>km/h</small>
                </span>
                <div className="wx-fday-sun">
                  <span>☀️ {d.sunrise && d.sunrise[i] ? d.sunrise[i].slice(11, 16) : '--:--'}</span>
                  <span>🌑 {d.sunset && d.sunset[i] ? d.sunset[i].slice(11, 16) : '--:--'}</span>
                </div>
                <span className="wx-fday-high">{toDisplay(d.temperature_2m_max[i], unit)}</span>
                <span className="wx-fday-low">{toDisplay(d.temperature_2m_min[i], unit)}</span>
              </div>
            );
          })}
        </div>
      </section>

      </div>{/* end wx-right */}

      {/* Search history — in-page section */}
      {userId && history.length > 0 && (
        <div className="wx-history">
          <div className="wx-history-header">
            <span>🕐 Recent searches</span>
            <button className="wx-history-clear" onClick={clearHistory}>Clear</button>
          </div>
          <div className="wx-history-items">
            {history.map((item) => (
              <button
                key={item.label}
                className="wx-history-item"
                onClick={() => loadFavorite(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="wx-footer">
        Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </footer>
    </div>
  </>
  );
}
