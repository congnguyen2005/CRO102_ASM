import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { BlurView } from 'expo-blur';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }
    setLoading(true);
    
    try {
      console.log("Bắt đầu đăng ký với email:", email);
      await createUserWithEmailAndPassword(auth, email, password);
      console.log("Đăng ký thành công!");
      
      Alert.alert("Thành công", "Đăng ký thành công!");
      navigation.replace("Login");
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      Alert.alert("Lỗi đăng ký", error.message);
    }
    
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <LinearGradient 
        colors={["#4CAF50", "#2E7D32", "#1B5E20"]} 
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <BlurView intensity={80} style={styles.blurContainer}>
              <Image 
                source={require("../assets/avata.png")} 
                style={styles.image} 
              />
              <Text style={styles.title}>Tạo tài khoản</Text>

              <View style={styles.inputContainer}>
                <Icon name="envelope" size={20} color="#4CAF50" style={styles.icon} />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#888"
                  style={styles.input}
                  onChangeText={setEmail}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Icon name="lock" size={20} color="#4CAF50" style={styles.icon} />
                <TextInput
                  placeholder="Mật khẩu"
                  placeholderTextColor="#888"
                  style={styles.input}
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                />
              </View>

              <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleRegister} 
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Đăng ký</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={() => navigation.navigate("Login")}
              >
                <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  blurContainer: {
    padding: 30,
    alignItems: "center",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    width: "100%",
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RegisterScreen;