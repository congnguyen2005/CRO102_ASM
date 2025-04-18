import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Animated,
  RefreshControl,
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { addToFavorites, removeFromFavorites, loadFavorites } from '../redux/favoriteSlice';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;

// Danh sách danh mục
const categories = [
  { id: "1", name: "Tất cả", filter: "all" },
  { id: "2", name: "Cây ăn quả", filter: "fruit" },
  { id: "3", name: "Cây cảnh", filter: "ornamental" },
  { id: "4", name: "Cây công trình", filter: "construction" },
  { id: "5", name: "Cây dược liệu", filter: "medicinal" },
];

// Dữ liệu mẫu
const mockProducts = [
  {
    id: '1',
    name: 'Cây Xanh Phát Tài',
    price: 250000,
    description: 'Cây phát tài xanh mang ý nghĩa phong thủy tốt',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 10,
  },
  {
    id: '2',
    name: 'Cây Cam Sành',
    price: 450000,
    description: 'Cây cam sành cho trái quanh năm',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 15,
  },
  {
    id: '3',
    name: 'Cây Đinh Lăng',
    price: 180000,
    description: 'Cây dược liệu quý giá',
    image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?ixlib=rb-4.0.3',
    category: 'medicinal',
    stock: 20,
  },
  {
    id: '4',
    name: 'dasd',
    price: 1111,
    description: 'Cây test',
    image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?ixlib=rb-4.0.3',
    category: 'medicinal',
    stock: 1,
  },
  {
    id: '5',
    name: 'Cây Phát Tài Lớn',
    price: 550000,
    description: 'Cây phát tài kích thước lớn',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 5,
  },
  {
    id: '6',
    name: 'Cây Xoài Cát Hòa Lộc',
    price: 480000,
    description: 'Giống xoài ngon nổi tiếng, trái to ngọt',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 8,
  },
  {
    id: '7',
    name: 'Cây Mai Vàng',
    price: 850000,
    description: 'Cây mai vàng đẹp, phù hợp trang trí Tết',
    image: 'https://images.unsplash.com/photo-1612363148951-15f16817648f?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 12,
  },
  {
    id: '8',
    name: 'Cây Sả Chanh',
    price: 120000,
    description: 'Cây dược liệu thơm, đuổi muỗi tốt',
    image: 'https://images.unsplash.com/photo-1515728774716-9dca5e37c6e8?ixlib=rb-4.0.3',
    category: 'medicinal',
    stock: 25,
  },
  {
    id: '9',
    name: 'Cây Bàng Singapore',
    price: 750000,
    description: 'Cây công trình trang trí đẹp',
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3',
    category: 'construction',
    stock: 6,
  },
  {
    id: '10',
    name: 'Cây Ổi Ruby',
    price: 320000,
    description: 'Giống ổi ruby đỏ, ngọt đậm',
    image: 'https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 15,
  }
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const purchaseCounts = useSelector(state => state.favorites.purchaseCounts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const scrollY = new Animated.Value(0);
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 60],
    extrapolate: 'clamp'
  });

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      const productList = await initializeMockData();
      setProducts(productList);
      setFilteredProducts(productList);
    } catch (error) {
      console.error("Lỗi khi làm mới:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Khởi tạo dữ liệu mẫu khi lần đầu mở app
  const initializeMockData = async () => {
    try {
      const existingProducts = await AsyncStorage.getItem('products');
      if (!existingProducts) {
        await AsyncStorage.setItem('products', JSON.stringify(mockProducts));
        return mockProducts;
      }
      return JSON.parse(existingProducts);
    } catch (error) {
      console.error('Error initializing mock data:', error);
      return mockProducts;
    }
  };

  // Load sản phẩm từ AsyncStorage
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productList = await initializeMockData();
        setProducts(productList);
        setFilteredProducts(productList);
      } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Lắng nghe khi có sản phẩm mới được thêm vào
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const savedProducts = await AsyncStorage.getItem('products');
        if (savedProducts) {
          const productList = JSON.parse(savedProducts);
          setProducts(productList);
          setFilteredProducts(productList);
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật sản phẩm:", error);
      }
    });

    return unsubscribe;
  }, [navigation]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    if (query.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const filteredProductsByCategory =
    selectedCategory === "all"
      ? filteredProducts
      : filteredProducts.filter((p) => p.category === selectedCategory);

  const isFavorite = (productId) => {
    return favorites.some(item => item.id === productId);
  };

  const toggleFavorite = (product) => {
    if (isFavorite(product.id)) {
      dispatch(removeFromFavorites(product.id));
    } else {
      dispatch(addToFavorites(product));
    }
  };

  // Tính toán sản phẩm cho trang hiện tại
  const getCurrentPageProducts = () => {
    const filteredByCategory = selectedCategory === "all"
      ? filteredProducts
      : filteredProducts.filter((p) => p.category === selectedCategory);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredByCategory.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    (selectedCategory === "all" 
      ? filteredProducts.length 
      : filteredProducts.filter(p => p.category === selectedCategory).length) / itemsPerPage
  );

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Trang Chủ</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate("Favorites")}
          >
            <Ionicons name="heart-outline" size={24} color="black" />
            {favorites.length > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{favorites.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate("Cart")}
          >
            <Ionicons name="cart-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderProductCard = ({ item, index }) => {
    const isLast = index === getCurrentPageProducts().length - 1;
    return (
      <Animated.View 
        style={[
          styles.card,
          {
            marginRight: index % 2 === 0 ? 8 : 0,
            marginBottom: isLast ? 0 : 16
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate("ProductDetail", { product: item })}
          style={styles.cardImageContainer}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>
              {item.stock > 0 ? `Còn: ${item.stock}` : 'Hết hàng'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            style={styles.favoriteButton}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={22} 
              color={isFavorite(item.id) ? "#ff4444" : "#fff"}
            />
          </TouchableOpacity>
        </TouchableOpacity>

        <View style={styles.cardContent}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {item.price.toLocaleString()}₫
            </Text>
            {purchaseCounts[item.id] > 0 && (
              <Text style={styles.soldCount}>
                Đã bán: {purchaseCounts[item.id]}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>
    );
  };

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      <TouchableOpacity 
        style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
        onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? "#ccc" : "#28a745"} />
      </TouchableOpacity>
      <Text style={styles.pageText}>{currentPage}/{totalPages || 1}</Text>
      <TouchableOpacity 
        style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
        onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? "#ccc" : "#28a745"} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => handleSearch("")}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedCategory === item.filter && styles.filterButtonSelected,
              ]}
              onPress={() => {
                setSelectedCategory(item.filter);
                setCurrentPage(1);
              }}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedCategory === item.filter && styles.filterTextSelected,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#009245" style={styles.loading} />
      ) : (
        <FlatList
          data={getCurrentPageProducts()}
          keyExtractor={(item) => item.id}
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#28a745"]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="leaf-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setCurrentPage(1);
                }}
              >
                <Text style={styles.resetButtonText}>Đặt lại tìm kiếm</Text>
              </TouchableOpacity>
            </View>
          }
          contentContainerStyle={[
            styles.productList,
            getCurrentPageProducts().length === 0 && styles.emptyList
          ]}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          renderItem={renderProductCard}
          ListFooterComponent={getCurrentPageProducts().length > 0 ? renderPagination : null}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#2c3e50',
  },
  clearButton: {
    padding: 8,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#28a745",
    marginRight: 10,
    backgroundColor: '#fff',
  },
  filterButtonSelected: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  filterText: {
    fontSize: 14,
    color: "#28a745",
  },
  filterTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  productList: {
    padding: 10,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 8,
    borderRadius: 20,
  },
  cardContent: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: "#e41e31",
    fontSize: 16,
    fontWeight: "700",
  },
  soldCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 12,
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#28a745',
    borderRadius: 20,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  pageButton: {
    padding: 8,
    marginHorizontal: 16,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default HomeScreen;
