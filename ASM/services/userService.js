import { auth, db } from "../config/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Đảm bảo document người dùng tồn tại
const ensureUserDocument = async (userId, email) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Tạo document người dùng với thông tin cơ bản
      const userData = {
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(userRef, userData);
      console.log("Created new user document");
      return userData;
    }
    
    return userDoc.data();
  } catch (error) {
    console.error("Error ensuring user document:", error);
    return null;
  }
};

// Lấy thông tin người dùng
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    // Nếu không tìm thấy profile, tạo profile mới
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Lưu thông tin người dùng
export const saveUserProfile = async (userId, userData) => {
  console.log("Saving user profile for userId:", userId);
  
  if (!userId || !userData) {
    console.error("Invalid userId or userData");
    return false;
  }

  try {
    // Kiểm tra xem người dùng có đăng nhập không
    const currentUser = auth.currentUser;
    console.log("Current user:", currentUser?.uid);
    
    if (!currentUser || currentUser.uid !== userId) {
      console.error("User not authenticated or trying to modify another user's data");
      return false;
    }

    // Chuẩn bị dữ liệu
    const updatedData = {
      ...userData,
      updatedAt: new Date().toISOString()
    };

    if (!userData.createdAt) {
      updatedData.createdAt = new Date().toISOString();
    }

    // Lưu vào Firestore
    console.log("Saving to Firestore...");
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updatedData, { merge: true });
    console.log("Saved to Firestore successfully");
    
    // Lưu vào AsyncStorage
    console.log("Updating cache...");
    await AsyncStorage.setItem(`userProfile_${userId}`, JSON.stringify(updatedData));
    console.log("Cache updated successfully");
    
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      stack: error.stack
    });
    return false;
  }
};

// Tạo hoặc cập nhật profile của user
export const updateUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, "users", userId), {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Xóa thông tin người dùng khỏi cache
export const clearUserCache = async (userId) => {
  try {
    await AsyncStorage.removeItem(`userProfile_${userId}`);
    return true;
  } catch (error) {
    console.error("Error clearing user cache:", error);
    return false;
  }
}; 