import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from './CartContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { addNotification } from '../redux/notificationSlice';
import { scheduleNotification } from '../services/notificationService';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const { cart, checkout } = useContext(CartContext);
  const dispatch = useDispatch();
  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod, banking
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = cart.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const shippingFee = 30000; // Phí ship cố định 30,000đ
  const finalTotal = totalPrice + shippingFee;

  const handlePayment = async () => {
    if (isProcessing) return;

    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(deliveryInfo.phone)) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ');
      return;
    }

    setIsProcessing(true);

    try {
      const orderInfo = {
        ...deliveryInfo,
        paymentMethod,
        orderDate: new Date().toISOString()
      };

      const success = await checkout(orderInfo);
      
      if (success) {
        // Add notification to Redux store
        dispatch(addNotification({
          type: 'checkout',
          title: 'Đặt hàng thành công',
          message: `Đơn hàng của bạn đã được đặt thành công. Tổng tiền: ${finalTotal.toLocaleString()}₫`
        }));

        // Show push notification
        await scheduleNotification(
          'Đặt hàng thành công',
          `Đơn hàng của bạn đã được đặt thành công. Tổng tiền: ${finalTotal.toLocaleString()}₫`,
          { type: 'checkout' }
        );

        Alert.alert(
          'Thành công',
          'Đặt hàng thành công! Cảm ơn bạn đã mua hàng.',
          [
            {
              text: 'Tiếp tục mua sắm',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeMain' }],
                });
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Thông tin giao hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <TextInput
          style={styles.input}
          placeholder="Họ và tên người nhận"
          value={deliveryInfo.fullName}
          onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, fullName: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          keyboardType="phone-pad"
          value={deliveryInfo.phone}
          onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, phone: text })}
        />
        <TextInput
          style={[styles.input, styles.addressInput]}
          placeholder="Địa chỉ giao hàng"
          multiline
          value={deliveryInfo.address}
          onChangeText={(text) => setDeliveryInfo({ ...deliveryInfo, address: text })}
        />
      </View>

      {/* Phương thức thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentMethod === 'cod' && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons
            name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#009245"
          />
          <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            paymentMethod === 'banking' && styles.selectedPayment,
          ]}
          onPress={() => setPaymentMethod('banking')}
        >
          <Ionicons
            name={paymentMethod === 'banking' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color="#009245"
          />
          <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
        </TouchableOpacity>
      </View>

      {/* Tổng quan đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tổng quan đơn hàng</Text>
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text>Tạm tính:</Text>
            <Text>{totalPrice.toLocaleString()}₫</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Phí vận chuyển:</Text>
            <Text>{shippingFee.toLocaleString()}₫</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalText}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>{finalTotal.toLocaleString()}₫</Text>
          </View>
        </View>
      </View>

      {/* Nút đặt hàng */}
      <TouchableOpacity style={styles.checkoutButton} onPress={handlePayment}>
        <Text style={styles.checkoutText}>Đặt hàng</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  addressInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: '#009245',
    backgroundColor: '#f0fff4',
  },
  paymentText: {
    marginLeft: 8,
    fontSize: 16,
  },
  orderSummary: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginTop: 8,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#009245',
  },
  checkoutButton: {
    backgroundColor: '#009245',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentScreen; 