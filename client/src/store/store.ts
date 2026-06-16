import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import investigationReducer from './investigationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    investigation: investigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
