import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchForecast, geocodeCity, getCitySuggestions } from '../utils/weatherApiUtils';
import {
  toggleFavorite as toggleFavoriteAction,
  removeFavorite as removeFavoriteAction,
  addToHistory as addToHistoryAction,
  clearHistory as clearHistoryAction,
  selectFavorites,
  selectHistory,
} from '../../store/itemsSlice';
import {
  toggleUnit,
  setForecastPage as setForecastPageAction,
  selectUnit,
  selectForecastPage,
} from '../../store/uiSlice';
import { selectUserRole } from '../../store/authSlice';

export function useWeather(userId) {
  const [weather, setWeather]         = useState(null);
  const [location, setLocation]       = useState('');
  const [currentCoords, setCurrentCoords] = useState(null);
  const [status, setStatus]           = useState('idle'); // 'loading' | 'idle' | 'error'
  const [errorMsg, setErrorMsg]       = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [favView, setFavView]         = useState('cards'); // 'cards' | 'table'
  const [histView, setHistView]       = useState('cards'); // 'cards' | 'table'
  const [localTime, setLocalTime]     = useState('');
  const debounceRef = useRef(null);

  // Redux
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const unit         = useSelector(selectUnit);
  const forecastPage = useSelector(selectForecastPage);
  const favorites    = useSelector(selectFavorites(userId));
  const history      = useSelector(selectHistory(userId));
  const userRole     = useSelector(selectUserRole);

  const isFavorited = (label) => favorites.some((f) => f.label === label);

  // Data fetchers

  const loadFavorite = async (fav) => {
    setLocation(fav.label);
    setCurrentCoords({ lat: fav.lat, lon: fav.lon });
    setStatus('loading');
    try {
      const data = await fetchForecast(fav.lat, fav.lon);
      setWeather(data);
      setStatus('idle');
      dispatch(setForecastPageAction(0));
      dispatch(addToHistoryAction({ userId, label: fav.label, lat: fav.lat, lon: fav.lon }));
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
      dispatch(setForecastPageAction(0));
      setSearchQuery('');
      dispatch(addToHistoryAction({ userId, label, lat, lon }));
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
      dispatch(setForecastPageAction(0));
      dispatch(addToHistoryAction({ userId, label: suggestion.label, lat: suggestion.lat, lon: suggestion.lon }));
    } catch {
      setStatus('error');
      setErrorMsg('Failed to fetch weather data. Please try again.');
    }
  };

  // Effects

  // Live local clock
  useEffect(() => {
    const tz = weather?.timezone;
    const fmt = tz ? new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }) : null;
    const tick = () => setLocalTime(fmt ? fmt.format(new Date()) : '');
    const t0 = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearInterval(id); clearTimeout(t0); };
  }, [weather?.timezone]);

  // Debounced autocomplete suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (searchQuery.trim().length < 3) { setSuggestions([]); return; }
      const results = await getCitySuggestions(searchQuery);
      setSuggestions(results);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  // Wrapped action dispatchers

  const toggleFav      = (label, lat, lon) => dispatch(toggleFavoriteAction({ userId, label, lat, lon }));
  const removeFav      = (label)            => dispatch(removeFavoriteAction({ userId, label }));
  const clearHist      = ()                 => dispatch(clearHistoryAction({ userId }));
  const setForecastP   = (p)                => dispatch(setForecastPageAction(p));
  const toggleTempUnit = ()                 => dispatch(toggleUnit());

  return {
    // weather data
    weather, status, errorMsg,
    // location
    location, localTime, currentCoords,
    // search
    searchQuery, setSearchQuery,
    searchError, setSearchError,
    suggestions, setSuggestions,
    handleSearch, handleSuggestionSelect,
    // redux state
    unit, forecastPage, favorites, history, userRole,
    isFavorited,
    // action handlers
    loadFavorite, toggleFav, removeFav, clearHist, setForecastP, toggleTempUnit,
    // view state
    favView, setFavView, histView, setHistView,
    // navigation
    navigate,
  };
}
