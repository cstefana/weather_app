// forward geocode: city name -> { lat, lon, label }
export async function geocodeCity(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const results = await res.json();
  if (!results.length) throw new Error('City not found');
  const { lat, lon, address } = results[0];
  const city =
    address?.city ||
    address?.town ||
    address?.village ||
    address?.county ||
    'Unknown';
  const country = address?.country ?? '';
  const label = `${city}${country ? ', ' + country : ''}`;
  return { lat: parseFloat(lat), lon: parseFloat(lon), label };
}

// reverse geocode: coords -> city/country string
export async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const geo = await res.json();
  const city =
    geo.address?.city ||
    geo.address?.town ||
    geo.address?.village ||
    geo.address?.county ||
    'Your Location';
  const country = geo.address?.country ?? '';
  return `${city}${country ? ', ' + country : ''}`;
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
    ].join(','),
    daily: [
      'weather_code', 'temperature_2m_max', 'temperature_2m_min',
      'precipitation_probability_max',
    ].join(','),
    timezone: 'auto',
    forecast_days: 14,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('API error');
  return res.json();
}

// fetch city suggestions as the user types
const PLACE_TYPES = new Set(['city', 'town', 'village', 'hamlet', 'municipality', 'administrative']);

export async function getCitySuggestions(query) {
  if (query.length < 3) return [];

  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=10`,
    { headers: { 'Accept-Language': 'en' } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  const q = query.trim().toLowerCase();

  const seen = new Set();
  const results = [];

  for (const item of data) {
    // only keep actual settlements
    if (item.class !== 'place' && item.class !== 'boundary') continue;
    if (!PLACE_TYPES.has(item.type)) continue;

    const city =
      item.address?.city ||
      item.address?.town ||
      item.address?.village ||
      item.address?.county ||
      'Unknown';
    const country = item.address?.country ?? '';
    const label = `${city}${country ? ', ' + country : ''}`;

    // only suggest if the city name starts with the query
    if (!city.toLowerCase().startsWith(q)) continue;

    // deduplicate by label
    if (seen.has(label)) continue;
    seen.add(label);

    results.push({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), label, id: item.place_id });
    if (results.length === 5) break;
  }

  return results;
}