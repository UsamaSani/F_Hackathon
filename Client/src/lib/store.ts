import { configureStore } from '@reduxjs/toolkit';
import reportReducer from './slices/reportSlice';
import familyReducer from './slices/familySlice';

export const store = configureStore({
  reducer: {
    reports: reportReducer,
    family: familyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;