import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useContext, useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList
} from "react-native";
import { CartContext } from "../screens/CartContext";
import { getProductComments, addComment, updateComment, deleteComment } from "../services/commentService";
import { auth } from "../config/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";

const ProductDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { product } = route.params;
  const { addToCart, cart } = useContext(CartContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");

  // Lấy số lượng sản phẩm hiện có trong giỏ hàng
  const cartItem = cart.find((item) => item.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    setLoading(true);
    try {
      const productComments = await getProductComments(product.id);
      setComments(productComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!auth.currentUser) {
      Alert.alert("Thông báo", "Vui lòng đăng nhập để bình luận");
      navigation.navigate("Login");
      return;
    }

    if (!newComment.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung bình luận");
      return;
    }

    setSubmitting(true);
    try {
      const comment = await addComment(product.id, newComment);
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment("");
      Alert.alert("Thành công", "Đã thêm bình luận");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể thêm bình luận. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;
      
      setEditingComment(commentId);
      setEditContent(comment.content);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể sửa bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;

    try {
      const updatedComment = await updateComment(editingComment, editContent);
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === editingComment 
            ? { ...comment, ...updatedComment }
            : comment
        )
      );
      setEditingComment(null);
      setEditContent("");
      Alert.alert("Thành công", "Đã cập nhật bình luận");
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật bình luận. Vui lòng thử lại sau.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa bình luận này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              setComments(prevComments => 
                prevComments.filter(comment => comment.id !== commentId)
              );
              Alert.alert("Thành công", "Đã xóa bình luận");
            } catch (error) {
              Alert.alert("Lỗi", error.message || "Không thể xóa bình luận. Vui lòng thử lại sau.");
            }
          }
        }
      ]
    );
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {item.userInfo?.photoURL ? (
          <Image 
            source={{ uri: item.userInfo.photoURL }} 
            style={styles.userAvatar} 
          />
        ) : (
          <View style={styles.defaultAvatar}>
            <Text style={styles.avatarText}>
              {(item.userInfo?.fullName || item.userEmail).charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.commentUserInfo}>
          <Text style={styles.commentUser}>
            {item.userInfo?.fullName || item.userEmail.split('@')[0]}
          </Text>
          <Text style={styles.commentDate}>
            {new Date(item.createdAt).toLocaleString('vi-VN')}
            {item.isEdited && " (đã chỉnh sửa)"}
          </Text>
        </View>
        {auth.currentUser?.uid === item.userId && (
          <View style={styles.commentActions}>
            <TouchableOpacity 
              onPress={() => handleEditComment(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome name="edit" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDeleteComment(item.id)}
              style={styles.actionButton}
            >
              <FontAwesome name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {editingComment === item.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.editInput}
            value={editContent}
            onChangeText={setEditContent}
            multiline
          />
          <View style={styles.editActions}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleUpdateComment}
            >
              <Text style={styles.editButtonText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.editButton, styles.cancelButton]}
              onPress={() => {
                setEditingComment(null);
                setEditContent("");
              }}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Text style={styles.commentContent}>{item.content}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.scrollView}>
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
        <View style={styles.productInfo}>
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

        {/* Phần bình luận */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Bình luận</Text>
          
          {/* Form thêm bình luận */}
          <View style={styles.commentForm}>
            <TextInput
              style={styles.commentInput}
              placeholder="Viết bình luận của bạn..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.commentButton}
              onPress={handleAddComment}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.commentButtonText}>Gửi</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Danh sách bình luận */}
          {loading ? (
            <ActivityIndicator style={styles.loading} />
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.noComments}>
                  Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                </Text>
              }
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollView: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  cartIcon: { 
    position: "relative" 
  },
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
  cartBadgeText: { 
    color: "white", 
    fontSize: 12, 
    fontWeight: "bold" 
  },
  productImage: {
    width: "100%",
    height: 300,
    resizeMode: "contain",
  },
  productInfo: {
    padding: 16,
  },
  productName: { 
    fontSize: 22, 
    fontWeight: "bold" 
  },
  productPrice: {
    fontSize: 18,
    color: "green",
    marginVertical: 8,
  },
  productDescription: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#009245",
    marginBottom: 10,
  },
  addToCartButton: {
    backgroundColor: "#009245",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addToCartText: { 
    color: "white", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 8,
    borderTopColor: "#f0f0f0",
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  commentForm: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  commentButton: {
    backgroundColor: "#009245",
    padding: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  commentButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  commentItem: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  defaultAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#009245",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  commentUserInfo: {
    flex: 1,
  },
  commentUser: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#333",
  },
  commentDate: {
    color: "#666",
    fontSize: 12,
    marginTop: 2,
  },
  commentContent: {
    fontSize: 14,
    color: "#333",
    marginLeft: 50,
  },
  noComments: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 16,
  },
  loading: {
    padding: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 5,
    marginLeft: 10,
  },
  editContainer: {
    marginTop: 10,
    marginLeft: 50,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    backgroundColor: '#fff',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#2E7D32',
    padding: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  cancelButtonText: {
    color: '#fff',
  },
});