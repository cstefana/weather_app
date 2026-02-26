import './Weather.css';
import { useWeather } from './hooks/useWeather';
import SearchBar from './components/SearchBar';
import CurrentWeather from './components/CurrentWeather';
import ForecastPanel from './components/ForecastPanel';
import FavoritesBar from './components/FavoritesBar';
import HistorySection from './components/HistorySection';

export default function Weather({ onSignOut, onSignIn, userId }) {
  const wx = useWeather(userId);

  // Loading / error states

  if (!wx.weather) {
    return (
      <div className="wx-page wx-idle">
        <SearchBar
          searchQuery={wx.searchQuery}       setSearchQuery={wx.setSearchQuery}
          searchError={wx.searchError}       setSearchError={wx.setSearchError}
          suggestions={wx.suggestions}       setSuggestions={wx.setSuggestions}
          handleSearch={wx.handleSearch}
          handleSuggestionSelect={wx.handleSuggestionSelect}
          blurDelay={100}
        />

        <div className="wx-idle-actions">
          {onSignOut && (
            <button className="wx-signout-btn" onClick={onSignOut}>Sign Out</button>
          )}
          {onSignIn && (
            <button className="wx-signout-btn" onClick={onSignIn}>Sign In</button>
          )}
          {wx.userRole === 'admin' && (
            <button className="wx-signout-btn" onClick={() => wx.navigate('/dashboard')}>Dashboard</button>
          )}
          <button className="wx-signout-btn" onClick={() => wx.navigate('/contact')}>Contact</button>
        </div>

        {wx.status === 'loading' && <div className="wx-spinner" />}
        {wx.status === 'error' && <p className="wx-error-msg">⚠️ {wx.errorMsg}</p>}
      </div>
    );
  }

  // Derived data 

  const c    = wx.weather.current;
  const d    = wx.weather.daily;
  const h    = wx.weather.hourly;
  const isDay = c.is_day === 1;

  const currentHourPrefix = c.time.slice(0, 13);
  const currentHourIdx    = Math.max(0, h.time.findIndex((t) => t.slice(0, 13) === currentHourPrefix));
  const uvIndex           = Math.round(h.uv_index?.[currentHourIdx] ?? 0);

  const hourlyWindow = h.time.slice(currentHourIdx, currentHourIdx + 24).map((t, i) => ({
    time: t,
    temp: h.temperature_2m[currentHourIdx + i],
    code: h.weather_code[currentHourIdx + i],
  }));

  // Main render

  return (
    <div className={`wx-page ${isDay ? 'wx-day' : 'wx-night'}`}>

      <SearchBar
        searchQuery={wx.searchQuery}       setSearchQuery={wx.setSearchQuery}
        searchError={wx.searchError}       setSearchError={wx.setSearchError}
        suggestions={wx.suggestions}       setSuggestions={wx.setSuggestions}
        handleSearch={wx.handleSearch}
        handleSuggestionSelect={wx.handleSuggestionSelect}
      />

      <FavoritesBar
        userId={userId}
        favorites={wx.favorites}
        activeLocation={wx.location}
        favView={wx.favView}             setFavView={wx.setFavView}
        onLoad={wx.loadFavorite}
        onRemove={wx.removeFav}
      />

      <div className="wx-left">
        <CurrentWeather
          current={c}
          uvIndex={uvIndex}
          unit={wx.unit}
          location={wx.location}
          localTime={wx.localTime}
          currentCoords={wx.currentCoords}
          userId={userId}
          isFavorited={wx.isFavorited}
          onToggleFav={wx.toggleFav}
          onToggleUnit={wx.toggleTempUnit}
          onSignOut={onSignOut}
          onSignIn={onSignIn}
          userRole={wx.userRole}
          navigate={wx.navigate}
        />
      </div>

      <div className="wx-right">
        <ForecastPanel
          hourlyWindow={hourlyWindow}
          daily={d}
          unit={wx.unit}
          forecastPage={wx.forecastPage}
          onSetForecastPage={wx.setForecastP}
        />
      </div>

      <HistorySection
        userId={userId}
        history={wx.history}
        histView={wx.histView}           setHistView={wx.setHistView}
        onLoad={wx.loadFavorite}
        onClear={wx.clearHist}
      />

      <footer className="wx-footer">
        Data provided by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a>
      </footer>

    </div>
  );
}
