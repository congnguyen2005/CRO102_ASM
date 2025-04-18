import React, { useState, useEffect } from "react";
import {View,Text,TextInput,TouchableOpacity,Image,Alert,StyleSheet} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        const savedPassword = await AsyncStorage.getItem("savedPassword");
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log("Lỗi khi tải dữ liệu đăng nhập: ", error);
      }
    };
    loadSavedCredentials();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Đăng nhập thành công!");
      if (rememberMe) {
        await AsyncStorage.setItem("savedEmail", email);
        await AsyncStorage.setItem("savedPassword", password);
      } else {
        await AsyncStorage.removeItem("savedEmail");
        await AsyncStorage.removeItem("savedPassword");
      }
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("Lỗi đăng nhập!", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Image source={require("../assets/back.png")} style={styles.headerImage} />
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Chào mừng bạn</Text>
        <Text style={styles.subtitle}>Đăng nhập tài khoản</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập email hoặc số điện thoại"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={styles.rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <Ionicons
              name={rememberMe ? "checkbox" : "checkbox-outline"}
              size={18}
              color={rememberMe ? "#28a745" : "gray"}
            />
            <Text style={styles.rememberText}>Nhớ tài khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot Password ?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginText}>Đăng nhập</Text>
        </TouchableOpacity>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="google" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <FontAwesome name="facebook" size={24} color="blue" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>
            Bạn không có tài khoản? <Text style={styles.registerLink}>Tạo tài khoản</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  headerContainer: { position: "relative" },
  headerImage: { width: "100%", height: 220, borderBottomRightRadius: 50 },
  formContainer: { flex: 1, padding: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 16, color: "gray", marginBottom: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", borderRadius: 10, paddingHorizontal: 10, marginBottom: 10, width: "100%" },
  input: { flex: 1, height: 45 },
  row: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 10 },
  rememberMe: { flexDirection: "row", alignItems: "center" },
  rememberText: { marginLeft: 5, color: "gray" },
  forgotPassword: { color: "#2D9CDB", fontWeight: "bold" },
  loginButton: { backgroundColor: "#28a745", padding: 15, borderRadius: 10, width: "100%", alignItems: "center", marginBottom: 10 },
  loginText: { color: "white", fontSize: 16, fontWeight: "bold" },
  orContainer: { flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: "#ccc" },
  orText: { marginHorizontal: 10, color: "gray" },
  socialContainer: { flexDirection: "row", justifyContent: "center", width: "100%", marginBottom: 20 },
  socialButton: { marginHorizontal: 20 },
  registerText: { color: "gray" },
  registerLink: { color: "#2D9CDB", fontWeight: "bold" }
});

export default LoginScreen;