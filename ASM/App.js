import React, { useEffect } from "react";
import { CartProvider } from "./screens/CartContext";
import AppNavigator from "./navigator/appNavigator";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';
import { configureNotifications, requestPermissions } from './services/notificationService';

// Tạm thời bỏ PersistGate để test
const App = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      await configureNotifications();
      await requestPermissions();
    };
    setupNotifications();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;