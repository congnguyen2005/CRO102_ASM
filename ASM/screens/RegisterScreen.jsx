import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig"; // Giả sử bạn đã cấu hình firebase và firestore
import { doc, setDoc } from "firebase/firestore"; // Thêm Firestore để lưu thông tin người dùng

const { width } = Dimensions.get("window");

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState(""); // Họ tên
  const [phone, setPhone] = useState(""); // Số điện thoại
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    if (!email.trim() || !password || !confirmPassword || !fullName || !phone) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu và xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // Đăng ký thành công, lưu thông tin người dùng vào Firestore
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        phone,
        email: user.email,
        createdAt: new Date(),
      });

      // Đăng ký thành công, có thể xử lý thêm thông tin người dùng nếu cần
      Alert.alert("Đăng ký thành công", "Bạn đã đăng ký tài khoản thành công.");
      navigation.replace("Login"); // Chuyển hướng về màn hình login
    } catch (err) {
      console.error("Register error:", err);
      let message = "Đăng ký thất bại. Vui lòng thử lại.";

      switch (err.code) {
        case "auth/email-already-in-use":
          message = "Email đã được sử dụng.";
          break;
        case "auth/invalid-email":
          message = "Email không hợp lệ.";
          break;
        case "auth/weak-password":
          message = "Mật khẩu quá yếu.";
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
            <Text style={styles.subtitle}>Tạo tài khoản mới</Text>

            <TextInput
              placeholder="Họ và tên"
              style={styles.input}
              onChangeText={setFullName}
              value={fullName}
            />
            <TextInput
              placeholder="Số điện thoại"
              style={styles.input}
              keyboardType="phone-pad"
              onChangeText={setPhone}
              value={phone}
            />
            <TextInput
              placeholder="Email"
              style={styles.input}
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
            
<View style={styles.passwordContainer}>
  <TextInput
    placeholder="Mật khẩu"
    style={styles.passwordInput}
    secureTextEntry={!showPassword}
    onChangeText={setPassword}
    value={password}
  />
  <Ionicons
    name={showPassword ? "eye-outline" : "eye-off-outline"}
    size={20}
    color="#999"
    onPress={() => setShowPassword(!showPassword)}
  />
</View>
<View style={styles.passwordContainer}>
  <TextInput
    placeholder="Xác nhận mật khẩu"
    style={styles.passwordInput}
    secureTextEntry={!showPassword}
    onChangeText={setConfirmPassword}
    value={confirmPassword}
  />
  <Ionicons
    name={showPassword ? "eye-outline" : "eye-off-outline"}
    size={20}
    color="#999"
    onPress={() => setShowPassword(!showPassword)}
  />
</View>


            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerText}>Đăng ký</Text>
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
              <Text>Bạn đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>Đăng nhập</Text>
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
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  registerButton: {
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: {
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
  loginText: {
    color: "green",
    fontWeight: "bold",
  },
});

export default RegisterScreen;
