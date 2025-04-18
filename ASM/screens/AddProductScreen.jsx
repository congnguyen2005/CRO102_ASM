import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from "@expo/vector-icons";
import { Picker } from '@react-native-picker/picker';

// Tối ưu kích thước ảnh preview
const SCREEN_WIDTH = Dimensions.get('window').width;
const IMAGE_WIDTH = SCREEN_WIDTH - 32;
const IMAGE_HEIGHT = 200;

// Danh sách categories
const CATEGORIES = [
  { label: "Cây ăn quả", value: "fruit" },
  { label: "Cây cảnh", value: "ornamental" },
  { label: "Cây công trình", value: "construction" },
  { label: "Cây dược liệu", value: "medicinal" },
];

// Danh sách ảnh mẫu
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cGxhbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGxhbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8cGxhbnR8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
];

// Tách component preview ảnh để tối ưu render
const ImagePreview = React.memo(({ uri, onRemove }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!uri) return null;

  return (
    <View style={styles.imagePreviewContainer}>
      {isLoading && <ActivityIndicator style={styles.loader} color="#007bff" />}
      <Image
        source={{ uri }}
        style={[styles.previewImage, isLoading && styles.imageLoading]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setError("Không thể tải ảnh");
        }}
        resizeMode="contain"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {uri && (
        <TouchableOpacity style={styles.removeImageButton} onPress={onRemove}>
          <Ionicons name="close-circle" size={24} color="red" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const AddProductScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    imagePath: SAMPLE_IMAGES[0], // Mặc định ảnh đầu tiên
    category: "",
    stock: "",
    unit: "cái",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Validate form với useMemo
  const formErrors = useMemo(() => {
    const errors = {};
    const { name, price, description, category, stock } = formData;

    if (!name.trim()) errors.name = "Vui lòng nhập tên sản phẩm";
    if (!price.trim()) errors.price = "Vui lòng nhập giá sản phẩm";
    else if (isNaN(price) || parseFloat(price) <= 0)
      errors.price = "Giá phải là số dương";
    if (!description.trim()) errors.description = "Vui lòng nhập mô tả";
    if (!category) errors.category = "Vui lòng chọn danh mục";
    if (!stock || isNaN(stock) || parseInt(stock) < 0)
      errors.stock = "Vui lòng nhập số lượng hợp lệ";

    return errors;
  }, [formData]);

  // Cập nhật form
  const updateFormField = useCallback((field, value) => {
    requestAnimationFrame(() => {
      setFormData(prev => ({ ...prev, [field]: value }));
    });
  }, []);

  // Xử lý thêm sản phẩm
  const handleAddProduct = useCallback(async () => {
    const errors = formErrors;
    if (Object.keys(errors).length > 0) {
      Alert.alert("Lỗi", Object.values(errors)[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Lấy danh sách sản phẩm hiện tại
      const existingProducts = await AsyncStorage.getItem('products');
      const products = existingProducts ? JSON.parse(existingProducts) : [];

      // Tạo sản phẩm mới
      const newProduct = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        description: formData.description.trim(),
        image: formData.imagePath,
        category: formData.category,
        stock: parseInt(formData.stock),
        unit: formData.unit,
        createdAt: new Date().toISOString(),
        status: "active"
      };

      // Thêm sản phẩm mới vào danh sách
      products.push(newProduct);

      // Lưu danh sách mới
      await AsyncStorage.setItem('products', JSON.stringify(products));

      Alert.alert("Thành công", "Đã thêm sản phẩm thành công", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Add product error:', error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi thêm sản phẩm");
    } finally {
      setIsLoading(false);
    }
  }, [formData, formErrors, navigation]);

  // Chọn ảnh mẫu
  const handleSelectImage = useCallback((imageUrl) => {
    updateFormField('imagePath', imageUrl);
  }, [updateFormField]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Thêm sản phẩm</Text>

        <View style={styles.inputGroup}>
          <TextInput
            placeholder="Tên sản phẩm"
            value={formData.name}
            onChangeText={text => updateFormField('name', text)}
            style={[styles.input, formErrors.name && styles.inputError]}
            maxLength={100}
          />
          
          <View style={styles.row}>
            <TextInput
              placeholder="Giá sản phẩm"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={text => updateFormField('price', text)}
              style={[styles.input, styles.flex1, formErrors.price && styles.inputError]}
              maxLength={10}
            />
            <TextInput
              placeholder="Số lượng"
              keyboardType="numeric"
              value={formData.stock}
              onChangeText={text => updateFormField('stock', text)}
              style={[styles.input, styles.flex1, formErrors.stock && styles.inputError]}
              maxLength={5}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.category}
              onValueChange={(value) => updateFormField('category', value)}
              style={[styles.picker, formErrors.category && styles.pickerError]}
            >
              <Picker.Item label="Chọn danh mục" value="" />
              {CATEGORIES.map(cat => (
                <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
              ))}
            </Picker>
          </View>

          <TextInput
            placeholder="Mô tả sản phẩm"
            multiline
            value={formData.description}
            onChangeText={text => updateFormField('description', text)}
            style={[styles.input, formErrors.description && styles.inputError, styles.textArea]}
            maxLength={500}
          />

          <Text style={styles.sectionTitle}>Chọn ảnh mẫu:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
            {SAMPLE_IMAGES.map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sampleImage,
                  formData.imagePath === image && styles.selectedImage
                ]}
                onPress={() => handleSelectImage(image)}
              >
                <Image
                  source={{ uri: image }}
                  style={styles.sampleImagePreview}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ImagePreview 
            uri={formData.imagePath} 
            onRemove={() => updateFormField('imagePath', SAMPLE_IMAGES[0])}
          />

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleAddProduct}
            disabled={isLoading || Object.keys(formErrors).length > 0}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" style={styles.loader} />
                <Text style={styles.loadingText}>Đang xử lý...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Thêm sản phẩm</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff"
  },
  contentContainer: {
    padding: 16,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 16,
    color: "#2c3e50"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#2c3e50"
  },
  inputGroup: { 
    gap: 12 
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f8f9fa",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#dc3545",
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  pickerError: {
    borderColor: "#dc3545",
  },
  imageList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sampleImage: {
    width: 80,
    height: 80,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedImage: {
    borderColor: '#28a745',
  },
  sampleImagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  previewImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 8,
  },
  imageLoading: {
    opacity: 0.7,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  loader: {
    position: 'absolute',
    top: '50%',
    zIndex: 1,
  },
  button: {
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
  },
  errorText: {
    color: '#dc3545',
    marginTop: 5,
    fontSize: 14,
  },
});

export default React.memo(AddProductScreen);
