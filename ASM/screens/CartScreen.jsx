import React, { useContext } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { CartContext } from "./CartContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const CartScreen = () => {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useContext(CartContext);
  const navigation = useNavigation();

  // Tính tổng giá trị giỏ hàng
  const totalPrice = cart.reduce((total, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return total + price * quantity;
  }, 0);

  // Xóa hoàn toàn hàm handleCheckout cũ và thay bằng hàm mới
  const goToPayment = () => {
    if (cart.length === 0) {
      Alert.alert('Thông báo', 'Giỏ hàng trống');
      return;
    }
    // Chuyển trực tiếp đến màn hình Payment
    navigation.navigate('Payment');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <View style={{ width: 24 }} />
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        </View>
      ) : (
        <FlatList
          data={cart}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>
                {item.price ? item.price.toLocaleString() : "Giá chưa có"}₫ x {item.quantity}
              </Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={() => decreaseQuantity(item.id)} style={styles.btn}>
                  <Ionicons name="remove-circle-outline" size={24} color="red" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => increaseQuantity(item.id)} style={styles.btn}>
                  <Ionicons name="add-circle-outline" size={24} color="green" />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Ionicons name="trash-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <View style={styles.footer}>
        <Text style={styles.totalText}>Tổng cộng: {totalPrice.toLocaleString()}₫</Text>
        <TouchableOpacity
          style={[styles.checkoutButton, cart.length === 0 && styles.disabledButton]}
          onPress={goToPayment}
          disabled={cart.length === 0}
        >
          <Text style={styles.checkoutText}>Thanh Toán</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 14,
    color: "green",
    marginRight: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  btn: {
    padding: 4,
  },
  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: "#009245",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default CartScreen;
