import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  orders: [],
  currentOrder: null,
  paymentMethods: [
    { id: 'cod', name: 'Thanh toán khi nhận hàng' },
    { id: 'banking', name: 'Chuyển khoản ngân hàng' },
  ],
  selectedPaymentMethod: 'cod',
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },
    addOrder: (state, action) => {
      state.orders.push({
        id: Date.now(),
        ...action.payload,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
      }
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
});

export const { setCurrentOrder, setPaymentMethod, addOrder, updateOrderStatus, clearCurrentOrder } = paymentSlice.actions;
export default paymentSlice.reducer; 