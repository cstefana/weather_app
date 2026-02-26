import { wmoIcon, toDisplay, shortHour, shortDay } from '../utils/weatherUtils';

export default function ForecastPanel({ hourlyWindow, daily, unit, forecastPage, onSetForecastPage }) {
  const d = daily;

  return (
    <>
      {/* Hourly strip */}
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
              onClick={() => onSetForecastPage(0)}
            >
              Days 1-7
            </button>
            <button
              className={`wx-page-btn${forecastPage === 1 ? ' wx-page-btn--active' : ''}`}
              onClick={() => onSetForecastPage(1)}
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
                <span className="wx-fday-label">{i === 0 ? 'Today' : shortDay(date)}</span>
                <span className="wx-fday-icon">{wmoIcon(d.weather_code[i])}</span>
                <span className="wx-fday-rain">
                  💧 {d.precipitation_probability_max[i] ?? 0}%
                </span>
                <span className="wx-fday-wind">
                  💨 {d.wind_speed_10m_max?.[i] ? Math.round(d.wind_speed_10m_max[i]) : 0} <small>km/h</small>
                </span>
                <div className="wx-fday-sun">
                  <span>☀️ {d.sunrise?.[i] ? d.sunrise[i].slice(11, 16) : '--:--'}</span>
                  <span>🌑 {d.sunset?.[i]  ? d.sunset[i].slice(11, 16)  : '--:--'}</span>
                </div>
                <span className="wx-fday-high">{toDisplay(d.temperature_2m_max[i], unit)}</span>
                <span className="wx-fday-low">{toDisplay(d.temperature_2m_min[i], unit)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
