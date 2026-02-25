import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    session: undefined, // undefined = initialising, null = signed out, object = signed in
    role: undefined,    // undefined = fetching, null = no role/user, string = role
  },
  reducers: {
    setSession(state, action) {
      state.session = action.payload;
    },
    setRole(state, action) {
      state.role = action.payload;
    },
  },
});

export const { setSession, setRole } = authSlice.actions;

export const selectSession  = (state) => state.auth.session;
export const selectUserId   = (state) => state.auth.session?.user?.id ?? null;
export const selectIsLoading = (state) => state.auth.session === undefined;
export const selectUserRole = (state) => state.auth.role;

export default authSlice.reducer;
