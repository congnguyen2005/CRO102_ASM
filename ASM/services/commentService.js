import { db, auth } from "../config/firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  doc, 
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";

// Lấy thông tin người dùng từ Firestore
const getUserInfo = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

// Lấy danh sách comments của một sản phẩm
export const getProductComments = async (productId) => {
  try {
    const commentsRef = collection(db, "comments");
    // Chỉ sử dụng where mà không dùng orderBy để tránh cần composite index
    const q = query(
      commentsRef,
      where("productId", "==", productId)
    );
    
    const querySnapshot = await getDocs(q);
    const comments = [];
    
    for (const doc of querySnapshot.docs) {
      const commentData = doc.data();
      const createdAt = commentData.createdAt?.toDate?.() || new Date();
      
      // Lấy thông tin người dùng cho mỗi comment
      const userInfo = await getUserInfo(commentData.userId);
      
      comments.push({
        id: doc.id,
        ...commentData,
        createdAt: createdAt.toISOString(),
        userInfo: userInfo || {
          fullName: commentData.userEmail.split('@')[0],
          photoURL: null
        }
      });
    }
    
    // Sắp xếp comments theo thời gian tạo (mới nhất lên đầu) ở phía client
    return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
};

// Thêm comment mới
export const addComment = async (productId, content) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Vui lòng đăng nhập để bình luận");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Nội dung bình luận không được để trống");
    }

    // Lấy thông tin người dùng hiện tại
    const userInfo = await getUserInfo(currentUser.uid);

    const commentData = {
      productId,
      userId: currentUser.uid,
      userEmail: currentUser.email,
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: null,
      isEdited: false,
      userInfo: userInfo || {
        fullName: currentUser.email.split('@')[0],
        photoURL: null
      }
    };

    const docRef = await addDoc(collection(db, "comments"), commentData);
    
    return {
      id: docRef.id,
      ...commentData,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Cập nhật comment
export const updateComment = async (commentId, content) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Vui lòng đăng nhập để sửa bình luận");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Nội dung bình luận không được để trống");
    }

    const commentRef = doc(db, "comments", commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("Không tìm thấy bình luận");
    }

    const commentData = commentDoc.data();
    if (commentData.userId !== currentUser.uid) {
      throw new Error("Bạn không có quyền sửa bình luận này");
    }

    await updateDoc(commentRef, {
      content: content.trim(),
      updatedAt: serverTimestamp(),
      isEdited: true
    });

    return {
      ...commentData,
      content: content.trim(),
      updatedAt: new Date().toISOString(),
      isEdited: true
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

// Xóa comment
export const deleteComment = async (commentId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("Vui lòng đăng nhập để xóa bình luận");
    }

    const commentRef = doc(db, "comments", commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("Không tìm thấy bình luận");
    }

    const commentData = commentDoc.data();
    if (commentData.userId !== currentUser.uid) {
      throw new Error("Bạn không có quyền xóa bình luận này");
    }

    await deleteDoc(commentRef);
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
}; 