import { useState } from 'react';

// helpers

function readStorage(key) {
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key)) ?? []; }
  catch { return []; }
}

function writeStorage(key, value) {
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(value));
}

// hook 

export function useWeatherStorage(userId) {
  const storageKey = userId ? `wx_favorites_${userId}` : null;
  const historyKey = userId ? `wx_history_${userId}` : null;

  const [favorites, setFavorites] = useState(() => readStorage(storageKey));
  const [history,   setHistory]   = useState(() => readStorage(historyKey));

  // favorites

  const isFavorited = (location) => favorites.some(f => f.label === location);

  const toggleFavorite = (location, currentCoords) => {
    if (!currentCoords || !location || !storageKey) return;
    const updated = isFavorited(location)
      ? favorites.filter(f => f.label !== location)
      : [...favorites, { label: location, lat: currentCoords.lat, lon: currentCoords.lon }];
    setFavorites(updated);
    writeStorage(storageKey, updated);
  };

  const removeFavorite = (label) => {
    const updated = favorites.filter(f => f.label !== label);
    setFavorites(updated);
    writeStorage(storageKey, updated);
  };

  // history

  const addToHistory = (label, lat, lon) => {
    if (!historyKey || !label) return;
    const entry = { label, lat, lon };
    const updated = [entry, ...history.filter(h => h.label !== label)].slice(0, 8);
    setHistory(updated);
    writeStorage(historyKey, updated);
  };

  const clearHistory = () => {
    setHistory([]);
    if (historyKey) localStorage.removeItem(historyKey);
  };

  return {
    favorites,
    history,
    isFavorited,
    toggleFavorite,
    removeFavorite,
    addToHistory,
    clearHistory,
  };
}
