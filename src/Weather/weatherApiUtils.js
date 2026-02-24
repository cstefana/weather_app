// forward geocode: city name -> { lat, lon, label }
export async function geocodeCity(query) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error('City not found');
  
  const place = data.results[0];
  const label = `${place.name}${place.country ? ', ' + place.country : ''}`;
  return { lat: place.latitude, lon: place.longitude, label };
}

// reverse geocode: coords -> city/country string
// using BigDataCloud's free client-side API as a fallback for CORS issues
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const geo = await res.json();
    const city = geo.city || geo.locality || 'Your Location';
    const country = geo.countryName || '';
    return `${city}${country ? ', ' + country : ''}`;
  } catch (e) {
    console.error('Reverse geocode failed', e);
    return 'Your Location';
  }
}

//  14 days forecast
export async function fetchForecast(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m', 'relative_humidity_2m', 'apparent_temperature',
      'is_day', 'precipitation', 'weather_code', 'cloud_cover',
      'wind_speed_10m', 'wind_direction_10m',
      'wind_gusts_10m', 'surface_pressure', 'visibility',
    ].join(','),
    hourly: [
      'temperature_2m', 'weather_code', 'is_day', 'uv_index',
    ].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise', 'sunset', 'uv_index_max', 'wind_speed_10m_max'
    ].join(','),
    timezone: 'auto',
    forecast_days: 14,
    forecast_hours: 48,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

// fetch city suggestions as the user types
export async function getCitySuggestions(query) {
  if (query.length < 3) return [];

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );

  if (!res.ok) return [];

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map((item) => {
    const label = `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`;
    return {
      lat: item.latitude,
      lon: item.longitude,
      label,
      id: item.id
    };
  });
}