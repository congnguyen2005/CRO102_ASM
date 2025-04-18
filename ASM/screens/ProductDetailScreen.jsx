import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useContext } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartContext } from "../screens/CartContext";

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const { addToCart, cart } = useContext(CartContext);

  // Lấy số lượng sản phẩm hiện có trong giỏ hàng
  const cartItem = cart.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Cart")} style={styles.cartIcon}>
          <Ionicons name="cart-outline" size={24} color="black" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Hình ảnh sản phẩm */}
      <Image source={{ uri: product.image }} style={styles.productImage} />

      {/* Thông tin sản phẩm */}
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>
        {product.price ? product.price.toLocaleString() + "₫" : "Chưa có giá"}
      </Text>
      <Text style={styles.productDescription}>
        {product.description || "Mô tả sản phẩm đang cập nhật..."}
      </Text>

      {/* Hiển thị số lượng đã thêm vào giỏ hàng */}
      {quantityInCart > 0 && (
        <Text style={styles.quantityText}>Số lượng trong giỏ: {quantityInCart}</Text>
      )}

      {/* Nút thêm vào giỏ hàng */}
      <TouchableOpacity style={styles.addToCartButton} onPress={() => addToCart(product)}>
        <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  cartIcon: { position: "relative" },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: { color: "white", fontSize: 12, fontWeight: "bold" },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
    marginBottom: 16,
  },
  productName: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  productPrice: {
    fontSize: 18,
    color: "green",
    textAlign: "center",
    marginVertical: 8,
  },
  productDescription: {
    fontSize: 14,
    textAlign: "center",
    color: "gray",
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#009245",
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: "#009245",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartText: { color: "white", fontSize: 16, fontWeight: "bold" },
});