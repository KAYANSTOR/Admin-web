import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBq0BXktt8KtzmiLEilf_XcD8ZgWsfsfu0",
  authDomain: "netcard-pro.firebaseapp.com",
  projectId: "netcard-pro",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Checking rules directly...");

const unsub = onSnapshot(collection(db, 'users'), 
  (snap) => {
    console.log("SUCCESS! Got", snap.size, "users");
    process.exit(0);
  },
  (err) => {
    console.error("ERROR from snapshot listener:", err.message);
    process.exit(0);
  }
);
