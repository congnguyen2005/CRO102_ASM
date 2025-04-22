// PaymentScreen.js

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Clipboard,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from './CartContext';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../redux/notificationSlice';
import { scheduleNotification } from '../services/notificationService';
import { addPendingOrder, addTransaction, switchBank } from '../redux/paymentSlice';
import QRCode from 'react-native-qrcode-svg';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const { cart, checkout } = useContext(CartContext);
  const dispatch = useDispatch();
  const bankingInfo = useSelector(state => state.payment.bankingInfo);
  const supportedBanks = useSelector(state => state.payment.supportedBanks);

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankingModal, setShowBankingModal] = useState(false);
  const [transactionCode, setTransactionCode] = useState('');

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const shippingFee = 30000;
  const finalTotal = totalPrice + shippingFee;
  const transferContent = `${bankingInfo.content}_${deliveryInfo.phone || 'sdt'}`;
  const qrContent = `banking://${bankingInfo.bankName}/${bankingInfo.accountNumber}/${finalTotal}/${transferContent}`;

  const handleCopyText = async (text) => {
    await Clipboard.setString(text);
    Alert.alert('Thông báo', 'Đã sao chép vào clipboard');
  };

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
        orderDate: new Date().toISOString(),
        items: cart,
        totalAmount: finalTotal,
        shippingFee
      };

      if (paymentMethod === 'banking') {
        dispatch(addPendingOrder(orderInfo));
        setShowBankingModal(true);
      } else {
        const success = await checkout(orderInfo);

        if (success) {
          dispatch(addNotification({
            type: 'checkout',
            title: 'Đặt hàng thành công',
            message: `Đơn hàng của bạn đã được đặt thành công. Tổng tiền: ${finalTotal.toLocaleString()}₫`
          }));

          await scheduleNotification(
            'Đặt hàng thành công',
            `Đơn hàng của bạn đã được đặt thành công. Tổng tiền: ${finalTotal.toLocaleString()}₫`,
            { type: 'checkout' }
          );

          Alert.alert('Thành công', 'Đặt hàng thành công! Cảm ơn bạn đã mua hàng.', [
            {
              text: 'Tiếp tục mua sắm',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'HomeMain' }] }),
            },
          ]);
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBankTransfer = async () => {
    if (!transactionCode.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã giao dịch');
      return;
    }

    try {
      dispatch(addTransaction({
        transactionCode: transactionCode.trim(),
        amount: finalTotal,
        orderInfo: {
          ...deliveryInfo,
          items: cart,
          totalAmount: finalTotal
        }
      }));

      const success = await checkout({
        ...deliveryInfo,
        paymentMethod,
        transactionCode: transactionCode.trim(),
        orderDate: new Date().toISOString()
      });

      if (success) {
        setShowBankingModal(false);
        Alert.alert('Thành công', 'Đơn hàng đã được ghi nhận. Chúng tôi sẽ xác nhận sau khi kiểm tra giao dịch.', [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'HomeMain' }] }),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi xác nhận giao dịch. Vui lòng thử lại sau.');
    }
  };

  const handleOpenBankApp = async () => {
    const { appScheme, appPackage, appStore } = bankingInfo;
    const platform = Platform.OS;

    try {
      const canOpen = await Linking.canOpenURL(appScheme);
      if (canOpen) {
        await Linking.openURL(appScheme);
      } else {
        const storeUrl = platform === 'ios' ? appStore.ios : appStore.android;
        await Linking.openURL(storeUrl);
      }
    } catch (error) {
      Alert.alert('Thông báo', 'Không thể mở ứng dụng ngân hàng');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={{ width: 24 }} />
      </View>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>

        <TouchableOpacity
          style={[styles.paymentMethod, paymentMethod === 'cod' && styles.selectedPayment]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'} size={24} color="#009245" />
          <Text style={styles.paymentText}>Thanh toán khi nhận hàng (COD)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentMethod, paymentMethod === 'banking' && styles.selectedPayment]}
          onPress={() => setPaymentMethod('banking')}
        >
          <Ionicons name={paymentMethod === 'banking' ? 'radio-button-on' : 'radio-button-off'} size={24} color="#009245" />
          <Text style={styles.paymentText}>Chuyển khoản ngân hàng</Text>
        </TouchableOpacity>

        {paymentMethod === 'banking' && (
          <View style={styles.bankingInfo}>
            <Text style={styles.bankingTitle}>Chọn ngân hàng:</Text>
            {supportedBanks.map(bank => (
              <TouchableOpacity key={bank.code} onPress={() => dispatch(switchBank(bank.code))}>
                <Text style={{ marginVertical: 4 }}>{bank.name}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.bankingTitle, { marginTop: 10 }]}>Thông tin chuyển khoản:</Text>
            <QRCode value={qrContent} size={200} />
            <Text>{bankingInfo.bankName}</Text>
            <Text>{bankingInfo.accountNumber}</Text>
            <Text>{bankingInfo.accountName}</Text>
            <Text>{transferContent}</Text>
          </View>
        )}
      </View>

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
          <View style={styles.summaryRow}>
            <Text style={styles.totalText}>Tổng cộng:</Text>
            <Text style={styles.totalText}>{finalTotal.toLocaleString()}₫</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.paymentButton} onPress={handlePayment} disabled={isProcessing}>
        <Text style={styles.paymentButtonText}>
          {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
        </Text>
      </TouchableOpacity>

      <Modal visible={showBankingModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Chuyển khoản ngân hàng</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã giao dịch"
            value={transactionCode}
            onChangeText={setTransactionCode}
          />
          <TouchableOpacity onPress={handleConfirmBankTransfer}>
            <Text style={styles.modalButtonText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowBankingModal(false)}>
            <Text style={styles.modalButtonText}>Hủy bỏ</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  section: {
    backgroundColor: '#fff', padding: 16, marginTop: 10,
    borderRadius: 12, marginHorizontal: 12,
    shadowColor: '#000', shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 12, color: '#222' },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 10,
    padding: 12, marginBottom: 12, fontSize: 16, backgroundColor: '#fff'
  },
  addressInput: { height: 80, textAlignVertical: 'top' },
  paymentMethod: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    marginBottom: 10, backgroundColor: '#fdfdfd'
  },
  selectedPayment: { borderColor: '#009245', backgroundColor: '#e6fff1' },
  paymentText: { marginLeft: 10, fontSize: 16, color: '#333' },
  bankingInfo: { marginTop: 16, padding: 14, backgroundColor: '#f4fef7', borderRadius: 10 },
  bankingTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 8, color: '#009245' },
  orderSummary: { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  paymentButton: {
    backgroundColor: '#009245', margin: 16, padding: 16, borderRadius: 12,
    alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 3
  },
  paymentButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  modalButtonText: {
    fontSize: 16, padding: 14, textAlign: 'center', color: '#fff',
    backgroundColor: '#009245', borderRadius: 10, marginTop: 10
  }
});

export default PaymentScreen;
