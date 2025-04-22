import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/slices/authSlice";
import { getUserProfile } from "../services/userService";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const userId = userCredential.user.uid;

      const profile = await getUserProfile(userId);
      if (profile) {
        await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
        dispatch(loginSuccess(profile));
        navigation.replace("Main");  // Chuyển hướng tới màn hình chính
      } else {
        Alert.alert(
          "Thông báo",
          "Không tìm thấy thông tin người dùng. Vui lòng cập nhật lại thông tin."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      let message = "Đăng nhập thất bại. Vui lòng thử lại.";

      switch (err.code) {
        case "auth/user-not-found":
          message = "Email chưa được đăng ký.";
          break;
        case "auth/wrong-password":
          message = "Mật khẩu không đúng.";
          break;
        case "auth/invalid-email":
          message = "Email không hợp lệ.";
          break;
        case "auth/network-request-failed":
          message = "Lỗi mạng. Kiểm tra kết nối Internet.";
          break;
        default:
          break;
      }

      setError(message);
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Ảnh nền đầu trang */}
          <Image
            source={require("../assets/background.png")}
            style={styles.headerImage}
            resizeMode="cover"
          />

          {/* Phần nội dung chính */}
          <View style={styles.container}>
            <Text style={styles.title}>Chào mừng bạn</Text>
            <Text style={styles.subtitle}>Đăng nhập tài khoản</Text>

            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Mật khẩu"
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
                onPress={() => setShowPassword(!showPassword)}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.checkbox}>
                <Ionicons name="checkmark-circle" size={18} color="green" />
                <Text style={styles.rememberText}> Nhớ tài khoản</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>Hoặc</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialIcon}>
                <Image source={require("../assets/google.png")} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialIcon}>
                <Image source={require("../assets/facebook.png")} style={styles.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text>Bạn không có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.registerText}>Tạo tài khoản</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerImage: {
    width: "100%",
    height: 180,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  container: {
    backgroundColor: "#fff",
    marginTop: -40,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "green",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    color: "green",
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#888",
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  socialIcon: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 50,
  },
  icon: {
    width: 30,
    height: 30,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  registerText: {
    color: "green",
    fontWeight: "bold",
  },
});

export default LoginScreen;
