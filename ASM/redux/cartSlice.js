import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // Nếu sản phẩm đã có trong giỏ, tăng số lượng nếu chưa đạt tồn kho
        if (existingItem.quantity < action.payload.stock) {
          existingItem.quantity++;
        }
      } else {
        // Thêm mới sản phẩm vào giỏ hàng
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },
    updateCartQuantity: (state, action) => {
      const item = state.items.find(item => item.id === action.payload.id);
      if (item) {
        // Cập nhật số lượng sản phẩm trong giỏ hàng
        if (action.payload.quantity <= item.stock) {
          item.quantity = action.payload.quantity;
        }
      }
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload.id);
    },
    clearCart: (state) => {
      state.items = [];
    }
  },
});

export const { addToCart, updateCartQuantity, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
