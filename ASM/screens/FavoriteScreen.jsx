import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { removeFromFavorites } from '../redux/favoriteSlice';

const FavoriteScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorites = useSelector(state => state.favorites.items);
  const purchaseCounts = useSelector(state => state.favorites.purchaseCounts);

  const handleRemoveFavorite = (item) => {
    Alert.alert(
      'Xóa khỏi yêu thích',
      `Bạn có chắc muốn xóa ${item.name} khỏi danh sách yêu thích?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          onPress: () => dispatch(removeFromFavorites(item.id)),
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.productCard}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
        />
      </TouchableOpacity>
      <View style={styles.productInfo}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <TouchableOpacity
            onPress={() => handleRemoveFavorite(item)}
            style={styles.removeButton}
          >
            <Ionicons name="heart" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
        <Text style={styles.productPrice}>
          {item.price?.toLocaleString()}₫
        </Text>
        <Text style={styles.purchaseCount}>
          Đã mua {purchaseCounts[item.id] || 0} lần
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sản phẩm yêu thích ({favorites.length})</Text>
      </View>

      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có sản phẩm yêu thích</Text>
          <Text style={styles.emptySubText}>
            Nhấn vào biểu tượng trái tim để thêm sản phẩm vào danh sách yêu thích
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    marginLeft: 12,
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: 'bold',
    marginTop: 4,
  },
  purchaseCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  removeButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
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
    fontWeight: 'bold',
  },
});

export default FavoriteScreen; 