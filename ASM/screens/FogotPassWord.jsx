import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { FontAwesome } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const FogotPassWord = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Vui lòng nhập email của bạn");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Thành công",
        "Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Email không hợp lệ";
          break;
        case "auth/user-not-found":
          errorMessage = "Không tìm thấy tài khoản với email này";
          break;
        case "auth/too-many-requests":
          errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau";
          break;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#A8E063", "#56AB2F"]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <BlurView intensity={90} tint="light" style={styles.blurCard}>
            <Image 
              source={require("../assets/background.png")} 
              style={styles.logo}
            />
            <Text style={styles.title}>Quên Mật Khẩu</Text>
            <Text style={styles.subtitle}>
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </Text>

            <View style={styles.inputWrapper}>
              <FontAwesome name="envelope" size={20} color="#444" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#666"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetText}>Gửi Email Đặt Lại</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Quay lại đăng nhập</Text>
            </TouchableOpacity>
          </BlurView>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: "center"
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center"
  },
  blurCard: {
    width: width * 0.9,
    borderRadius: 20,
    padding: 25,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 20
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2E7D32",
    textAlign: "center"
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20
  },
  inputWrapper: {
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  inputIcon: {
    marginRight: 10
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: "#000"
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5
  },
  resetButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  },
  backButton: {
    marginTop: 15,
    alignItems: "center"
  },
  backText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "500"
  }
});

export default FogotPassWord;
