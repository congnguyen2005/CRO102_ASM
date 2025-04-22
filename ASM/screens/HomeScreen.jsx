import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Dimensions,
  SafeAreaView,
  Alert,
  ScrollView,
  Platform
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { addToFavorites, removeFromFavorites, loadFavorites } from '../redux/favoriteSlice';
import { addToCart } from '../redux/cartSlice';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 36) / 2;
const BANNER_HEIGHT = height * 0.25;
const ITEMS_PER_PAGE = 20;

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
    name: 'Cây Phát Tài Lớn',
    price: 550000,
    description: 'Cây phát tài kích thước lớn',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 5,
  },
  {
    id: '5',
    name: 'Cây Xoài Cát Hòa Lộc',
    price: 480000,
    description: 'Giống xoài ngon nổi tiếng, trái to ngọt',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 8,
  },
  {
    id: '6',
    name: 'Cây Mai Vàng',
    price: 850000,
    description: 'Cây mai vàng đẹp, phù hợp trang trí Tết',
    image: 'https://images.unsplash.com/photo-1612363148951-15f16817648f?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 12,
  },
  {
    id: '7',
    name: 'Cây Sả Chanh',
    price: 120000,
    description: 'Cây dược liệu thơm, đuổi muỗi tốt',
    image: 'https://images.unsplash.com/photo-1515728774716-9dca5e37c6e8?ixlib=rb-4.0.3',
    category: 'medicinal',
    stock: 25,
  },
  {
    id: '8',
    name: 'Cây Bàng Singapore',
    price: 750000,
    description: 'Cây công trình trang trí đẹp',
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3',
    category: 'construction',
    stock: 6,
  },
  {
    id: '9',
    name: 'Cây Ổi Ruby',
    price: 320000,
    description: 'Giống ổi ruby đỏ, ngọt đậm',
    image: 'https://images.unsplash.com/photo-1504387432042-8aca549e4729?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 15,
  },
  {
    id: '10',
    name: 'Cây Lan Ý',
    price: 280000,
    description: 'Cây cảnh đẹp, dễ chăm sóc',
    image: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 18,
  },
  {
    id: '11',
    name: 'Cây Bưởi Da Xanh',
    price: 550000,
    description: 'Giống bưởi ngon, nhiều nước',
    image: 'https://images.unsplash.com/photo-1587164186392-c8c6841be3c9?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 7,
  },
  {
    id: '12',
    name: 'Cây Nghệ Vàng',
    price: 150000,
    description: 'Cây dược liệu tốt cho sức khỏe',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?ixlib=rb-4.0.3',
    category: 'medicinal',
    stock: 30,
  },
  {
    id: '13',
    name: 'Cây Phượng Vĩ',
    price: 980000,
    description: 'Cây công trình cho bóng mát',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3',
    category: 'construction',
    stock: 4,
  },
  {
    id: '14',
    name: 'Cây Kim Ngân',
    price: 420000,
    description: 'Cây cảnh phong thủy đẹp',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 16,
  },
  {
    id: '15',
    name: 'Cây Sầu Riêng Monthong',
    price: 850000,
    description: 'Giống sầu riêng Thái chất lượng cao',
    image: 'https://images.unsplash.com/photo-1588165171080-c89acfa5ee83?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 5,
  }
];

// Thêm dữ liệu banner
const banners = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3',
    title: 'Khuyến mãi mùa hè',
    description: 'Giảm giá lên đến 50%'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3',
    title: 'Cây cảnh mới',
    description: 'Nhiều mẫu mã đa dạng'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?ixlib=rb-4.0.3',
    title: 'Cây dược liệu',
    description: 'Tốt cho sức khỏe'
  }
];

// Thêm danh sách tính năng
const features = [
  { id: '1', icon: 'local-shipping', name: 'Giao hàng nhanh' },
  { id: '2', icon: 'payment', name: 'Thanh toán an toàn' },
  { id: '3', icon: 'support-agent', name: 'Hỗ trợ 24/7' },
  { id: '4', icon: 'redeem', name: 'Ưu đãi thành viên' }
];

// Thêm dữ liệu sản phẩm nổi bật
const featuredProducts = [
  {
    id: '1',
    name: 'Cây Mai Vàng',
    price: 850000,
    description: 'Cây mai vàng đẹp, phù hợp trang trí Tết',
    image: 'https://images.unsplash.com/photo-1612363148951-15f16817648f?ixlib=rb-4.0.3',
    category: 'ornamental',
    stock: 12,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Cây Bàng Singapore',
    price: 750000,
    description: 'Cây công trình trang trí đẹp',
    image: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?ixlib=rb-4.0.3',
    category: 'construction',
    stock: 6,
    isFeatured: true
  },
  {
    id: '3',
    name: 'Cây Xoài Cát Hòa Lộc',
    price: 480000,
    description: 'Giống xoài ngon nổi tiếng, trái to ngọt',
    image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3',
    category: 'fruit',
    stock: 8,
    isFeatured: true
  }
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // Memoize selectors để tránh re-render không cần thiết
  const favorites = useSelector(state => state.favorites?.items || [], (prev, next) => 
    JSON.stringify(prev) === JSON.stringify(next)
  );
  const cartItems = useSelector(state => state.cart?.items || []);
  const purchaseCounts = useSelector(state => state.favorites?.purchaseCounts || {}, (prev, next) =>
    JSON.stringify(prev) === JSON.stringify(next)
  );
  const pendingOrders = useSelector(state => state.payment?.pendingOrders || [], (prev, next) =>
    JSON.stringify(prev) === JSON.stringify(next)
  );
  const notifications = useSelector(state => state.notifications?.items || [], (prev, next) =>
    JSON.stringify(prev) === JSON.stringify(next)
  );

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [100, 60],
    extrapolate: 'clamp'
  });

  // Memoize unreadNotifications
  const unreadNotifications = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  const onRefresh = async () => {
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
  };

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

  const getFilteredProducts = () => {
    return selectedCategory === "all"
      ? filteredProducts
      : filteredProducts.filter((p) => p.category === selectedCategory);
  };

  const handleAddToCart = (product) => {
    if (!product || !product.id) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng');
      return;
    }

    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > (product.stock || 15)) {
      Alert.alert('Thông báo', 'Số lượng sản phẩm đã đạt giới hạn');
      return;
    }

    dispatch(addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock || 15,
      quantity: 1
    }));

    Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng');
  };

  const renderHeader = () => (
    <Animated.View style={[styles.header, { height: headerHeight }]}>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>Trang Chủ</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="black" />
            {unreadNotifications > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => navigation.navigate("Favorites")}
          >
            <Ionicons name="heart-outline" size={24} color="black" />
            {favorites?.length > 0 && (
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
            {pendingOrders?.length > 0 && (
              <View style={[styles.badgeContainer, styles.orderBadge]}>
                <Text style={styles.badgeText}>{pendingOrders.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const ListHeaderComponent = () => (
    <>
      {/* Banner Section */}
      {banners && banners.length > 0 && (
        <View style={styles.bannerSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x / (width - 32)
              );
              setActiveSlide(slideIndex);
            }}
          >
            {banners.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                style={[styles.bannerContainer, { width: width - 32 }]}
                onPress={() => navigation.navigate('PromotionDetail', { promotion: item })}
              >
                <Image 
                  source={{ uri: item.image }} 
                  style={styles.bannerImage}
                  defaultSource={require('../assets/song_of_india.png')}
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  style={styles.bannerGradient}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{item.title || 'Khuyến mãi'}</Text>
                    <Text style={styles.bannerDescription}>
                      {item.description || 'Chi tiết khuyến mãi'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  activeSlide === index && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Search Bar */}
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

      {/* Features */}
      {features && features.length > 0 && (
        <View style={styles.featuresContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuresList}
          >
            {features.map((item) => (
              <View key={item.id} style={[styles.featureItem, { marginRight: 24 }]}>
                <MaterialIcons name={item.icon || 'info'} size={24} color="#28a745" />
                <Text style={styles.featureText}>{item.name || 'Tính năng'}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Products Section */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Sản phẩm nổi bật</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredProductsList}
        >
          {featuredProducts.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featuredProductCard}
              onPress={() => navigation.navigate("ProductDetail", { product: item })}
            >
              <Image 
                source={{ uri: item.image }} 
                style={styles.featuredProductImage}
                defaultSource={require('../assets/song_of_india.png')}
              />
              <View style={styles.featuredProductContent}>
                <Text style={styles.featuredProductName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.featuredProductPrice}>
                  {item.price.toLocaleString()}₫
                </Text>
                <View style={styles.featuredProductTag}>
                  <Text style={styles.featuredProductTagText}>
                    {categories.find(cat => cat.filter === item.category)?.name || 'Khác'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === item.filter && styles.categoryButtonSelected,
                ]}
                onPress={() => {
                  setSelectedCategory(item.filter);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === item.filter && styles.categoryTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </>
  );

  const renderProductCard = ({ item }) => {
    if (!item) return null;

    return (
      <View style={[styles.card, { width: CARD_WIDTH, margin: 8 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("ProductDetail", { product: item })}
        >
          <View style={styles.cardImageContainer}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.image}
              defaultSource={require('../assets/song_of_india.png')}
            />
            <View style={[
              styles.stockBadge,
              item.stock <= 0 && styles.outOfStockBadge
            ]}>
              <Text style={[
                styles.stockText,
                item.stock <= 0 && styles.outOfStockText
              ]}>
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
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name || 'Không có tên'}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>
                {item.price ? item.price.toLocaleString() : '0'}₫
              </Text>
              {purchaseCounts[item.id] > 0 && (
                <Text style={styles.soldCount}>
                  Đã bán: {purchaseCounts[item.id]}
                </Text>
              )}
            </View>

            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>
                  {categories.find(cat => cat.filter === item.category)?.name || 'Khác'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.addToCartButton,
                item.stock <= 0 && styles.disabledButton
              ]}
              onPress={() => handleAddToCart(item)}
              disabled={item.stock <= 0}
            >
              <Ionicons name="cart-outline" size={20} color="#fff" />
              <Text style={styles.addToCartText}>
                {item.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FlatList
        data={getFilteredProducts()}
        renderItem={renderProductCard}
        keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        numColumns={2}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="leaf-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Không tìm thấy sản phẩm nào</Text>
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              <Text style={styles.resetButtonText}>Đặt lại tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.productList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#28a745"]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />
    </SafeAreaView>
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
  orderBadge: {
    backgroundColor: '#009245',
  },
  bannerSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  bannerContainer: {
    height: BANNER_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    marginRight: 16,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: '#fff',
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
  featuresContainer: {
    marginBottom: 16,
  },
  featuresList: {
    paddingHorizontal: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 8,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#28a745",
    marginRight: 10,
    backgroundColor: '#fff',
    marginLeft: 16,
  },
  categoryButtonSelected: {
    backgroundColor: "#28a745",
    borderColor: "#28a745",
  },
  categoryText: {
    fontSize: 14,
    color: "#28a745",
  },
  categoryTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  productList: {
    padding: 8,
    paddingBottom: 80,
  },
  card: {
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
    marginBottom: 8,
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
  categoryTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
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
  featuredSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featuredProductsList: {
    paddingVertical: 8,
  },
  featuredProductCard: {
    width: width * 0.7,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  featuredProductImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  featuredProductContent: {
    padding: 12,
  },
  featuredProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 22,
  },
  featuredProductPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e41e31',
    marginBottom: 8,
  },
  featuredProductTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuredProductTagText: {
    fontSize: 12,
    color: '#666',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(255,68,68,0.8)',
  },
  outOfStockText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009245',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

export default HomeScreen;
