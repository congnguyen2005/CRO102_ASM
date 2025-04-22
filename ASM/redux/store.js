// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistReducer, persistStore } from 'redux-persist';
import cartReducer from './cartSlice';
import favoriteReducer from './favoriteSlice';
import notificationReducer from './notificationSlice';
import paymentReducer from './paymentSlice';

// Cấu hình persist cho favorites
const favoritesPersistConfig = {
  key: 'favorites',
  storage: AsyncStorage,
  whitelist: ['items', 'purchaseCounts']
};

// Cấu hình persist cho notifications
const notificationsPersistConfig = {
  key: 'notifications',
  storage: AsyncStorage,
  whitelist: ['notifications']
};

// Tạo persisted reducer
const persistedFavoriteReducer = persistReducer(favoritesPersistConfig, favoriteReducer);
const persistedNotificationReducer = persistReducer(notificationsPersistConfig, notificationReducer);

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    favorites: persistedFavoriteReducer,
    notifications: persistedNotificationReducer,
    payment: paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
