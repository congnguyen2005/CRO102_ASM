import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import favoriteReducer from './slices/favoriteSlice';
import notificationReducer from './slices/notificationSlice';
import paymentReducer from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    favorites: favoriteReducer,
    notifications: notificationReducer,
    payment: paymentReducer,
  },
});

export default store; 