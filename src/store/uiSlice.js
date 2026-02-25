import { createSlice } from '@reduxjs/toolkit';

/**
 * UI preferences and transient view state.
 * `unit` is persisted to localStorage via the store subscriber in index.js.
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    unit: 'celsius',      // 'celsius' | 'fahrenheit' — persisted
    forecastPage: 0,      // 0 = days 1-7, 1 = days 8-14
    showLogin: false,     // login modal visible
  },
  reducers: {
    toggleUnit(state) {
      state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    },
    setUnit(state, action) {
      state.unit = action.payload;
    },
    setForecastPage(state, action) {
      state.forecastPage = action.payload;
    },
    setShowLogin(state, action) {
      state.showLogin = action.payload;
    },
  },
});

export const { toggleUnit, setUnit, setForecastPage, setShowLogin } = uiSlice.actions;

export const selectUnit        = (state) => state.ui.unit;
export const selectForecastPage = (state) => state.ui.forecastPage;
export const selectShowLogin   = (state) => state.ui.showLogin;

export default uiSlice.reducer;
