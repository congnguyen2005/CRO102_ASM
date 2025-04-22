import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bankingInfo: {
    bankName: 'MB BANK',
    accountNumber: '3316102005',
    accountName: 'ĐẶNG CÔNG NGUYÊN',
    content: 'THANHTOAN',
    bankCode: 'MB',
    appScheme: 'mbmobile://', // Scheme để mở app MB Bank
    appPackage: 'com.mbmobile', // Package name của app MB Bank
    appStore: {
      android: 'https://play.google.com/store/apps/details?id=com.mbmobile',
      ios: 'https://apps.apple.com/vn/app/mb-bank/id1205807363'
    },
    qrTemplate: 'mbbank://qr?data={amount}_{content}' // Template để tạo mã QR
  },
  // Danh sách các ngân hàng được hỗ trợ
  supportedBanks: [
    {
      code: 'MB',
      name: 'MB Bank',
      appScheme: 'mbmobile://',
      appPackage: 'com.mbmobile',
      appStore: {
        android: 'https://play.google.com/store/apps/details?id=com.mbmobile',
        ios: 'https://apps.apple.com/vn/app/mb-bank/id1205807363'
      }
    },
    {
      code: 'VCB',
      name: 'Vietcombank',
      appScheme: 'vietcombank://',
      appPackage: 'com.VCB',
      appStore: {
        android: 'https://play.google.com/store/apps/details?id=com.VCB',
        ios: 'https://apps.apple.com/vn/app/vcb-digibank/id1205075549'
      }
    },
    {
      code: 'BIDV',
      name: 'BIDV',
      appScheme: 'bidv://',
      appPackage: 'com.bidv.smartbanking',
      appStore: {
        android: 'https://play.google.com/store/apps/details?id=com.bidv.smartbanking',
        ios: 'https://apps.apple.com/vn/app/bidv-smartbanking/id1061867449'
      }
    },
    // Thêm các ngân hàng khác nếu cần
  ],
  transactions: [],
  pendingOrders: [],
  completedOrders: []
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    addPendingOrder: (state, action) => {
      state.pendingOrders.push({
        ...action.payload,
        status: 'pending',
        orderId: `ORDER${Date.now()}`,
        createdAt: new Date().toISOString()
      });
    },
    addTransaction: (state, action) => {
      state.transactions.push({
        ...action.payload,
        transactionId: `TXN${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    },
    updateOrderStatus: (state, action) => {
      const { orderId, status } = action.payload;
      const orderIndex = state.pendingOrders.findIndex(order => order.orderId === orderId);
      
      if (orderIndex !== -1) {
        if (status === 'completed') {
          const completedOrder = {
            ...state.pendingOrders[orderIndex],
            status: 'completed',
            completedAt: new Date().toISOString()
          };
          state.completedOrders.push(completedOrder);
          state.pendingOrders.splice(orderIndex, 1);
        } else {
          state.pendingOrders[orderIndex].status = status;
        }
      }
    },
    updateBankingInfo: (state, action) => {
      state.bankingInfo = {
        ...state.bankingInfo,
        ...action.payload
      };
    },
    // Thêm action để chuyển đổi ngân hàng
    switchBank: (state, action) => {
      const bankCode = action.payload;
      const selectedBank = state.supportedBanks.find(bank => bank.code === bankCode);
      if (selectedBank) {
        state.bankingInfo = {
          ...state.bankingInfo,
          bankName: selectedBank.name,
          bankCode: selectedBank.code,
          appScheme: selectedBank.appScheme,
          appPackage: selectedBank.appPackage,
          appStore: selectedBank.appStore
        };
      }
    }
  }
});

export const { 
  addPendingOrder, 
  addTransaction, 
  updateOrderStatus,
  updateBankingInfo,
  switchBank
} = paymentSlice.actions;

export default paymentSlice.reducer; 