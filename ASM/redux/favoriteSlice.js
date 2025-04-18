import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadInitialState = async () => {
  try {
    const savedFavorites = await AsyncStorage.getItem('favorites');
    const savedPurchaseCounts = await AsyncStorage.getItem('purchaseCounts');
    return {
      items: savedFavorites ? JSON.parse(savedFavorites) : [],
      purchaseCounts: savedPurchaseCounts ? JSON.parse(savedPurchaseCounts) : {},
    };
  } catch (error) {
    console.error('Error loading favorites:', error);
    return {
      items: [],
      purchaseCounts: {},
    };
  }
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState: {
    items: [],
    purchaseCounts: {},
  },
  reducers: {
    addToFavorites: (state, action) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex === -1) {
        state.items.push(action.payload);
        // Persist to AsyncStorage
        AsyncStorage.setItem('favorites', JSON.stringify(state.items))
          .catch(error => console.error('Error saving favorites:', error));
      }
    },
    removeFromFavorites: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      // Persist to AsyncStorage
      AsyncStorage.setItem('favorites', JSON.stringify(state.items))
        .catch(error => console.error('Error saving favorites:', error));
    },
    updatePurchaseCount: (state, action) => {
      const { productId, count, productData } = action.payload;
      state.purchaseCounts[productId] = count;
      
      if (count >= 2 && !state.items.find(item => item.id === productId) && productData) {
        state.items.push({
          ...productData,
          purchaseCount: count,
        });
      }
      // Persist to AsyncStorage
      AsyncStorage.setItem('purchaseCounts', JSON.stringify(state.purchaseCounts))
        .catch(error => console.error('Error saving purchase counts:', error));
    },
    initializePurchaseCounts: (state, action) => {
      state.purchaseCounts = action.payload;
      AsyncStorage.setItem('purchaseCounts', JSON.stringify(action.payload))
        .catch(error => console.error('Error saving purchase counts:', error));
    },
    loadSavedState: (state, action) => {
      state.items = action.payload.items;
      state.purchaseCounts = action.payload.purchaseCounts;
    },
  },
});

export const { 
  addToFavorites, 
  removeFromFavorites, 
  updatePurchaseCount,
  initializePurchaseCounts,
  loadSavedState
} = favoriteSlice.actions;

// Thunk để load saved state
export const loadFavorites = () => async (dispatch) => {
  const initialState = await loadInitialState();
  dispatch(loadSavedState(initialState));
};

export default favoriteSlice.reducer; 