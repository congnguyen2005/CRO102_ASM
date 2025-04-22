import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../config/firebaseConfig";
import { getUserProfile, clearUserCache } from "../services/userService";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState({
    fullName: "Người dùng",
    email: "example@gmail.com",
    phoneNumber: "",
    avatar: null
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedName = await AsyncStorage.getItem("profile_name");
        const storedEmail = await AsyncStorage.getItem("profile_email");
        const storedPhone = await AsyncStorage.getItem("profile_phone");
        const storedAvatar = await AsyncStorage.getItem("profile_avatar");

        setUserProfile(prev => ({
          ...prev,
          fullName: storedName || prev.fullName,
          email: storedEmail || prev.email,
          phoneNumber: storedPhone || "",
          avatar: storedAvatar || null
        }));
      } catch (error) {
        console.error("Lỗi khi tải thông tin người dùng:", error);
      }
    };

    const unsubscribe = navigation.addListener("focus", loadProfile);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        await clearUserCache(currentUser.uid);
      }
      await auth.signOut();
      await AsyncStorage.removeItem("savedEmail");
      await AsyncStorage.removeItem("savedPassword");
      navigation.navigate("Login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={
            userProfile.avatar
              ? { uri: userProfile.avatar }
              : require("../assets/avatar.png")
          }
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userProfile.fullName}</Text>
          <Text style={styles.email}>{userProfile.email}</Text>
          {userProfile.phoneNumber ? (
            <Text style={styles.phone}>{userProfile.phoneNumber}</Text>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Chung</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("EditProfile")}>
          <Text style={styles.optionText}>✏️  Chỉnh sửa thông tin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("PlantGuide")}>
          <Text style={styles.optionText}>🌱  Cẩm nang trồng cây</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("HistoryScreen")}>
          <Text style={styles.optionText}>🧾  Lịch sử giao dịch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("QA")}>
          <Text style={styles.optionText}>❓  Q & A</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bảo mật & Điều khoản</Text>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("TermsConditions")}>
          <Text style={styles.optionText}>📄  Điều khoản & điều kiện</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("PrivacyPolicy")}>
          <Text style={styles.optionText}>🔒  Chính sách quyền riêng tư</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.logout}>🚪  Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
    padding: 16
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#4CAF50",
    backgroundColor: "#e0e0e0"
  },
  userInfo: {
    marginLeft: 16
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4
  },
  email: {
    color: "gray"
  },
  phone: {
    color: "gray",
    marginTop: 4
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12
  },
  option: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  optionText: {
    fontSize: 15
  },
  logout: {
    fontSize: 15,
    color: "red",
    fontWeight: "bold",
    paddingVertical: 10
  }
});

export default ProfileScreen;
