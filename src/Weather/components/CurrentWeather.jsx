import { wmoIcon, wmoLabel, windDir, toDisplay, uvLabel } from '../utils/weatherUtils';

export default function CurrentWeather({
  current, uvIndex, unit,
  location, localTime, currentCoords,
  userId, isFavorited, onToggleFav, onToggleUnit,
  onSignOut, onSignIn, userRole, navigate,
}) {
  const c = current;

  return (
    <>
      <div className="wx-location">
        <span className="wx-location-icon">📍</span>
        <span className="wx-location-name-wrap">
          <span className="wx-location-name">{location}</span>
          {localTime && <span className="wx-local-time">{localTime}</span>}
        </span>
        {userId && (
          <button
            className={`wx-fav-toggle${isFavorited(location) ? ' wx-fav-toggle--active' : ''}`}
            onClick={() => onToggleFav(location, currentCoords?.lat, currentCoords?.lon)}
            title={isFavorited(location) ? 'Remove from favorites' : 'Add to favorites'}
            disabled={!currentCoords}
          >
            {isFavorited(location) ? '⭐' : '☆'}
          </button>
        )}
        <button className="wx-unit-toggle" onClick={onToggleUnit}>
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
        {userRole === 'admin' && (
          <button className="wx-signout-btn" onClick={() => navigate('/dashboard')} title="Dashboard">
            Dashboard
          </button>
        )}
        <button className="wx-signout-btn" onClick={() => navigate('/contact')} title="Contact">
          Contact
        </button>
      </div>

      <section className="wx-current">
        <div className="wx-main-icon">{wmoIcon(c.weather_code)}</div>
        <div className="wx-temp">{toDisplay(c.temperature_2m, unit)}</div>
        <div className="wx-condition">{wmoLabel(c.weather_code)}</div>
        <div className="wx-feels">Feels like {toDisplay(c.apparent_temperature, unit)}</div>
      </section>

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
          <span className="wx-stat-value">
            {uvIndex} <span className="wx-stat-sublabel">{uvLabel(uvIndex)}</span>
          </span>
          <span className="wx-stat-label">UV Index</span>
        </div>
      </section>
    </>
  );
}
