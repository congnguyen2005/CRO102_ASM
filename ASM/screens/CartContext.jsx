import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [purchaseCounts, setPurchaseCounts] = useState({});

  // Load order history and purchase counts from AsyncStorage when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedHistory, savedCounts] = await Promise.all([
          AsyncStorage.getItem('orderHistory'),
          AsyncStorage.getItem('purchaseCounts')
        ]);
        
        if (savedHistory) {
          setOrderHistory(JSON.parse(savedHistory));
        }
        if (savedCounts) {
          setPurchaseCounts(JSON.parse(savedCounts));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Save order history and purchase counts to AsyncStorage whenever they change
  useEffect(() => {
    const saveData = async () => {
      try {
        await Promise.all([
          AsyncStorage.setItem('orderHistory', JSON.stringify(orderHistory)),
          AsyncStorage.setItem('purchaseCounts', JSON.stringify(purchaseCounts))
        ]);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    saveData();
  }, [orderHistory, purchaseCounts]);

  // Thêm sản phẩm vào giỏ hàng (giới hạn tối đa 15)
  const addToCart = (product) => {
    if (!product.price) {
      Alert.alert('Lỗi', 'Sản phẩm không có giá trị hợp lệ');
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= 15) {
          Alert.alert('Thông báo', 'Số lượng đã đạt giới hạn tối đa');
          return prevCart;
        }
        Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        Alert.alert('Thành công', `Đã thêm ${product.name} vào giỏ hàng`);
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  // Tăng số lượng sản phẩm (tối đa 15)
  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.quantity < 15
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Giảm số lượng sản phẩm
  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updatePurchaseCounts = (items) => {
    const newCounts = { ...purchaseCounts };
    items.forEach(item => {
      newCounts[item.id] = (newCounts[item.id] || 0) + item.quantity;
    });
    setPurchaseCounts(newCounts);
  };

  // Đơn giản hóa hàm checkout và thêm thông báo
  const checkout = async (deliveryInfo) => {
    try {
      if (cart.length > 0) {
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shippingFee = 30000;
        const total = subtotal + shippingFee;

        const order = {
          id: Date.now().toString(),
          items: cart.map(item => ({
            ...item,
            totalPrice: item.price * item.quantity
          })),
          subtotal,
          shippingFee,
          total,
          date: new Date().toISOString(),
          deliveryInfo,
          status: 'pending',
          paymentMethod: deliveryInfo.paymentMethod,
          orderNumber: `HD${Math.floor(Math.random() * 1000000)}`,
          estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Cập nhật lịch sử đơn hàng
        setOrderHistory(prev => [order, ...prev]);
        
        // Cập nhật số lần mua của mỗi sản phẩm
        updatePurchaseCounts(cart);

        // Xóa giỏ hàng
        setCart([]);

        Alert.alert(
          'Đặt hàng thành công',
          `Mã đơn hàng: ${order.orderNumber}\nCảm ơn bạn đã mua hàng!`,
          [
            {
              text: 'Xem đơn hàng',
              onPress: () => navigation.navigate('History'),
            },
            {
              text: 'Tiếp tục mua sắm',
              onPress: () => navigation.navigate('Home'),
            }
          ]
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Lỗi',
        'Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
      return false;
    }
  };

  // Xóa toàn bộ lịch sử với thông báo
  const clearOrderHistory = async () => {
    try {
      await AsyncStorage.setItem('orderHistory', JSON.stringify([]));
      setOrderHistory([]);
      Alert.alert('Thành công', 'Đã xóa toàn bộ lịch sử mua hàng');
      return true;
    } catch (error) {
      console.error('Error clearing order history:', error);
      Alert.alert('Lỗi', 'Không thể xóa lịch sử mua hàng');
      return false;
    }
  };

  // Xóa một đơn hàng cụ thể với thông báo
  const deleteOrder = async (orderId) => {
    try {
      const newHistory = orderHistory.filter(order => order.id !== orderId);
      await AsyncStorage.setItem('orderHistory', JSON.stringify(newHistory));
      setOrderHistory(newHistory);
      Alert.alert('Thành công', 'Đã xóa đơn hàng thành công');
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Lỗi', 'Không thể xóa đơn hàng');
      return false;
    }
  };

  const getOrderStatus = (order) => {
    const orderDate = new Date(order.date);
    const now = new Date();
    const diffTime = Math.abs(now - orderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'processing';
    if (diffDays <= 3) return 'shipping';
    return 'delivered';
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        orderHistory,
        purchaseCounts,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        checkout,
        clearOrderHistory,
        deleteOrder,
        getOrderStatus
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
