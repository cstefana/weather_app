// WMO Weather interpretation codes
export const WMO_DESCRIPTIONS = {
  0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Rime Fog',
  51: 'Light Drizzle', 53: 'Moderate Drizzle', 55: 'Dense Drizzle',
  56: 'Freezing Drizzle', 57: 'Heavy Freezing Drizzle',
  61: 'Slight Rain', 63: 'Moderate Rain', 65: 'Heavy Rain',
  66: 'Freezing Rain', 67: 'Heavy Freezing Rain',
  71: 'Slight Snow', 73: 'Moderate Snow', 75: 'Heavy Snow', 77: 'Snow Grains',
  80: 'Slight Showers', 81: 'Moderate Showers', 82: 'Violent Showers',
  85: 'Snow Showers', 86: 'Heavy Snow Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm w/ Hail', 99: 'Heavy Thunderstorm',
};

export const WMO_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  56: '🌨️', 57: '🌨️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  66: '🌨️', 67: '🌨️',
  71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  85: '🌨️', 86: '🌨️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

export const wmoLabel = (code) => WMO_DESCRIPTIONS[code] ?? 'Unknown';
export const wmoIcon  = (code) => WMO_ICONS[code] ?? '🌡️';

// Wind direction degrees -> cardinal
export const windDir = (deg) => {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(deg / 45) % 8];
};

// Short weekday from ISO date string
export const shortDay = (iso) =>
  new Date(iso + 'T12:00').toLocaleDateString('en-US', { weekday: 'short' });

// Temperature unit conversion
export const toDisplay = (celsius, unit) =>
  unit === 'celsius'
    ? `${Math.round(celsius)}°C`
    : `${Math.round(celsius * 9 / 5 + 32)}°F`;

// short hour label from ISO datetime string (avoids timezone parsing issues)
export const shortHour = (iso) => {
  const h = parseInt(iso.slice(11, 13), 10);
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
};

// UV index -> risk label
export const uvLabel = (uv) => {
  if (uv <= 2) return 'Low';
  if (uv <= 5) return 'Moderate';
  if (uv <= 7) return 'High';
  if (uv <= 10) return 'Very High';
  return 'Extreme';
};
