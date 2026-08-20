import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC7_1Q49dAJHB8jNAeeo4zmV_w9F1hSZS8",
  authDomain: "krotek-e768b.firebaseapp.com",
  projectId: "krotek-e768b",
  storageBucket: "krotek-e768b.firebasestorage.app",
  messagingSenderId: "60772250353",
  appId: "1:60772250353:web:50bda931bb407bac0e2f50",
  measurementId: "G-PL44QQ9CXW"
};

const app = initializeApp(firebaseConfig);
export const secondaryApp = initializeApp(firebaseConfig, 'Secondary');
export const auth = getAuth(app);
export const secondaryAuth = getAuth(secondaryApp);
export const db = getFirestore(app);
export const storage = getStorage(app);
