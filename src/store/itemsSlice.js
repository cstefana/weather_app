import { createSlice } from '@reduxjs/toolkit';

/**
 * Per-user favorites and search history.
 * Shape: { favorites: { [userId]: CityEntry[] }, history: { [userId]: CityEntry[] } }
 * where CityEntry = { label: string, lat: number, lon: number }
 *
 * Persisted to localStorage via the store subscriber in index.js.
 */
const itemsSlice = createSlice({
  name: 'items',
  initialState: {
    favorites: {},
    history: {},
  },
  reducers: {
    toggleFavorite(state, action) {
      const { userId, label, lat, lon } = action.payload;
      if (!userId) return;
      const favs = state.favorites[userId] ?? [];
      const exists = favs.some((f) => f.label === label);
      state.favorites[userId] = exists
        ? favs.filter((f) => f.label !== label)
        : [...favs, { label, lat, lon }];
    },

    removeFavorite(state, action) {
      const { userId, label } = action.payload;
      if (!userId) return;
      state.favorites[userId] = (state.favorites[userId] ?? []).filter(
        (f) => f.label !== label,
      );
    },

    addToHistory(state, action) {
      const { userId, label, lat, lon } = action.payload;
      if (!userId || !label) return;
      const entry = { label, lat, lon };
      const existing = state.history[userId] ?? [];
      state.history[userId] = [
        entry,
        ...existing.filter((h) => h.label !== label),
      ].slice(0, 8);
    },

    clearHistory(state, action) {
      const { userId } = action.payload;
      if (userId) state.history[userId] = [];
    },
  },
});

export const { toggleFavorite, removeFavorite, addToHistory, clearHistory } =
  itemsSlice.actions;

// Parameterised selectors
export const selectFavorites = (userId) => (state) =>
  userId ? (state.items.favorites[userId] ?? []) : [];

export const selectHistory = (userId) => (state) =>
  userId ? (state.items.history[userId] ?? []) : [];

export const selectIsFavorited = (userId, label) => (state) =>
  selectFavorites(userId)(state).some((f) => f.label === label);

export default itemsSlice.reducer;
