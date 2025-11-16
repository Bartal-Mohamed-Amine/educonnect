import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import resourcesSlice from './slices/resourcesSlice';
import dealsSlice from './slices/dealsSlice';
import communitySlice from './slices/communitySlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    resources: resourcesSlice,
    deals: dealsSlice,
    community: communitySlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;