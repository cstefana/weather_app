import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    session: undefined, // undefined = initialising, null = signed out, object = signed in
  },
  reducers: {
    setSession(state, action) {
      state.session = action.payload;
    },
  },
});

export const { setSession } = authSlice.actions;

export const selectSession  = (state) => state.auth.session;
export const selectUserId   = (state) => state.auth.session?.user?.id ?? null;
export const selectIsLoading = (state) => state.auth.session === undefined;

export default authSlice.reducer;
