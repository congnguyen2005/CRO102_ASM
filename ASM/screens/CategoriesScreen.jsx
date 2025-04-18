import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [categories] = useState([
    { 
      id: 'all', 
      name: 'Tất cả', 
      icon: 'list',
      description: 'Tất cả sản phẩm'
    },
    { 
      id: 'indoor', 
      name: 'Cây trong nhà', 
      icon: 'seedling',
      description: 'Spider Plant, Song of India,...'
    },
    { 
      id: 'outdoor', 
      name: 'Cây ngoài trời', 
      icon: 'tree',
      description: 'Planta Lemon, Cây cảnh sân vườn'
    },
    { 
      id: 'small', 
      name: 'Cây để bàn', 
      icon: 'leaf',
      description: 'Cây cảnh mini, cây văn phòng'
    },
    { 
      id: 'flowering', 
      name: 'Cây có hoa', 
      icon: 'fan',
      description: 'Các loại cây ra hoa'
    }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsRef = collection(db, 'products');
      const querySnapshot = await getDocs(productsRef);
      const productsData = [];
      
      querySnapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() };
        if (selectedCategory === 'all' || product.category === selectedCategory) {
          productsData.push(product);
        }
      });
      
      console.log('Fetched products:', productsData);
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <View style={styles.categoryIconContainer}>
        <FontAwesome5
          name={item.icon}
          size={24}
          color={selectedCategory === item.id ? '#fff' : '#009245'}
        />
      </View>
      <View style={styles.categoryTextContainer}>
        <Text
          style={[
            styles.categoryName,
            selectedCategory === item.id && styles.selectedCategoryText
          ]}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.productImage}
        defaultSource={require('../assets/icon.png')}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {item.price?.toLocaleString('vi-VN')}₫
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
      </View>
      
      <FlatList
        horizontal
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        style={styles.categoryList}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009245" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <FontAwesome5 name="seedling" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                Chưa có sản phẩm trong danh mục này
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryList: {
    maxHeight: 80,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#009245',
    width: 140,
  },
  selectedCategory: {
    backgroundColor: '#009245',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    padding: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#009245',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 12,
    textAlign: 'center',
  },
});

export default CategoriesScreen; 