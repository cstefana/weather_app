import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import itemsReducer from './itemsSlice';
import uiReducer from './uiSlice';

// localStorage persistence
const ITEMS_KEY = 'wx_redux_items';
const UI_KEY    = 'wx_redux_ui';

function loadPersistedState() {
  try {
    const items = localStorage.getItem(ITEMS_KEY);
    const ui    = localStorage.getItem(UI_KEY);
    return {
      items: items ? JSON.parse(items) : undefined,
      // Only restore `unit`; transient fields (forecastPage, showLogin) reset on reload
      ui: ui ? { ...JSON.parse(ui), forecastPage: 0, showLogin: false } : undefined,
    };
  } catch {
    return {};
  }
}

function persistState(state) {
  try {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(state.items));
    localStorage.setItem(UI_KEY, JSON.stringify({ unit: state.ui.unit }));
  } catch {/* storage quota / private mode — silently ignore */}
}

// Store
const preloaded = loadPersistedState();

export const store = configureStore({
  reducer: {
    auth:  authReducer,
    items: itemsReducer,
    ui:    uiReducer,
  },
  preloadedState: preloaded,
});

// throttle writes — at most once per 500 ms
let persistTimer = null;
store.subscribe(() => {
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistState(store.getState());
    persistTimer = null;
  }, 500);
});
