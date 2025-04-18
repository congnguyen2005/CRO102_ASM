import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../config/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setFilteredProducts(productList); // Hiển thị tất cả sản phẩm khi không có từ khóa tìm kiếm
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Tìm kiếm sản phẩm theo tên
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setFilteredProducts(products); // Hiển thị tất cả sản phẩm nếu không có từ khóa
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#009245" style={styles.loading} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("ProductDetail", { product: item })}
            >
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>
                {item.price ? item.price.toLocaleString() + "₫" : "Chưa có giá"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    marginRight: 10, // Đảm bảo khoảng cách hợp lý giữa nút và input
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 15,
    fontSize: 16,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    flex: 1,
    margin: 10,
    padding: 10,
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    alignItems: "center",
  },
  image: { width: 120, height: 120, borderRadius: 8 },
  name: { marginTop: 5, fontWeight: "bold", textAlign: "center" },
  price: { color: "green", marginTop: 3, fontSize: 14, fontWeight: "bold" },
});
