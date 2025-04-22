import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, getDoc, setDoc, doc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyC8sJehNDw_0v7rXKNCRU6IOQ7UDd8PKV8",
  authDomain: "asm-cro102-466a9.firebaseapp.com",
  projectId: "asm-cro102-466a9",
  storageBucket: "asm-cro102-466a9.appspot.com",
  messagingSenderId: "761658028644",
  appId: "1:761658028644:web:a1b2c3d4e5f6g7h8i9j0"
};

let app;
// Kiểm tra xem Firebase đã được khởi tạo chưa
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to save user profile
export const saveUserProfile = async (userId, userData) => {
  if (!userId || !userData) {
    console.error("Invalid userId or userData");
    return false;
  }

  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem(`userProfile_${userId}`, JSON.stringify(userData));
    
    // Save to Firestore
    await setDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

// Function to get user profile
export const getUserProfile = async (userId) => {
  if (!userId) {
    console.error("Invalid userId");
    return null;
  }

  try {
    // Check if user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("User not authenticated");
      return null;
    }

    // Try AsyncStorage first
    const cachedData = await AsyncStorage.getItem(`userProfile_${userId}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If no cache, try Firestore
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Update cache
      await AsyncStorage.setItem(`userProfile_${userId}`, JSON.stringify(userData));
      return userData;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Function to check if user is logged in
export const checkAuth = async () => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export { auth, db, storage };