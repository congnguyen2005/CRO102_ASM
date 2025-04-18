import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Cấu hình Firebase của bạn
const firebaseConfig = {
  apiKey: "AIzaSyC8sJehNDw_0v7rXKNCRU6IOQ7UDd8PKV8",
  authDomain: "asm-cro102.firebaseapp.com",
  projectId: "asm-cro102",
  storageBucket: "asm-cro102.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};

// Khởi tạo Firebase App
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error("Lỗi khởi tạo Firebase App:", error);
  throw error;
}

// Khởi tạo các dịch vụ Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Kiểm tra môi trường và cấu hình CORS cho Storage
if (__DEV__) {
  try {
    connectStorageEmulator(storage, 'localhost', 9199);
  } catch (error) {
    console.warn('Không thể kết nối Storage Emulator:', error);
  }
}

// Kiểm tra kết nối
const checkConnection = async () => {
  console.log('🔄 Bắt đầu kiểm tra kết nối Firebase...');
  try {
    // Kiểm tra Storage
    if (!storage) {
      console.error('❌ Storage: Chưa được khởi tạo');
      throw new Error('Storage chưa được khởi tạo');
    }
    if (!storage.app) {
      console.error('❌ Storage: App không tồn tại');
      throw new Error('Storage app không tồn tại');
    }
    console.log('✅ Storage: Đã khởi tạo thành công');
    console.log('📦 Storage Bucket:', storage.app.options.storageBucket);

    // Kiểm tra Firestore
    if (!db) {
      console.error('❌ Firestore: Chưa được khởi tạo');
      throw new Error('Firestore chưa được khởi tạo');
    }
    console.log('✅ Firestore: Đã khởi tạo thành công');
    console.log('🏢 Project ID:', db.app.options.projectId);

    // Kiểm tra Auth
    if (!auth) {
      console.error('❌ Auth: Chưa được khởi tạo');
      throw new Error('Auth chưa được khởi tạo');
    }
    console.log('✅ Auth: Đã khởi tạo thành công');
    if (auth.currentUser) {
      console.log('👤 Người dùng hiện tại:', auth.currentUser.email);
    } else {
      console.log('ℹ️ Chưa có người dùng đăng nhập');
    }

    console.log('✅ Tất cả dịch vụ Firebase đã sẵn sàng!');
    return true;
  } catch (error) {
    console.error('❌ Lỗi kết nối Firebase:', error.message);
    return false;
  }
};

// Chạy kiểm tra kết nối
checkConnection().then(isConnected => {
  if (isConnected) {
    console.log('✅ Kết nối Firebase thành công!');
  } else {
    console.error('❌ Kết nối Firebase thất bại!');
  }
});

// Hàm lấy Storage đã xác thực
const getAuthenticatedStorage = () => {
  if (!auth.currentUser) {
    throw new Error('Vui lòng đăng nhập để sử dụng tính năng này');
  }
  
  if (!storage) {
    throw new Error('Storage chưa được khởi tạo');
  }

  // Kiểm tra bucket
  if (!storage.app.options.storageBucket) {
    throw new Error('Storage bucket chưa được cấu hình');
  }

  return storage;
};

export { 
  app, 
  auth, 
  db, 
  storage, 
  getAuthenticatedStorage,
  checkConnection 
};