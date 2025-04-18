import React, { useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image
} from "react-native";
import { CartContext } from "../screens/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const OrderStatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return '#ff9800';
      case 'shipping':
        return '#2196F3';
      case 'delivered':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý';
      case 'shipping':
        return 'Đang giao';
      case 'delivered':
        return 'Đã giao';
      default:
        return 'Không xác định';
    }
  };

  return (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
      <Text style={styles.statusText}>{getStatusText()}</Text>
    </View>
  );
};

const HistoryScreen = () => {
  const { orderHistory, clearOrderHistory, deleteOrder, getOrderStatus } = useContext(CartContext);
  const navigation = useNavigation();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Hàm xác nhận xóa toàn bộ lịch sử
  const handleClearHistory = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa toàn bộ lịch sử mua hàng?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: clearOrderHistory
        }
      ]
    );
  };

  // Hàm xác nhận xóa một đơn hàng
  const handleDeleteOrder = (orderId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đơn hàng này?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteOrder(orderId)
        }
      ]
    );
  };

  const renderOrderCard = ({ item }) => {
    const status = getOrderStatus(item);
    
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>Đơn hàng #{item.orderNumber || 'N/A'}</Text>
            <OrderStatusBadge status={status} />
          </View>
          <TouchableOpacity
            onPress={() => handleDeleteOrder(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ff3b30" />
          </TouchableOpacity>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderDateRow}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.orderDate}>
              Ngày đặt: {item.date ? formatDate(item.date) : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryTitle}>Thông tin giao hàng:</Text>
            <Text style={styles.deliveryText}>
              {item.deliveryInfo?.fullName || 'N/A'} - {item.deliveryInfo?.phone || 'N/A'}
            </Text>
            <Text style={styles.deliveryText}>{item.deliveryInfo?.address || 'N/A'}</Text>
          </View>

          <View style={styles.productList}>
            {item.items?.map((product) => (
              <View key={product.id} style={styles.productItem}>
                <Image 
                  source={{ uri: product.image }} 
                  style={styles.productImage}
                />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {product.name || 'N/A'}
                  </Text>
                  <Text style={styles.productPrice}>
                    {(product.price || 0).toLocaleString()}₫ x {product.quantity || 0}
                  </Text>
                  <Text style={styles.productTotal}>
                    = {((product.price || 0) * (product.quantity || 0)).toLocaleString()}₫
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tạm tính:</Text>
              <Text style={styles.summaryValue}>
                {(item.subtotal || 0).toLocaleString()}₫
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Phí vận chuyển:</Text>
              <Text style={styles.summaryValue}>
                {(item.shippingFee || 0).toLocaleString()}₫
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalAmount}>
                {(item.total || 0).toLocaleString()}₫
              </Text>
            </View>
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentMethod}>
              Phương thức thanh toán: {item.paymentMethod === 'cod' ? 'Tiền mặt khi nhận hàng' : 'Chuyển khoản'}
            </Text>
            <Text style={styles.estimatedDelivery}>
              Dự kiến giao: {item.estimatedDelivery ? formatDate(item.estimatedDelivery) : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
        {orderHistory.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash-outline" size={24} color="#ff3b30" />
          </TouchableOpacity>
        )}
      </View>

      {orderHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có lịch sử mua hàng</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          keyExtractor={(item) => item.id}
          renderItem={renderOrderCard}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  listContainer: {
    padding: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderDetails: {
    padding: 16,
  },
  orderDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
  },
  deliveryInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  deliveryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productList: {
    marginBottom: 16,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: '#666',
  },
  productTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
  },
  orderSummary: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  paymentInfo: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  estimatedDelivery: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  shopButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HistoryScreen;
