import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted" || cameraStatus.status !== "granted") {
        Alert.alert("Cảnh báo", "Bạn cần cấp quyền truy cập vào thư viện ảnh và camera!");
      }
    };
    requestPermissions();

    const loadProfile = async () => {
      const storedName = await AsyncStorage.getItem("profile_name");
      const storedEmail = await AsyncStorage.getItem("profile_email");
      const storedAvatar = await AsyncStorage.getItem("profile_avatar");
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedAvatar) setAvatar(storedAvatar);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên!");
      return;
    }
  
    if (name.length < 3) {
      Alert.alert("Lỗi", "Họ tên phải có ít nhất 3 ký tự!");
      return;
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }
  
    // Nếu muốn ràng buộc phải có avatar, bỏ comment dưới đây:
    // if (!avatar) {
    //   Alert.alert("Lỗi", "Vui lòng chọn ảnh đại diện!");
    //   return;
    // }
  
    try {
      await AsyncStorage.setItem("profile_name", name);
      await AsyncStorage.setItem("profile_email", email);
      if (avatar) {
        await AsyncStorage.setItem("profile_avatar", avatar);
      }
  
      Alert.alert("Thành công", "Thông tin đã được cập nhật!");
      navigation.goBack(); // Quay lại màn hình Profile
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lưu thông tin. Vui lòng thử lại!");
      console.error("Lỗi khi lưu thông tin:", error);
    }
  };
  

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 200 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatar(manipulatedImage.uri);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: 200 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      setAvatar(manipulatedImage.uri);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.form}>
        <Text style={styles.title}>Chỉnh sửa thông tin</Text>

        <Image
          source={avatar ? { uri: avatar } : require("../assets/avatar.png")}
          style={styles.avatar}
        />

        <View style={styles.imageOptions}>
          <TouchableOpacity onPress={handlePickImage}>
            <Text style={styles.imageOptionText}>🖼️ Chọn ảnh từ thư viện</Text>
          </TouchableOpacity>
      
        </View>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Họ và tên"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
        />
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Lưu</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    padding: 16
  },
  form: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333"
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10
  },
  imageOptions: {
    alignItems: "center",
    marginBottom: 20
  },
  imageOptionText: {
    color: "#007AFF",
    fontSize: 14,
    marginVertical: 5
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fafafa"
  },
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default EditProfileScreen;
