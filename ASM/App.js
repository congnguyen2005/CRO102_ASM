  import React from 'react';
  import { Provider } from 'react-redux';
  import { store } from './redux/store';
  import { NavigationContainer } from '@react-navigation/native';
  import AppNavigator from './navigator/appNavigator';
  import { CartProvider } from './screens/CartContext';
  import { SafeAreaProvider } from 'react-native-safe-area-context';

  export default function App() {
    return (
      <Provider store={store}>
        <SafeAreaProvider>
          <CartProvider>
              <AppNavigator />
          </CartProvider>
        </SafeAreaProvider>
      </Provider>
    );
  }